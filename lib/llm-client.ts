// 多模型 LLM 客户端，支持 OpenAI 和 Anthropic 协议

import { supabaseAdmin } from "./supabase-server"

export interface LLMConfig {
  id: string
  name: string
  url: string
  api_key: string
  protocol: "openai" | "anthropic"
  model: string
  priority: number
  enabled: boolean
}

interface LLMResponse {
  content: string
  provider: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
  }
}

/**
 * 从数据库获取 LLM 配置
 */
async function getLLMConfigs(): Promise<LLMConfig[]> {
  const { data, error } = await supabaseAdmin
    .from("llm_configs")
    .select("*")
    .eq("enabled", true)
    .order("priority", { ascending: true })

  if (error || !data || data.length === 0) {
    // 如果数据库没有配置，尝试用环境变量
    return getEnvConfigs()
  }

  return data
}

/**
 * 从环境变量获取配置（fallback）
 */
function getEnvConfigs(): LLMConfig[] {
  const configs: LLMConfig[] = []

  if (process.env.MIMO_API_KEY) {
    configs.push({
      id: "mimo",
      name: "小米 MiMo",
      url: process.env.MIMO_URL || "https://token-plan-cn.xiaomimimo.com/anthropic",
      api_key: process.env.MIMO_API_KEY,
      protocol: "anthropic",
      model: process.env.MIMO_MODEL || "mimo-v2.5-pro",
      priority: 1,
      enabled: true,
    })
  }

  if (process.env.DEEPSEEK_API_KEY) {
    configs.push({
      id: "deepseek",
      name: "DeepSeek",
      url: process.env.DEEPSEEK_URL || "https://api.deepseek.com",
      api_key: process.env.DEEPSEEK_API_KEY,
      protocol: "openai",
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      priority: 2,
      enabled: true,
    })
  }

  if (process.env.OPENAI_API_KEY) {
    configs.push({
      id: "openai",
      name: "OpenAI",
      url: process.env.OPENAI_URL || "https://api.openai.com/v1",
      api_key: process.env.OPENAI_API_KEY,
      protocol: "openai",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      priority: 3,
      enabled: true,
    })
  }

  return configs
}

export class LLMClient {
  private configs: LLMConfig[]
  private configPromise: Promise<LLMConfig[]>

  constructor() {
    this.configPromise = getLLMConfigs()
    this.configs = []
  }

  private async ensureConfigs(): Promise<LLMConfig[]> {
    if (this.configs.length === 0) {
      this.configs = await this.configPromise
    }
    return this.configs
  }

  /**
   * 发送聊天请求
   */
  async chat(
    prompt: string,
    options?: {
      providerId?: string
      maxTokens?: number
      temperature?: number
    }
  ): Promise<LLMResponse> {
    const configs = await this.ensureConfigs()

    if (configs.length === 0) {
      throw new Error("No LLM provider configured. Please add a model in parent settings.")
    }

    // 如果指定了 provider，优先使用
    let provider: LLMConfig | undefined
    if (options?.providerId) {
      provider = configs.find((c) => c.id === options.providerId)
      if (!provider) {
        throw new Error(`Provider "${options.providerId}" not found or not enabled`)
      }
    } else {
      provider = configs[0]
    }

    // 尝试当前 provider，失败则 fallback
    try {
      return await this.callProvider(provider, prompt, options)
    } catch (error) {
      console.warn(`[LLM] ${provider.name} failed:`, error)
      return await this.callWithFallback(prompt, provider.id, options)
    }
  }

  /**
   * Fallback 机制
   */
  private async callWithFallback(
    prompt: string,
    failedId: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<LLMResponse> {
    const configs = await this.ensureConfigs()
    const fallbacks = configs.filter((c) => c.id !== failedId)

    for (const provider of fallbacks) {
      try {
        console.log(`[LLM] Trying fallback: ${provider.name}`)
        return await this.callProvider(provider, prompt, options)
      } catch (error) {
        console.warn(`[LLM] ${provider.name} also failed:`, error)
        continue
      }
    }

    throw new Error("All LLM providers failed")
  }

  /**
   * 调用具体的 provider
   */
  private async callProvider(
    config: LLMConfig,
    prompt: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<LLMResponse> {
    const maxTokens = options?.maxTokens || 4000
    const temperature = options?.temperature || 0.7

    if (config.protocol === "anthropic") {
      return this.callAnthropic(config, prompt, maxTokens, temperature)
    } else {
      return this.callOpenAI(config, prompt, maxTokens, temperature)
    }
  }

  /**
   * Anthropic 协议调用
   */
  private async callAnthropic(
    config: LLMConfig,
    prompt: string,
    maxTokens: number,
    temperature: number
  ): Promise<LLMResponse> {
    const url = config.url.endsWith("/v1/messages")
      ? config.url
      : `${config.url}/v1/messages`

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.api_key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Anthropic API error (${res.status}): ${error}`)
    }

    const data = await res.json()

    return {
      content: data.content[0].text,
      provider: config.id,
      model: config.model,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
      },
    }
  }

  /**
   * OpenAI 协议调用
   */
  private async callOpenAI(
    config: LLMConfig,
    prompt: string,
    maxTokens: number,
    temperature: number
  ): Promise<LLMResponse> {
    const url = config.url.endsWith("/chat/completions")
      ? config.url
      : `${config.url}/chat/completions`

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.api_key}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`OpenAI API error (${res.status}): ${error}`)
    }

    const data = await res.json()

    return {
      content: data.choices[0].message.content,
      provider: config.id,
      model: config.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
      },
    }
  }
}

// 单例实例
let llmClientInstance: LLMClient | null = null

export function getLLMClient(): LLMClient {
  if (!llmClientInstance) {
    llmClientInstance = new LLMClient()
  }
  return llmClientInstance
}

/**
 * 测试 LLM 连接
 */
export async function testLLMConnection(config: {
  url: string
  api_key: string
  protocol: "openai" | "anthropic"
  model: string
}): Promise<{ success: boolean; message: string; latency?: number }> {
  const startTime = Date.now()

  try {
    const testPrompt = "Say 'Hello' in one word."

    if (config.protocol === "anthropic") {
      const url = config.url.endsWith("/v1/messages")
        ? config.url
        : `${config.url}/v1/messages`

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.api_key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 50,
          messages: [{ role: "user", content: testPrompt }],
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        return {
          success: false,
          message: `HTTP ${res.status}: ${error.error?.message || res.statusText}`,
        }
      }

      await res.json()
    } else {
      const url = config.url.endsWith("/chat/completions")
        ? config.url
        : `${config.url}/chat/completions`

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.api_key}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: testPrompt }],
          max_tokens: 50,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        return {
          success: false,
          message: `HTTP ${res.status}: ${error.error?.message || res.statusText}`,
        }
      }

      await res.json()
    }

    const latency = Date.now() - startTime
    return {
      success: true,
      message: `连接成功！响应时间 ${latency}ms`,
      latency,
    }
  } catch (error) {
    return {
      success: false,
      message: `连接失败: ${error instanceof Error ? error.message : "未知错误"}`,
    }
  }
}
