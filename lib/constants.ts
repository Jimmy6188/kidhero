import { MapRegion, RegionBoss, RegionBadge } from "./types"

export const DEFAULT_TASKS = [
  { name: "整理打扫书桌", icon: "📚", category: "life" as const, points: 10 },
  { name: "整理床铺", icon: "🛏️", category: "life" as const, points: 10 },
  { name: "穿拖鞋", icon: "👟", category: "life" as const, points: 5 },
  { name: "饭前便后洗手", icon: "🧼", category: "life" as const, points: 5 },
  { name: "按时睡觉", icon: "😴", category: "life" as const, points: 15 },
  { name: "自己洗漱", icon: "🧴", category: "life" as const, points: 10 },
  { name: "帮忙做家务", icon: "🧹", category: "life" as const, points: 15 },
  { name: "不顶嘴不发脾气", icon: "😌", category: "life" as const, points: 10 },
  { name: "吃饭不挑食", icon: "🍚", category: "life" as const, points: 10 },
  { name: "做事专注认真不墨迹", icon: "⏱️", category: "life" as const, points: 15 },
]

export const MAP_REGIONS: MapRegion[] = [
  { id: "forest", name: "绿野森林", icon: "🌲", requiredLevel: 1, requiredPoints: 0, theme: "新手村", color: "#22c55e" },
  { id: "ocean", name: "海底世界", icon: "🌊", requiredLevel: 2, requiredPoints: 1000, theme: "水下冒险", color: "#3b82f6" },
  { id: "desert", name: "沙漠冒险", icon: "🏜️", requiredLevel: 3, requiredPoints: 5000, theme: "耐心考验", color: "#f97316" },
  { id: "space", name: "太空基地", icon: "🚀", requiredLevel: 4, requiredPoints: 15000, theme: "科幻探索", color: "#a855f7" },
  { id: "castle", name: "王冠城堡", icon: "🏰", requiredLevel: 5, requiredPoints: 30000, theme: "终极挑战", color: "#eab308" },
]

export const LEVEL_THRESHOLDS = [
  { level: 1, name: "萌新小超人", points: 0 },
  { level: 2, name: "勇敢探索者", points: 1000 },
  { level: 3, name: "智慧战士", points: 5000 },
  { level: 4, name: "星空勇士", points: 15000 },
  { level: 5, name: "终极英雄", points: 30000 },
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

// ============================================================
// 区域专属徽章
// ============================================================
export const REGION_BADGES: RegionBadge[] = [
  // 绿野森林
  { id: "forest_guardian", regionId: "forest", name: "森林守护者", icon: "🌿", description: "完成 50 次生活任务", rarity: "rare", condition: { type: "task_total", category: "life", count: 50 } },
  { id: "life_master", regionId: "forest", name: "生活小能手", icon: "🏠", description: "连续 14 天完成生活任务", rarity: "epic", condition: { type: "task_streak", category: "life", days: 14 } },

  // 海底世界
  { id: "deep_explorer", regionId: "ocean", name: "深海探险家", icon: "🐠", description: "数学练习正确率超过 80%", rarity: "rare", condition: { type: "subject_accuracy", subject: "math", accuracy: 80, minCount: 30 } },
  { id: "ocean_sage", regionId: "ocean", name: "海底智者", icon: "🐙", description: "完成 100 次数学练习", rarity: "epic", condition: { type: "subject_total", subject: "math", count: 100 } },

  // 沙漠冒险
  { id: "desert_walker", regionId: "desert", name: "沙漠行者", icon: "🐪", description: "连续打卡 21 天", rarity: "rare", condition: { type: "streak", days: 21 } },
  { id: "oasis_finder", regionId: "desert", name: "绿洲发现者", icon: "🌴", description: "语文练习正确率超过 80%", rarity: "epic", condition: { type: "subject_accuracy", subject: "chinese", accuracy: 80, minCount: 30 } },

  // 太空基地
  { id: "space_pilot", regionId: "space", name: "星际飞行员", icon: "👨‍🚀", description: "完成 50 次英语练习", rarity: "rare", condition: { type: "subject_total", subject: "english", count: 50 } },
  { id: "space_commander", regionId: "space", name: "宇宙指挥官", icon: "🛸", description: "英语练习正确率超过 85%", rarity: "epic", condition: { type: "subject_accuracy", subject: "english", accuracy: 85, minCount: 50 } },

  // 王冠城堡
  { id: "castle_knight", regionId: "castle", name: "城堡骑士", icon: "⚔️", description: "解锁所有区域", rarity: "rare", condition: { type: "all_regions_unlocked" } },
  { id: "ultimate_king", regionId: "castle", name: "终极王者", icon: "👑", description: "击败所有 Boss", rarity: "legendary", condition: { type: "all_bosses_defeated" } },
]

// ============================================================
// 区域 Boss 配置
// ============================================================
export const REGION_BOSSES: RegionBoss[] = [
  {
    id: "boss_wolf",
    regionId: "forest",
    name: "森林狼王",
    icon: "🐺",
    description: "绿野森林的守护者，考验你的生活常识",
    challengePoints: 1000,
    challengeSubject: "chinese",
    challengeDifficulty: 2,
    challengeCount: 10,
    rewardPoints: 200,
    rewardBadgeId: "forest_guardian",
  },
  {
    id: "boss_shark",
    regionId: "ocean",
    name: "深海巨鲨",
    icon: "🦈",
    description: "海底世界的霸主，用数学智慧击败它",
    challengePoints: 3000,
    challengeSubject: "math",
    challengeDifficulty: 3,
    challengeCount: 15,
    rewardPoints: 500,
    rewardBadgeId: "deep_explorer",
  },
  {
    id: "boss_scorpion",
    regionId: "desert",
    name: "沙漠毒蝎",
    icon: "🦂",
    description: "沙漠深处的恐怖生物，用语文知识降服它",
    challengePoints: 8000,
    challengeSubject: "chinese",
    challengeDifficulty: 3,
    challengeCount: 15,
    rewardPoints: 800,
    rewardBadgeId: "desert_walker",
  },
  {
    id: "boss_alien",
    regionId: "space",
    name: "外星入侵者",
    icon: "👽",
    description: "来自未知星球的威胁，用英语与之交流",
    challengePoints: 20000,
    challengeSubject: "english",
    challengeDifficulty: 4,
    challengeCount: 20,
    rewardPoints: 1200,
    rewardBadgeId: "space_pilot",
  },
  {
    id: "boss_dragon",
    regionId: "castle",
    name: "黑暗巨龙",
    icon: "🐉",
    description: "终极 Boss，需要所有学科的知识才能击败",
    challengePoints: 35000,
    challengeSubject: "math",
    challengeDifficulty: 5,
    challengeCount: 25,
    rewardPoints: 2000,
    rewardBadgeId: "ultimate_king",
  },
]