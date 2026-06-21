// LLM 连接测试 API

import { NextRequest, NextResponse } from "next/server"
import { testLLMConnection } from "@/lib/llm-client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, api_key, protocol, model } = body

    // 验证必填字段
    if (!url || !api_key || !protocol || !model) {
      return NextResponse.json(
        { error: "Missing required fields: url, api_key, protocol, model" },
        { status: 400 }
      )
    }

    // 验证协议
    if (!["openai", "anthropic"].includes(protocol)) {
      return NextResponse.json(
        { error: "Protocol must be 'openai' or 'anthropic'" },
        { status: 400 }
      )
    }

    const result = await testLLMConnection({ url, api_key, protocol, model })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `测试失败: ${error instanceof Error ? error.message : "未知错误"}`,
      },
      { status: 500 }
    )
  }
}
