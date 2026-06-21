-- 家庭邀请码系统 + API 配置按家庭隔离

BEGIN;

-- 添加邀请码字段到 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code);

-- 生成邀请码的函数
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_count INT;
BEGIN
  LOOP
    -- 生成 6 位随机大写字母+数字
    code := upper(substring(md5(random()::text) from 1 for 6));

    -- 检查是否已存在
    SELECT COUNT(*) INTO exists_count FROM users WHERE invite_code = code;

    -- 如果不存在则返回
    IF exists_count = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 给 llm_configs 表添加 family_id 字段，按家庭隔离
ALTER TABLE llm_configs ADD COLUMN IF NOT EXISTS family_id TEXT;
CREATE INDEX IF NOT EXISTS idx_llm_configs_family ON llm_configs(family_id);

COMMIT;
