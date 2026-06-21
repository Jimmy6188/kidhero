import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// 延迟检查：只在实际使用时报错，不在构建时报错
function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL")
  }
  if (!supabaseServiceKey) {
    throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

// 延迟初始化
let _supabaseAdmin: SupabaseClient | null = null

function getOrCreateClient(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = getSupabaseAdmin()
  }
  return _supabaseAdmin
}

// 导出一个代理对象，延迟初始化
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getOrCreateClient()
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})
