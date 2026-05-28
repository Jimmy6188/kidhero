import { LEVEL_THRESHOLDS, MAP_REGIONS } from "./constants"
import { MapRegion } from "./types"

export function calculateLevel(totalPoints: number): {
  level: number
  name: string
  progress: number
} {
  let current = LEVEL_THRESHOLDS[0]
  let next = LEVEL_THRESHOLDS[1]

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i].points) {
      current = LEVEL_THRESHOLDS[i]
      next = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i]
      break
    }
  }

  const progress =
    next.points === current.points
      ? 100
      : Math.round(
          ((totalPoints - current.points) / (next.points - current.points)) * 100
        )

  return { level: current.level, name: current.name, progress: Math.min(progress, 100) }
}

export function getUnlockedRegions(totalPoints: number): MapRegion[] {
  return MAP_REGIONS.filter((r) => totalPoints >= r.requiredPoints)
}

export function getCurrentRegion(totalPoints: number): MapRegion {
  const unlocked = getUnlockedRegions(totalPoints)
  return unlocked[unlocked.length - 1] || MAP_REGIONS[0]
}