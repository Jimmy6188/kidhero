export type Rarity = "common" | "rare" | "epic" | "legendary"

export const BADGE_DEFINITIONS = [
  // Common
  { name: "出击小超人", icon: "🌟", description: "完成第一次打卡", category: "general" as const, rarity: "common" as Rarity, condition: { type: "first_checkin" } },
  { name: "洗手小卫士", icon: "🧼", description: "连续 7 天完成洗手打卡", category: "general" as const, rarity: "common" as Rarity, condition: { type: "task_streak", task_name: "饭前便后洗手", days: 7 } },
  { name: "整理达人", icon: "🧹", description: "累计整理书桌/床铺 30 次", category: "general" as const, rarity: "common" as Rarity, condition: { type: "task_total", count: 30 } },
  { name: "早起勇士", icon: "⏰", description: "连续 7 天按时睡觉", category: "general" as const, rarity: "common" as Rarity, condition: { type: "task_streak", task_name: "按时睡觉", days: 7 } },
  { name: "数学冒险家", icon: "🔢", description: "完成数学练习 20 次", category: "learning" as const, rarity: "common" as Rarity, condition: { type: "subject_total", subject: "math", count: 20 } },
  { name: "英语小达人", icon: "🅰️", description: "完成英语练习 20 次", category: "learning" as const, rarity: "common" as Rarity, condition: { type: "subject_total", subject: "english", count: 20 } },
  { name: "诗词小书童", icon: "📖", description: "完成语文练习 20 次", category: "learning" as const, rarity: "common" as Rarity, condition: { type: "subject_total", subject: "chinese", count: 20 } },
  { name: "小吃货", icon: "🍽️", description: "连续 7 天饭前洗手打卡", category: "general" as const, rarity: "common" as Rarity, condition: { type: "task_streak", task_name: "饭前便后洗手", days: 7 } },
  { name: "书包管家", icon: "🎒", description: "累计收拾书包 20 次", category: "general" as const, rarity: "common" as Rarity, condition: { type: "task_total", count: 20 } },
  // Rare
  { name: "坚持一周", icon: "🔥", description: "连续打卡 7 天", category: "general" as const, rarity: "rare" as Rarity, condition: { type: "streak", days: 7 } },
  { name: "半月英雄", icon: "💪", description: "连续打卡 14 天", category: "general" as const, rarity: "rare" as Rarity, condition: { type: "streak", days: 14 } },
  // Epic
  { name: "月度冠军", icon: "👑", description: "连续打卡 30 天", category: "general" as const, rarity: "epic" as Rarity, condition: { type: "streak", days: 30 } },
  { name: "学科全勤", icon: "🏆", description: "单月语数英全部完成", category: "learning" as const, rarity: "epic" as Rarity, condition: { type: "monthly_all_subjects" } },
  { name: "生活全能王", icon: "🏠", description: "单月所有生活任务全勤", category: "general" as const, rarity: "epic" as Rarity, condition: { type: "monthly_all_tasks" } },
  // Legendary
  { name: "破万先锋", icon: "💰", description: "累计获得 10000 积分", category: "general" as const, rarity: "legendary" as Rarity, condition: { type: "total_points", points: 10000 } },
  { name: "小超人之星", icon: "✨", description: "累计获得 30000 积分", category: "general" as const, rarity: "legendary" as Rarity, condition: { type: "total_points", points: 30000 } },
  { name: "宇宙守护者", icon: "🌌", description: "累计获得 50000 积分", category: "general" as const, rarity: "legendary" as Rarity, condition: { type: "total_points", points: 50000 } },
  { name: "百日传奇", icon: "💎", description: "连续打卡 100 天", category: "general" as const, rarity: "legendary" as Rarity, condition: { type: "streak", days: 100 } },
]
