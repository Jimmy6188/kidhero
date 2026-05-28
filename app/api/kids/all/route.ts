import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET() {
  try {
    // Only return kids whose parent has registered (has relationship field set)
    // This filters out seed data kids that aren't linked to real registered parents
    const { data: parents, error: parentError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("role", "parent")
      .not("relationship", "is", null)

    if (parentError) {
      return NextResponse.json({ error: parentError.message }, { status: 500 })
    }

    const parentIds = (parents || []).map((p) => p.id)

    if (parentIds.length === 0) {
      return NextResponse.json({ kids: [], hasParents: false })
    }

    const { data: kids, error: kidError } = await supabaseAdmin
      .from("users")
      .select("id, name, avatar, grade, parent_id")
      .eq("role", "kid")
      .in("parent_id", parentIds)
      .order("created_at", { ascending: true })

    if (kidError) {
      return NextResponse.json({ error: kidError.message }, { status: 500 })
    }

    return NextResponse.json({
      kids: kids || [],
      hasParents: true,
      hasKids: (kids || []).length > 0,
    })
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
