-- 难度设置功能

BEGIN;

-- 添加难度设置字段到 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS difficulty_mode TEXT DEFAULT 'auto' CHECK (difficulty_mode IN ('auto', 'manual'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS fixed_difficulty INT CHECK (fixed_difficulty BETWEEN 1 AND 5);

COMMIT;
