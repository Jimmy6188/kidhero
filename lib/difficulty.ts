import { supabaseAdmin } from "./supabase-server"
import { Subject, Question } from "./types"

interface DifficultyState {
  math: number
  chinese: number
  english: number
}

const CONSECUTIVE_CORRECT_TO_UP = 3
const CONSECUTIVE_WRONG_TO_DOWN = 2

export async function getAdaptiveDifficulty(kidId: string): Promise<DifficultyState> {
  const { data: records } = await supabaseAdmin
    .from("study_records")
    .select("*, questions(subject, difficulty)")
    .eq("kid_id", kidId)
    .order("answered_at", { ascending: false })
    .limit(30)

  if (!records || records.length === 0) {
    return { math: 1, chinese: 1, english: 1 }
  }

  const subjects: Subject[] = ["math", "chinese", "english"]
  const result: DifficultyState = { math: 1, chinese: 1, english: 1 }

  for (const subject of subjects) {
    const subjectRecords = records.filter((r) => r.questions?.subject === subject)
    if (subjectRecords.length === 0) continue

    const lastDifficulty = subjectRecords[0]?.questions?.difficulty || 1
    let currentDifficulty = lastDifficulty

    let consecutiveCorrect = 0
    let consecutiveWrong = 0

    for (const record of subjectRecords) {
      if (record.is_correct) {
        consecutiveCorrect++
        consecutiveWrong = 0
      } else {
        consecutiveWrong++
        consecutiveCorrect = 0
      }

      if (consecutiveCorrect >= CONSECUTIVE_CORRECT_TO_UP) {
        currentDifficulty = Math.min(5, currentDifficulty + 1)
        consecutiveCorrect = 0
      }
      if (consecutiveWrong >= CONSECUTIVE_WRONG_TO_DOWN) {
        currentDifficulty = Math.max(1, currentDifficulty - 1)
        consecutiveWrong = 0
      }
    }

    result[subject] = currentDifficulty
  }

  return result
}

export async function getQuestionsForDaily(
  kidId: string,
  count: number = 10
): Promise<Question[]> {
  const difficulty = await getAdaptiveDifficulty(kidId)
  const subjects: Subject[] = ["math", "chinese", "english"]
  const questionsPerSubject = Math.ceil(count / subjects.length)

  const allQuestions: Question[] = []

  for (const subject of subjects) {
    const diff = difficulty[subject]
    const { data } = await supabaseAdmin
      .from("questions")
      .select("*")
      .eq("subject", subject)
      .gte("difficulty", Math.max(1, diff - 1))
      .lte("difficulty", Math.min(5, diff + 1))
      .order("id")
      .limit(questionsPerSubject)

    if (data) allQuestions.push(...data)
  }

  // Shuffle
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]]
  }

  return allQuestions.slice(0, count)
}