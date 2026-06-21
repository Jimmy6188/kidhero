-- Boss 挑战系统

BEGIN;

-- 创建 boss_challenges 表
CREATE TABLE IF NOT EXISTS boss_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  boss_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'victory', 'defeat')),
  score INT DEFAULT 0,
  total INT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(kid_id, boss_id, status)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_boss_challenges_kid ON boss_challenges(kid_id);
CREATE INDEX IF NOT EXISTS idx_boss_challenges_status ON boss_challenges(kid_id, status);

COMMIT;
