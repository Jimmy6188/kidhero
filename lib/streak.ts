import { supabaseAdmin } from "./supabase-server"
import { STREAK_REWARDS, MAX_RESCUE_PER_MONTH, RESCUE_WINDOW_HOURS } from "./constants"

export async function updateStreak(
  kidId: string
): Promise<{ current: number; reward: number | null }> {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  const { data: streak } = await supabaseAdmin
    .from("streaks")
    .select("*")
    .eq("kid_id", kidId)
    .single()

  if (!streak) {
    await supabaseAdmin.from("streaks").insert({
      kid_id: kidId,
      current_streak: 1,
      best_streak: 1,
      last_check_in: todayStr,
      rescue_count: 0,
    })
    return { current: 1, reward: null }
  }

  const lastCheckIn = streak.last_check_in
  if (!lastCheckIn) {
    await supabaseAdmin
      .from("streaks")
      .update({ current_streak: 1, last_check_in: todayStr })
      .eq("kid_id", kidId)
    return { current: 1, reward: null }
  }

  const lastDate = new Date(lastCheckIn)
  const diffDays = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  let newStreak = streak.current_streak
  let reward: number | null = null

  if (diffDays === 0) {
    return { current: newStreak, reward: null }
  } else if (diffDays === 1) {
    newStreak += 1
  } else {
    newStreak = 1
  }

  if (STREAK_REWARDS[newStreak]) {
    reward = STREAK_REWARDS[newStreak]
    await supabaseAdmin.from("points_log").insert({
      kid_id: kidId,
      amount: reward,
      reason: `连续打卡 ${newStreak} 天奖励`,
    })
  }

  const bestStreak = Math.max(newStreak, streak.best_streak)

  await supabaseAdmin
    .from("streaks")
    .update({
      current_streak: newStreak,
      best_streak: bestStreak,
      last_check_in: todayStr,
    })
    .eq("kid_id", kidId)

  return { current: newStreak, reward }
}

export async function rescueStreak(
  kidId: string
): Promise<{ success: boolean; message: string }> {
  const { data: streak } = await supabaseAdmin
    .from("streaks")
    .select("*")
    .eq("kid_id", kidId)
    .single()

  if (!streak) {
    return { success: false, message: "没有打卡记录" }
  }

  if (streak.rescue_count >= MAX_RESCUE_PER_MONTH) {
    return { success: false, message: "本月补签次数已用完" }
  }

  const lastCheckIn = new Date(streak.last_check_in)
  const now = new Date()
  const diffHours =
    (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60)

  if (diffHours > RESCUE_WINDOW_HOURS) {
    return { success: false, message: "已超过 48 小时，无法补签" }
  }

  const newStreak = streak.current_streak + 1
  const bestStreak = Math.max(newStreak, streak.best_streak)

  await supabaseAdmin
    .from("streaks")
    .update({
      current_streak: newStreak,
      best_streak: bestStreak,
      rescue_count: streak.rescue_count + 1,
    })
    .eq("kid_id", kidId)

  return { success: true, message: `补签成功！连续打卡 ${newStreak} 天` }
}