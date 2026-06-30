// AI 题目生成器

import { getLLMClient } from "./llm-client"

export interface GeneratedQuestion {
  subject: "math" | "chinese" | "english"
  grade: number
  difficulty: number
  type: "choice" | "fill"
  content: {
    stem: string
    options?: string[]
  }
  answer: {
    correct: number | string
  }
  explanation: string
  knowledge_point: string
}

/** 从 LLM 返回的原始题目数据（type 可能包含 "blank" 等未规范化值） */
interface RawQuestion extends Omit<GeneratedQuestion, "type"> {
  type: string
}

/**
 * 构建题目生成 Prompt
 */
function buildPrompt(
  grade: number,
  subject: string,
  difficulty: number,
  count: number
): string {
  const subjectNames: Record<string, string> = {
    math: "数学",
    chinese: "语文",
    english: "英语",
  }

  const subjectGuide: Record<string, string> = {
    math: `
- 生活场景：购物计算、时间安排、距离测量、分享分配
- 思维训练：找规律、逆推、画图分析、逻辑推理
- 游戏化：关卡得分、道具收集、任务挑战
- 适当拓展：简单奥数思维、数列规律、图形推理`,

    chinese: `
- 古诗词：结合季节、节日、景色的诗句
- 成语故事：让孩子猜成语或理解寓意
- 字词辨析：易混字、多音字、形近字
- 阅读理解：童话、寓言、生活故事片段
- 适当拓展：修辞手法、写作技巧、文学常识`,

    english: `
- 日常对话：打招呼、购物、问路、介绍
- 趣味词汇：动物、颜色、食物、游戏、运动
- 句型练习：I like... / Can you... / What is...?
- 适当拓展：简单时态、比较级、常用短语`,
  }

  return `你是资深小学教育专家，擅长设计有趣且有深度的练习题。

## 任务
生成 ${count} 道 ${grade} 年级${subjectNames[subject] || subject}练习题

## 核心要求

### 内容定位
- 难度：${difficulty}/5（1=基础巩固，5=思维拓展）
- 基于 ${grade} 年级教学大纲，可适当拓展思维
- 融入游戏化元素（关卡、成就、挑战等概念）
- 贴近孩子生活：校园、家庭、游戏、动漫、运动等场景
- 题目要有变化，避免重复套路

### 学科特点
${subjectGuide[subject] || ""}

### 题型要求
- 选择题（4选1）：占 80%（优先出选择题）
- 填空题：占 20%（仅限简单数字或单个词语）
- 题意清晰，不玩文字游戏

### 填空题限制（非常重要！）
填空题的答案必须满足以下条件，方便手机/平板输入：
- ✅ 可以填：数字（如 24、3.5）、简单汉字（1-4个字）、英文单词（如 cat、apple）
- ❌ 不能填：拼音（如 chūn、lè,yue）、音标、特殊符号、长句子
- ❌ 避免：多音字注音、声调标注、拼音填空
- 如果需要考拼音知识，请出成选择题！

### 填空题答案格式（必须遵守）
- 每道填空题只能有 **一个空** 需要填写
- 如果需要填多个词，必须拆成多道题或改成选择题
- 答案必须简洁：数字、1-4个汉字、或单个英文单词
- 如果题目要求填多个内容（如"写出两个拼音"），必须改成选择题！

### 答案与解析要求（非常重要！必须严格遵守）
1. **先确定答案，再写解析**：必须先计算/思考出正确答案，填入 "correct" 字段
2. **解析必须与答案一致**：解析中的推导过程必须得出与 "correct" 字段相同的答案
3. **严禁在解析中改变答案**：如果解析推导出不同结果，说明题目有误，必须重新出题
4. **选择题答案格式**："correct" 填选项的索引（0=A, 1=B, 2=C, 3=D）

解析格式：
【解题思路】这道题应该怎么想
【关键点】解题的核心知识点或技巧
【易错点】容易错在哪里，如何避免
【答案】正确选项是 X，因为...（必须与 "correct" 字段一致）

## 输出格式（严格 JSON 数组，不要包含其他内容）
[
  {
    "subject": "${subject}",
    "grade": ${grade},
    "difficulty": ${difficulty},
    "type": "choice",
    "content": {
      "stem": "题目文字",
      "options": ["选项A", "选项B", "选项C", "选项D"]
    },
    "answer": {
      "correct": 0
    },
    "explanation": "【解题思路】...\\n【关键点】...\\n【易错点】...\\n【答案】正确选项是A，因为...",
    "knowledge_point": "知识点名称"
  }
]

## 自检清单（生成后必须检查）
- [ ] 每道题的 "correct" 字段是否正确？
- [ ] 解析中的推导是否得出与 "correct" 相同的答案？
- [ ] 选择题的选项是否有且只有 4 个？

现在请生成 ${count} 道 ${grade} 年级${subjectNames[subject] || subject}题，难度 ${difficulty}/5：
只输出 JSON 数组，不要有其他文字。`
}

/**
 * 解析 LLM 返回的 JSON
 */
function parseQuestions(jsonStr: string): GeneratedQuestion[] {
  let jsonContent = ""
  try {
    // 1. 清理 markdown 代码块标记
    let cleaned = jsonStr
      .replace(/^[\s\S]*?```(?:json)?\s*/i, "")
      .replace(/\s*```[\s\S]*$/i, "")
      .trim()

    // 2. 提取 JSON 数组
    const firstBracket = cleaned.indexOf("[")
    const lastBracket = cleaned.lastIndexOf("]")

    if (firstBracket === -1 || lastBracket === -1 || firstBracket >= lastBracket) {
      throw new Error("No JSON array found in response")
    }

    jsonContent = cleaned.substring(firstBracket, lastBracket + 1)

    // 3. 尝试多种方式解析
    const parseAttempts: (() => RawQuestion[])[] = [
      // 尝试 1: 直接解析
      () => JSON.parse(jsonContent) as RawQuestion[],
      // 尝试 2: 移除尾部逗号
      () => JSON.parse(jsonContent.replace(/,(\s*[}\]])/g, "$1")) as RawQuestion[],
      // 尝试 3: 补上对象间缺失的逗号
      () => {
        let fixed = jsonContent
          .replace(/,(\s*[}\]])/g, "$1")
          .replace(/}\s*{/g, "},{")
          .replace(/}\s*\[/g, "},[")
          .replace(/\]\s*{/g, "],{")
          .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
          // 清理补逗号导致的重复逗号
          .replace(/,+/g, ",")
        return JSON.parse(fixed) as RawQuestion[]
      },
      // 尝试 4: 用宽松 JS 解析（最后的尝试）
      () => {
        // eslint-disable-next-line no-new-func
        return Function("return " + jsonContent)() as RawQuestion[]
      },
    ]

    let questions: RawQuestion[] | null = null
    let lastError: unknown = null

    for (const attempt of parseAttempts) {
      try {
        questions = attempt()
        break
      } catch (e) {
        lastError = e
      }
    }

    if (!questions) {
      throw lastError || new Error("JSON parse failed")
    }

    // 校验每道题的格式 + 规范化 type 字段
    return questions
      .filter((q: RawQuestion) => {
        if (!q.content?.stem) return false
        if (q.type === "choice" && (!q.content.options || q.content.options.length !== 4)) return false
        if (q.answer?.correct === undefined) return false
        return true
      })
      .map((q: RawQuestion) => {
        // 规范化 type 字段：blank -> fill
        const type = q.type === "blank" ? "fill" : (q.type as GeneratedQuestion["type"])
        return { ...q, type } as GeneratedQuestion
      })
  } catch (error) {
    console.error("[QuestionGenerator] Parse error:", error)
    // 输出错误位置附近的上下文
    if (error instanceof SyntaxError) {
      const posMatch = error.message.match(/position\s+(\d+)/)
      if (posMatch) {
        const pos = parseInt(posMatch[1])
        const start = Math.max(0, pos - 60)
        const end = Math.min(jsonContent.length, pos + 60)
        console.error("[QuestionGenerator] Context:", jsonContent.substring(start, end))
      }
    }
    const posInfo = error instanceof SyntaxError ? error.message : ""
    throw new Error(`Failed to parse generated questions: ${posInfo}`)
  }
}

/**
 * 生成题目
 */
export async function generateQuestions(
  grade: number,
  subject: "math" | "chinese" | "english",
  difficulty: number,
  count: number = 10,
  providerId?: string
): Promise<GeneratedQuestion[]> {
  const llm = getLLMClient()
  const prompt = buildPrompt(grade, subject, difficulty, count)

  console.log(`[QuestionGenerator] Generating ${count} ${subject} questions for grade ${grade}, difficulty ${difficulty}`)

  const response = await llm.chat(prompt, {
    providerId,
    maxTokens: 4000,
    temperature: 0.8, // 稍高温度，增加题目多样性
  })

  console.log(`[QuestionGenerator] LLM response from ${response.provider}, tokens: ${response.usage?.promptTokens}+${response.usage?.completionTokens}`)

  const questions = parseQuestions(response.content)

  // 补充缺失的字段
  return questions.map((q) => ({
    ...q,
    subject,
    grade,
    difficulty,
  }))
}

/**
 * 生成单道题（用于补充缓存）
 */
export async function generateSingleQuestion(
  grade: number,
  subject: "math" | "chinese" | "english",
  difficulty: number,
  _knowledgePoint?: string
): Promise<GeneratedQuestion | null> {
  const questions = await generateQuestions(grade, subject, difficulty, 1)
  return questions[0] || null
}