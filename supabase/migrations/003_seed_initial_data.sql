insert into badges (name, icon, description, category, condition)
values
  ('初出茅庐', '🌱', '完成第一次打卡', 'general', '{"type":"first_checkin"}'),
  ('三日勇士', '🔥', '连续打卡 3 天', 'general', '{"type":"streak","days":3}'),
  ('一周战士', '🛡️', '连续打卡 7 天', 'general', '{"type":"streak","days":7}'),
  ('百分达人', '💯', '累计获得 100 积分', 'general', '{"type":"total_points","points":100}'),
  ('森林守护者', '🌳', '解锁绿野森林全部任务', 'general', '{"type":"region","region":"forest"}'),
  ('算术小能手', '🧮', '数学连续答对 10 题', 'learning', '{"type":"subject_streak","subject":"math","count":10}'),
  ('语文小作家', '✍️', '完成 20 道语文题', 'learning', '{"type":"subject_total","subject":"chinese","count":20}'),
  ('英语小达人', '📘', '掌握 50 个英语单词', 'learning', '{"type":"subject_total","subject":"english","count":50}'),
  ('挑战赛冠军', '🏆', '完成周末挑战赛', 'learning', '{"type":"challenge_complete"}'),
  ('错题终结者', '📝', '纠错本清空一次', 'learning', '{"type":"error_book_empty"}')
on conflict (name) do nothing;

insert into users (id, role, family_id, name, pin_code, grade)
values
  ('00000000-0000-0000-0000-00000000a001', 'parent', '10000000-0000-0000-0000-00000000f001', '家长账号', '1234', null),
  ('00000000-0000-0000-0000-00000000b001', 'kid', '10000000-0000-0000-0000-00000000f001', '小超人', null, 3)
on conflict (id) do nothing;

update users
set parent_id = '00000000-0000-0000-0000-00000000a001'
where id = '00000000-0000-0000-0000-00000000b001';

insert into tasks (user_id, name, icon, category, points, frequency, require_approval, is_active)
values
  ('00000000-0000-0000-0000-00000000a001', '整理书桌', '📝', 'life', 10, 'daily', true, true),
  ('00000000-0000-0000-0000-00000000a001', '按时刷牙洗脸洗脚', '🪥', 'life', 10, 'daily', true, true),
  ('00000000-0000-0000-0000-00000000a001', '背 10 个英语单词', '📘', 'learning', 15, 'daily', true, true)
on conflict do nothing;
