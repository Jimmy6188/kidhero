# 小超人成长记 (KidHero) — 部署操作清单

> 最后更新：2026-05-28 | Next.js 16 + Supabase + Vercel

---

## 1. 前置条件

- [ ] 一个 [Supabase](apps.supabase.com) 账号（免费计划即可）
- [ ] 一个 [Vercel](vercel.com) 账号（免费计划即可）
- [ ] 本地已安装 Git 并已初始化 `kidhero` 仓库

---

## 2. Supabase 建库

### 2.1 创建项目

1. 登录 [apps.supabase.com](apps.supabase.com) → New project
2. 输入项目名称（如 `kidhero`）
3. 设置数据库密码（请记好）
4. Region 选择：`Asia Pacific (Singapore 或 Tokyo)`
5. 等待 2-3 分钟项目初始化

### 2.2 获取密钥

进入 **Project Settings → API**，记录以下三个值：

| 变量 | 获取位置 |
|---|---|
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key（需点击 Reveal） |

### 2.3 执行迁移（SQL Editor）

进入 **SQL Editor** → **New query**，按顺序粘贴并 Run 以下三个文件：

1. 打开 `supabase/migrations/001_initial.sql` → 全选 → 粘贴 → **Run**
2. 打开 `supabase/migrations/002_seed_questions.sql` → 全选 → 粘贴 → **Run**
3. 打开 `supabase/migrations/003_seed_initial_data.sql` → 全选 → 粘贴 → **Run**

> 或者直接在终端用 Supabase CLI：
> ```bash
> supabase link --project-ref <your-project-ref>
> supabase db push
> ```

### 2.4 验证数据

进入 **Table Editor**，确认以下表存在数据：

- [ ] `users`：应有 2 条（1 parent + 1 kid）
- [ ] `tasks`：应有 3 条初始任务
- [ ] `badges`：应有 10 条勋章
- [ ] `questions`：应有约 26 条题目

---

## 3. 本地环境变量

将 `D:\Vibe coding\kidhero\.env.example` 重命名或复制为 `.env.local`，填入 Step 2.2 获取的三个值：

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> 不要提交 `.env.local` 到 Git（已在 `.gitignore` 中）。

### 3.1 本地验证

```bash
cd D:\Vibe coding\kidhero
npm run dev
```

打开浏览器 → `localhost:3000` → Parent → PIN = `1234` → 创建孩子 → 进入首页。

验收项：

- [ ] PIN `1234` 可登录家长端
- [ ] 家长端"创建孩子档案"可正常提交
- [ ] 孩子端首页正常显示任务列表
- [ ] 打卡流程通畅（打卡 → 家长审批 → 积分入账）

---

## 4. Vercel 部署

### 4.1 推送代码

```bash
cd D:\Vibe coding\kidhero
git init                          # 如果还没初始化
git add .
git commit -m "Initial release"
```

推送到 GitHub（或你的 Git 托管平台）。

### 4.2 在 Vercel 导入项目

1. 登录 [vercel.com](vercel.com)
2. **Add New → Project**
3. 选择 kidhero 仓库
4. Framework preset 自动检测为 Next.js
5. 展开 **Environment Variables**，添加 Step 2.2 的三个变量（名称完全一致）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. 点击 **Deploy**

### 4.3 部署后验证

- [ ] Vercel 域名可直接访问首页（角色选择）
- [ ] 家长 PIN 登录正常
- [ ] 孩子创建和打卡正常
- [ ] 所有 API 返回正常数据

---

## 5. 默认种子数据说明

| 账户 | PIN | 名称 |
|---|---|---|
| 家长 | `1234` | 家长账号 |
| 孩子 | - | 小超人 |

| 初始任务 | 积分 | 分类 |
|---|---|---|
| 整理书桌 | 10 | 生活 |
| 按时刷牙洗脸洗脚 | 10 | 生活 |
| 背 10 个英语单词 | 15 | 学习 |

---

## 6. 常用维护操作

### 自定义域名

Vercel 项目 → Settings → Domains → Add Domain

### 查看日志

Vercel 项目 → Logs 可查看运行时日志

### Supabase 表结构变更

1. 在 SQL Editor 写新 ALTER/CREATE SQL
2. 存为 `supabase/migrations/004_xxx.sql`
3. 按顺序执行

---

## 7. 安全检查清单

| 检查项 | 状态 |
|---|---|
| `.env.local` 不提交到 Git | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` 不在客户端使用 | ✅ |
| API 请求有基本参数校验 | ✅ |
| 环境变量缺失时抛出明确错误 | ✅ |
| 默认家长 PIN 提示修改 | 🟡 上线前更换 `1234` |

> ⚠️ 强烈建议上线前将默认家长 PIN 修改为非 `1234`。

---

## 8. 已知限制

- 认证基于简单 PIN 码，非 JWT/OAuth（够用但不适合多家庭共享同一 URL）
- 当前一个家长只能绑定一个孩子，多孩需扩展
- 题目库约 26 条，建议持续补充
- 无自动打卡提醒和推送通知

---

## 9. 文件索引

| 文件 | 说明 |
|---|---|
| `D:\Vibe coding\kidhero\README.md` | 项目介绍和本地开发 |
| `D:\Vibe coding\kidhero\DEPLOYMENT.md` | 本文件：部署操作清单 |
| `D:\Vibe coding\kidhero\.env.example` | 环境变量模板 |
| `D:\Vibe coding\kidhero\supabase\migrations\` | SQL 迁移文件 |
| `D:\Vibe coding\kidhero\lib\supabase.ts` | 客户端 Supabase 初始化 |
| `D:\Vibe coding\kidhero\lib\supabase-server.ts` | 服务端 Supabase 初始化 |
| `D:\Vibe coding\kidhero\app\api\auth\verify-pin\` | PIN 登录 API |

---

*部署完毕。如有问题，从 Step 4.3 的验收项开始排查。*
