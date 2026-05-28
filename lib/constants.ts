import { MapRegion } from "./types"

export const DEFAULT_TASKS = [
  { name: "整理打扫书桌", icon: "📚", category: "life" as const, points: 10 },
  { name: "整理床铺", icon: "🛏️", category: "life" as const, points: 10 },
  { name: "穿拖鞋", icon: "🩴", category: "life" as const, points: 5 },
  { name: "饭前便后洗手", icon: "🧼", category: "life" as const, points: 5 },
  { name: "按时睡觉", icon: "😴", category: "life" as const, points: 15 },
  { name: "自己洗漱", icon: "🪥", category: "life" as const, points: 10 },
  { name: "帮忙做家务", icon: "🧹", category: "life" as const, points: 15 },
  { name: "不顶嘴不发脾气", icon: "😌", category: "life" as const, points: 10 },
  { name: "吃饭不挑食", icon: "🍚", category: "life" as const, points: 10 },
  { name: "做事专注认真不墨迹", icon: "⏱️", category: "life" as const, points: 15 },
]

export const MAP_REGIONS: MapRegion[] = [
  { id: "forest", name: "绿野森林", icon: "🌲", requiredLevel: 1, requiredPoints: 0, theme: "新手村", color: "#22c55e" },
  { id: "ocean", name: "海底世界", icon: "🌊", requiredLevel: 2, requiredPoints: 200, theme: "水下冒险", color: "#3b82f6" },
  { id: "desert", name: "沙漠冒险", icon: "🏜️", requiredLevel: 3, requiredPoints: 500, theme: "耐心考验", color: "#f97316" },
  { id: "space", name: "太空基地", icon: "🚀", requiredLevel: 4, requiredPoints: 1000, theme: "科幻探索", color: "#a855f7" },
  { id: "castle", name: "王冠城堡", icon: "🏰", requiredLevel: 5, requiredPoints: 2000, theme: "终极挑战", color: "#eab308" },
]

export const LEVEL_THRESHOLDS = [
  { level: 1, name: "萌新小超人", points: 0 },
  { level: 2, name: "勇敢探索者", points: 200 },
  { level: 3, name: "智慧战士", points: 500 },
  { level: 4, name: "星空勇士", points: 1000 },
  { level: 5, name: "终极英雄", points: 2000 },
]

export const STREAK_REWARDS: Record<number, number> = {
  3: 20,
  7: 50,
  14: 100,
  30: 200,
}

export const MAX_RESCUE_PER_MONTH = 2
export const RESCUE_WINDOW_HOURS = 48
export const DAILY_QUESTIONS_COUNT = 30