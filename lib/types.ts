export type Role = "kid" | "parent"

export type TaskCategory = "life" | "learning"
export type TaskFrequency = "daily" | "weekly" | "custom"
export type CheckInStatus = "pending" | "approved" | "rejected"

export interface Task {
  id: string
  user_id: string
  name: string
  icon: string
  category: TaskCategory
  points: number
  frequency: TaskFrequency
  require_approval: boolean
  is_active: boolean
  created_at: string
}

export interface CheckIn {
  id: string
  task_id: string
  kid_id: string
  status: CheckInStatus
  checked_at: string
  reviewed_at: string | null
}

export interface Streak {
  id: string
  kid_id: string
  current_streak: number
  best_streak: number
  last_check_in: string | null
  rescue_count: number
  updated_at: string
}

export interface PointsLog {
  id: string
  kid_id: string
  amount: number
  reason: string
  created_at: string
}

export interface User {
  id: string
  role: Role
  family_id?: string | null
  parent_id?: string | null
  name: string
  pin_code: string | null
  avatar: string | null
  birth_year: number | null
  grade: number | null
  height?: number | null
  weight?: number | null
  relationship?: string | null
  created_at: string
}

export type Subject = "math" | "chinese" | "english"
export type QuestionType = "choice" | "drag" | "match" | "fill"
export type StudyMode = "daily" | "error_review" | "challenge"

export interface Question {
  id: string
  subject: Subject
  grade: number
  difficulty: number
  type: QuestionType
  content: Record<string, unknown>
  answer: Record<string, unknown>
  explanation: string
  knowledge_point: string
}

export interface StudyRecord {
  id: string
  kid_id: string
  question_id: string
  is_correct: boolean
  mode: StudyMode
  answered_at: string
}

export interface ErrorBookEntry {
  id: string
  kid_id: string
  question_id: string
  wrong_count: number
  is_resolved: boolean
  last_wrong_at: string
}

export interface GrowthRecord {
  id: string
  kid_id: string
  height: number
  weight: number
  note: string | null
  recorded_at: string
}

export interface Wish {
  id: string
  kid_id: string
  title: string
  description: string
  points_cost: number
  status: "pending" | "approved" | "fulfilled"
  created_at: string
}

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
  category: "general" | "learning"
  condition: Record<string, unknown>
}

export interface UserBadge {
  id: string
  kid_id: string
  badge_id: string
  unlocked_at: string
}

export interface MapRegion {
  id: string
  name: string
  icon: string
  requiredLevel: number
  requiredPoints: number
  theme: string
  color: string
}
