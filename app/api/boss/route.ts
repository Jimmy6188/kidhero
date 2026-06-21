// Boss 挑战 API

import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { REGION_BOSSES, REGION_BADGES } from "@/lib/constants"

// 获取 Boss 状态
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const kidId = searchParams.get("kid_id")

    if (!kidId) {
      return NextResponse.json({ error: "kid_id is required" }, { status: 400 })
    }

    // 获取孩子的积分
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("points")
      .eq("id", kidId)
      .single()

    const totalPoints = userData?.points || 0

    // 获取已击败的 Boss
    const { data: defeatedBosses } = await supabaseAdmin
      .from("boss_challenges")
      .select("boss_id")
      .eq("kid_id", kidId)
      .eq("status", "victory")

    const defeatedIds = defeatedBosses?.map(b => b.boss_id) || []

    // 构建 Boss 列表
    const bosses = REGION_BOSSES.map(boss => {
      const canChallenge = totalPoints >= boss.challengePoints
      const isDefeated = defeatedIds.includes(boss.id)

      return {
        ...boss,
        canChallenge,
        isDefeated,
      }
    })

    return NextResponse.json({ bosses, totalPoints })
  } catch {
    return NextResponse.json({ error: "Failed to get boss status" }, { status: 500 })
  }
}

// 开始 Boss 挑战
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { kid_id, boss_id } = body

    if (!kid_id || !boss_id) {
      return NextResponse.json({ error: "kid_id and boss_id are required" }, { status: 400 })
    }

    // 查找 Boss 配置
    const boss = REGION_BOSSES.find(b => b.id === boss_id)
    if (!boss) {
      return NextResponse.json({ error: "Boss not found" }, { status: 404 })
    }

    // 检查积分是否足够
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("points")
      .eq("id", kid_id)
      .single()

    if (!userData || userData.points < boss.challengePoints) {
      return NextResponse.json({ error: "积分不足，无法挑战" }, { status: 400 })
    }

    // 检查是否已经击败
    const { data: existing } = await supabaseAdmin
      .from("boss_challenges")
      .select("id")
      .eq("kid_id", kid_id)
      .eq("boss_id", boss_id)
      .eq("status", "victory")
      .single()

    if (existing) {
      return NextResponse.json({ error: "已经击败过这个 Boss" }, { status: 400 })
    }

    // 创建挑战记录
    const { data: challenge, error } = await supabaseAdmin
      .from("boss_challenges")
      .insert({
        kid_id,
        boss_id,
        status: "in_progress",
        score: 0,
        total: boss.challengeCount,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ challenge, boss })
  } catch {
    return NextResponse.json({ error: "Failed to start challenge" }, { status: 500 })
  }
}

// 提交挑战结果
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { challenge_id, kid_id, boss_id, score, total } = body

    if (!challenge_id || !kid_id || !boss_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const boss = REGION_BOSSES.find(b => b.id === boss_id)
    if (!boss) {
      return NextResponse.json({ error: "Boss not found" }, { status: 404 })
    }

    // 判断是否胜利（正确率 >= 70%）
    const accuracy = (score / total) * 100
    const isVictory = accuracy >= 70

    // 更新挑战记录
    const { error: updateError } = await supabaseAdmin
      .from("boss_challenges")
      .update({
        status: isVictory ? "victory" : "defeat",
        score,
        completed_at: new Date().toISOString(),
      })
      .eq("id", challenge_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (isVictory) {
      // 发放奖励积分
      await supabaseAdmin.rpc("update_kid_points", {
        kid_id,
        points_to_add: boss.rewardPoints,
      })

      // 发放徽章
      const badge = REGION_BADGES.find(b => b.id === boss.rewardBadgeId)
      if (badge) {
        // 检查是否已有徽章
        const { data: existingBadge } = await supabaseAdmin
          .from("user_badges")
          .select("id")
          .eq("kid_id", kid_id)
          .eq("badge_id", badge.id)
          .single()

        if (!existingBadge) {
          // 查找 badges 表中的 ID
          const { data: badgeData } = await supabaseAdmin
            .from("badges")
            .select("id")
            .eq("name", badge.name)
            .single()

          if (badgeData) {
            await supabaseAdmin.from("user_badges").insert({
              kid_id,
              badge_id: badgeData.id,
            })
          }
        }
      }
    }

    return NextResponse.json({
      victory: isVictory,
      accuracy,
      rewardPoints: isVictory ? boss.rewardPoints : 0,
    })
  } catch {
    return NextResponse.json({ error: "Failed to submit challenge result" }, { status: 500 })
  }
}
