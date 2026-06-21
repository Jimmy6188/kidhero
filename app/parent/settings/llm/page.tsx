"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import BackButton from "@/components/shared/BackButton"
import { getParentSession } from "@/lib/session"

interface LLMConfig {
  id: string
  name: string
  url: string
  api_key?: string
  protocol: "openai" | "anthropic"
  model: string
  priority: number
  enabled: boolean
}

interface TestResult {
  success: boolean
  message: string
  latency?: number
}

export default function LLMSettingsPage() {
  const [configs, setConfigs] = useState<LLMConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [familyId, setFamilyId] = useState<string>("")

  // 表单状态
  const [form, setForm] = useState({
    name: "",
    url: "",
    api_key: "",
    protocol: "openai" as "openai" | "anthropic",
    model: "",
    priority: 0,
  })

  // 测试状态
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  useEffect(() => {
    const parent = getParentSession()
    if (parent?.family_id || parent?.id) {
      setFamilyId(parent.family_id || parent.id)
    }
  }, [])

  useEffect(() => {
    const loadConfigs = async () => {
      if (!familyId) return
      try {
        const res = await fetch(`/api/llm/configs?family_id=${familyId}`)
        const data = await res.json()
        setConfigs(data.configs || [])
      } catch (err) {
        console.error("Failed to load configs:", err)
      } finally {
        setLoading(false)
      }
    }

    loadConfigs()
  }, [familyId])

  const resetForm = () => {
    setForm({
      name: "",
      url: "",
      api_key: "",
      protocol: "openai",
      model: "",
      priority: 0,
    })
    setEditingId(null)
    setTestResult(null)
  }

  const handleShowForm = (config?: LLMConfig) => {
    if (config) {
      setForm({
        name: config.name,
        url: config.url,
        api_key: "", // 不显示 key
        protocol: config.protocol,
        model: config.model,
        priority: config.priority,
      })
      setEditingId(config.id)
    } else {
      resetForm()
    }
    setShowForm(true)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const res = await fetch("/api/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url,
          api_key: form.api_key,
          protocol: form.protocol,
          model: form.model,
        }),
      })

      const data = await res.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        message: `请求失败: ${error instanceof Error ? error.message : "未知错误"}`,
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.url || !form.model) {
      alert("请填写必填字段")
      return
    }

    // 新增时必须填 key
    if (!editingId && !form.api_key) {
      alert("请填写 API Key")
      return
    }

    if (!familyId) {
      alert("无法获取家庭信息，请重新登录")
      return
    }

    try {
      const method = editingId ? "PUT" : "POST"
      const body: Record<string, unknown> = {
        ...form,
        family_id: familyId,
        ...(editingId ? { id: editingId } : {}),
      }

      // 编辑时如果没填 key，不传 api_key
      if (editingId && !form.api_key) {
        delete body.api_key
      }

      const res = await fetch("/api/llm/configs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "保存失败")
        return
      }

      setShowForm(false)
      resetForm()
      window.location.reload()
    } catch {
      alert("保存失败")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个模型配置吗？")) return

    try {
      const res = await fetch(`/api/llm/configs?id=${id}&family_id=${familyId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        alert("删除失败")
        return
      }

      window.location.reload()
    } catch {
      alert("删除失败")
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await fetch("/api/llm/configs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: !enabled, family_id: familyId }),
      })
      window.location.reload()
    } catch {
      alert("操作失败")
    }
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🤖 AI 模型配置</h1>
          <p className="text-sm text-gray-500 mt-1">管理题目生成使用的 AI 模型</p>
        </div>
        <BackButton href="/parent/settings" />
      </div>

      {/* 添加按钮 */}
      <button
        onClick={() => handleShowForm()}
        className="w-full py-3 bg-blue-500 text-white font-bold rounded-2xl mb-6 cursor-pointer"
      >
        + 添加模型
      </button>

      {/* 配置列表 */}
      {configs.length === 0 ? (
        <div className="card text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>还没有配置任何模型</p>
          <p className="text-sm mt-1">点击上方按钮添加</p>
        </div>
      ) : (
        <div className="space-y-3">
          {configs.map((config) => (
            <div
              key={config.id}
              className={`card ${!config.enabled ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{config.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {config.protocol}
                    </span>
                    {config.priority === 1 && (
                      <span className="text-xs bg-blue-100 text-blue-500 px-2 py-0.5 rounded-full">
                        优先
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">模型: {config.model}</p>
                  <p className="text-xs text-gray-400 mt-1 truncate">{config.url}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(config.id, config.enabled)}
                    className={`px-3 py-1 rounded-full text-xs cursor-pointer ${
                      config.enabled
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {config.enabled ? "启用" : "禁用"}
                  </button>
                  <button
                    onClick={() => handleShowForm(config)}
                    className="text-blue-500 text-sm cursor-pointer"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="text-red-400 text-sm cursor-pointer"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 配置说明 */}
      <div className="card mt-6 bg-blue-50">
        <h3 className="font-bold text-blue-800 mb-2">💡 配置说明</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>优先级</strong>：数字越小越优先，优先使用序号 1 的模型</li>
          <li>• <strong>Fallback</strong>：如果优先模型失败，自动切换到下一个</li>
          <li>• <strong>协议</strong>：小米 MiMo 用 Anthropic，其他大多用 OpenAI</li>
          <li>• <strong>URL</strong>：填完整的 API 地址，如 https://api.openai.com/v1</li>
        </ul>
      </div>

      {/* 表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? "编辑模型" : "添加模型"}
            </h2>

            <div className="space-y-4">
              {/* 名称 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  名称 <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="如：小米 MiMo"
                  className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* 协议 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  协议 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, protocol: "openai" })}
                    className={`flex-1 py-3 rounded-2xl font-medium cursor-pointer ${
                      form.protocol === "openai"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    OpenAI
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, protocol: "anthropic" })}
                    className={`flex-1 py-3 rounded-2xl font-medium cursor-pointer ${
                      form.protocol === "anthropic"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Anthropic
                  </button>
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  API URL <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder={
                    form.protocol === "anthropic"
                      ? "https://api.anthropic.com"
                      : "https://api.openai.com/v1"
                  }
                  className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  API Key{" "}
                  {!editingId && <span className="text-red-500">*</span>}
                  {editingId && (
                    <span className="text-gray-400">（留空则不修改）</span>
                  )}
                </label>
                <input
                  type="password"
                  value={form.api_key}
                  onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                  placeholder="sk-xxxx 或 tp-xxxx"
                  className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* 模型名 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  模型名称 <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="如：gpt-4o-mini 或 mimo-v2.5-pro"
                  className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* 优先级 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  优先级（数字越小越优先）
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: parseInt(e.target.value) || 0 })
                  }
                  className="w-full p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            {/* 测试结果 */}
            {testResult && (
              <div
                className={`mt-4 p-4 rounded-2xl ${
                  testResult.success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                <p className="font-bold">
                  {testResult.success ? "✅ 成功" : "❌ 失败"}
                </p>
                <p className="text-sm mt-1">{testResult.message}</p>
              </div>
            )}

            {/* 按钮 */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleTest}
                disabled={testing || !form.url || !form.api_key || !form.model}
                className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl disabled:opacity-50 cursor-pointer"
              >
                {testing ? "测试中..." : "测试连接"}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-2xl cursor-pointer"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
