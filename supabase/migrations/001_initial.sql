create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('kid', 'parent')),
  family_id uuid,
  parent_id uuid references users(id) on delete set null,
  name text not null,
  pin_code text,
  avatar text,
  birth_year integer,
  grade integer,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  icon text default 'STAR',
  category text not null check (category in ('life', 'learning')),
  points integer default 10,
  frequency text default 'daily' check (frequency in ('daily', 'weekly', 'custom')),
  require_approval boolean default true,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists check_ins (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  kid_id uuid references users(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  checked_at timestamptz default now(),
  reviewed_at timestamptz
);

create table if not exists streaks (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid references users(id) on delete cascade unique,
  current_streak integer default 0,
  best_streak integer default 0,
  last_check_in date,
  rescue_count integer default 0,
  updated_at timestamptz default now()
);

create table if not exists points_log (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid references users(id) on delete cascade,
  amount integer not null,
  reason text,
  created_at timestamptz default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (subject in ('math', 'chinese', 'english')),
  grade integer not null,
  difficulty integer default 1 check (difficulty between 1 and 5),
  type text not null check (type in ('choice', 'drag', 'match', 'fill')),
  content jsonb not null,
  answer jsonb not null,
  explanation text,
  knowledge_point text
);

create table if not exists study_records (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid references users(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  is_correct boolean not null,
  mode text not null check (mode in ('daily', 'error_review', 'challenge')),
  answered_at timestamptz default now()
);

create table if not exists error_book (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid references users(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  wrong_count integer default 1,
  is_resolved boolean default false,
  last_wrong_at timestamptz default now(),
  unique(kid_id, question_id)
);

create table if not exists growth_records (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid references users(id) on delete cascade,
  height numeric(5,1),
  weight numeric(5,1),
  note text,
  recorded_at timestamptz default now()
);

create table if not exists wishes (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid references users(id) on delete cascade,
  title text not null,
  description text,
  points_cost integer default 100,
  status text default 'pending' check (status in ('pending', 'approved', 'fulfilled')),
  created_at timestamptz default now()
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  description text,
  category text default 'general' check (category in ('general', 'learning')),
  condition jsonb
);

create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid references users(id) on delete cascade,
  badge_id uuid references badges(id) on delete cascade,
  unlocked_at timestamptz default now(),
  unique(kid_id, badge_id)
);

create index if not exists idx_check_ins_kid on check_ins(kid_id);
create index if not exists idx_points_log_kid on points_log(kid_id);
create index if not exists idx_study_records_kid on study_records(kid_id);
create index if not exists idx_questions_subject_grade on questions(subject, grade);
