export const BADGE_DEFINITIONS = [
  { name: "初出茅庐", icon: "🌱", description: "完成第一次打卡", category: "general" as const, condition: { type: "first_checkin" } },
  { name: "三日行者", icon: "🔥", description: "连续打卡 3 天", category: "general" as const, condition: { type: "streak", days: 3 } },
  { name: "一周战士", icon: "⚔️", description: "连续打卡 7 天", category: "general" as const, condition: { type: "streak", days: 7 } },
  { name: "百分达人", icon: "💯", description: "累计获得 100 积分", category: "general" as const, condition: { type: "total_points", points: 100 } },
  { name: "森林守护者", icon: "🌲", description: "解锁绿野森林所有任务", category: "general" as const, condition: { type: "region", region: "forest" } },
  { name: "算术小能手", icon: "🧮", description: "数学连续答对 10 题", category: "learning" as const, condition: { type: "subject_streak", subject: "math", count: 10 } },
  { name: "语文小作家", icon: "✍️", description: "完成 20 道语文题", category: "learning" as const, condition: { type: "subject_total", subject: "chinese", count: 20 } },
  { name: "英语小达人", icon: "🌍", description: "掌握 50 个英语单词", category: "learning" as const, condition: { type: "subject_total", subject: "english", count: 50 } },
  { name: "挑战赛冠军", icon: "🏆", description: "完成周末挑战赛", category: "learning" as const, condition: { type: "challenge_complete" } },
  { name: "错题终结者", icon: "📚", description: "纠错本清空一次", category: "learning" as const, condition: { type: "error_book_empty" } },
]