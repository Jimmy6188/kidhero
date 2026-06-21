-- Seed rewards (parent-managed mall items)
-- Using wishes table with kid_id = null, status = 'approved'

-- Small rewards (80-200 points)
INSERT INTO wishes (title, description, points_cost, status, kid_id) VALUES
('一个冰淇淋或小零食', NULL, 100, 'approved', NULL),
('今晚由我选晚餐菜品', NULL, 120, 'approved', NULL),
('睡前额外故事/聊天时间 15 分钟', NULL, 120, 'approved', NULL),
('选一首歌在车里/家里播放', NULL, 80, 'approved', NULL),
('一张贴纸（收藏册用）', NULL, 100, 'approved', NULL),
('一支特殊铅笔/橡皮', NULL, 150, 'approved', NULL),
('今晚可以多讲一个睡前故事', NULL, 140, 'approved', NULL),
('明天早餐选一样爱吃的', NULL, 150, 'approved', NULL),
('今晚不用收拾桌子/洗碗', NULL, 200, 'approved', NULL),
('随手小盲盒（文具/小玩具）', NULL, 200, 'approved', NULL),
('选一款健康的下午茶点心', NULL, 150, 'approved', NULL),
('给家人表演一个节目', NULL, 120, 'approved', NULL)
ON CONFLICT (title, kid_id) DO NOTHING;

-- Medium rewards (400-800 points)
INSERT INTO wishes (title, description, points_cost, status, kid_id) VALUES
('额外屏幕时间 30 分钟', NULL, 400, 'approved', NULL),
('周末选一部全家一起看的电影', NULL, 500, 'approved', NULL),
('和爸爸/妈妈单独外出一次', NULL, 600, 'approved', NULL),
('买一本喜欢的课外书', NULL, 600, 'approved', NULL),
('周末户外活动多玩 30 分钟', NULL, 500, 'approved', NULL),
('选一个全家周末活动', NULL, 800, 'approved', NULL),
('做一次喜欢的手工/科学实验', NULL, 700, 'approved', NULL),
('周末睡懒觉特权', NULL, 400, 'approved', NULL),
('选一款桌游全家一起玩', NULL, 800, 'approved', NULL),
('周末不做任何家务', NULL, 500, 'approved', NULL),
('让爸爸/妈妈陪玩一局电子游戏', NULL, 500, 'approved', NULL)
ON CONFLICT (title, kid_id) DO NOTHING;

-- Large rewards (1200-2000 points)
INSERT INTO wishes (title, description, points_cost, status, kid_id) VALUES
('乐高小套装', NULL, 1500, 'approved', NULL),
('新篮球/足球/跳绳', NULL, 1200, 'approved', NULL),
('一套漫画书', NULL, 1400, 'approved', NULL),
('周末去游乐园/室内游乐场', NULL, 2000, 'approved', NULL),
('邀请好朋友来家里玩半天', NULL, 1200, 'approved', NULL),
('买一个喜欢的桌游', NULL, 1500, 'approved', NULL),
('去一次科技馆/博物馆/动物园', NULL, 2000, 'approved', NULL),
('一套科学实验套装', NULL, 1800, 'approved', NULL),
('新书包/文具套装', NULL, 1400, 'approved', NULL),
('周末住爷爷奶奶/外公外婆家', NULL, 1200, 'approved', NULL),
('一套拼装模型', NULL, 1600, 'approved', NULL),
('新运动鞋', NULL, 1800, 'approved', NULL)
ON CONFLICT (title, kid_id) DO NOTHING;

-- Upsert badges with new system and rarities (preserves user-earned badges)
INSERT INTO badges (name, icon, description, category, condition) VALUES
('出击小超人', '🌟', '完成第一次打卡', 'general', '{"type":"first_checkin","rarity":"common"}'),
('洗手小卫士', '🧼', '连续 7 天完成洗手打卡', 'general', '{"type":"task_streak","task_name":"饭前便后洗手","days":7,"rarity":"common"}'),
('整理达人', '🧹', '累计整理书桌/床铺 30 次', 'general', '{"type":"task_total","task_names":["整理打扫书桌","整理床铺"],"count":30,"rarity":"common"}'),
('早起勇士', '⏰', '连续 7 天按时睡觉', 'general', '{"type":"task_streak","task_name":"按时睡觉","days":7,"rarity":"common"}'),
('数学冒险家', '🔢', '完成数学练习 20 次', 'learning', '{"type":"subject_total","subject":"math","count":20,"rarity":"common"}'),
('英语小达人', '🅰️', '完成英语练习 20 次', 'learning', '{"type":"subject_total","subject":"english","count":20,"rarity":"common"}'),
('诗词小书童', '📖', '完成语文练习 20 次', 'learning', '{"type":"subject_total","subject":"chinese","count":20,"rarity":"common"}'),
('小吃货', '🍽️', '连续 7 天好好吃饭不挑食', 'general', '{"type":"task_streak","task_name":"好好吃饭","days":7,"rarity":"common"}'),
('书包管家', '🎒', '累计收拾书包 20 次', 'general', '{"type":"task_total","task_name":"收拾书包","count":20,"rarity":"common"}'),
('坚持一周', '🔥', '连续打卡 7 天', 'general', '{"type":"streak","days":7,"rarity":"rare"}'),
('半月英雄', '💪', '连续打卡 14 天', 'general', '{"type":"streak","days":14,"rarity":"rare"}'),
('月度冠军', '👑', '连续打卡 30 天', 'general', '{"type":"streak","days":30,"rarity":"epic"}'),
('学科全勤', '🏆', '单月语数英全部完成', 'learning', '{"type":"monthly_all_subjects","rarity":"epic"}'),
('生活全能王', '🏠', '单月所有生活任务全勤', 'general', '{"type":"monthly_all_tasks","rarity":"epic"}'),
('破万先锋', '💰', '累计获得 10000 积分', 'general', '{"type":"total_points","points":10000,"rarity":"legendary"}'),
('小超人之星', '✨', '累计获得 30000 积分', 'general', '{"type":"total_points","points":30000,"rarity":"legendary"}'),
('宇宙守护者', '🌌', '累计获得 50000 积分', 'general', '{"type":"total_points","points":50000,"rarity":"legendary"}'),
('百日传奇', '💎', '连续打卡 100 天', 'general', '{"type":"streak","days":100,"rarity":"legendary"}')
ON CONFLICT (name) DO UPDATE SET
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  condition = EXCLUDED.condition;
