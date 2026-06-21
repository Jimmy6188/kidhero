-- AI 题目系统

BEGIN;

-- ============================================================
-- 题目缓存池（AI 生成的题目存这里）
-- ============================================================
CREATE TABLE IF NOT EXISTS question_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('math', 'chinese', 'english')),
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  type TEXT NOT NULL CHECK (type IN ('choice', 'fill')),
  content JSONB NOT NULL,
  answer JSONB NOT NULL,
  explanation TEXT,
  knowledge_point TEXT,
  used_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 快速查询：按年级+科目+难度找未使用或少使用的题目
CREATE INDEX idx_question_pool ON question_cache (grade, subject, difficulty, used_count);

-- ============================================================
-- 错题记录（用于循环复习）
-- ============================================================
CREATE TABLE IF NOT EXISTS error_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  knowledge_point TEXT NOT NULL,
  wrong_count INT DEFAULT 1,
  last_wrong_at TIMESTAMPTZ DEFAULT now(),
  next_review_at TIMESTAMPTZ NOT NULL,
  is_mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(kid_id, knowledge_point)
);

-- 快速查询：查找需要复习的错题
CREATE INDEX idx_error_review ON error_records (kid_id, is_mastered, next_review_at);

-- ============================================================
-- 学习记录（扩展现有表）
-- ============================================================
-- 添加缺失的列到现有 study_records 表
ALTER TABLE study_records ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE study_records ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'math';
ALTER TABLE study_records ADD COLUMN IF NOT EXISTS knowledge_point TEXT;
ALTER TABLE study_records ADD COLUMN IF NOT EXISTS user_answer JSONB;

-- 快速查询：统计正确率
CREATE INDEX IF NOT EXISTS idx_study_stats ON study_records (kid_id, subject, answered_at);

-- ============================================================
-- LLM 模型配置（可选，也可以用文件配置）
-- ============================================================
CREATE TABLE IF NOT EXISTS llm_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  protocol TEXT NOT NULL CHECK (protocol IN ('openai', 'anthropic')),
  model TEXT NOT NULL,
  priority INT DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 辅助函数
-- ============================================================

-- 原子性增加 used_count
CREATE OR REPLACE FUNCTION increment_used_count(question_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE question_cache
  SET used_count = used_count + 1
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- 原子性更新积分
CREATE OR REPLACE FUNCTION update_kid_points(kid_id UUID, points_to_add INT)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET points = COALESCE(points, 0) + points_to_add
  WHERE id = kid_id;
END;
$$ LANGUAGE plpgsql;

COMMIT;
