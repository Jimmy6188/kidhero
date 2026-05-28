# KidHero Growth

KidHero Growth is a Next.js web app for child habit building, study practice, and parent supervision.

## Stack

- `Next.js 16`
- `React 19`
- `Tailwind CSS 4`
- `Supabase`

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create `.env.local` from `.env.example`

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Start dev server

```bash
npm run dev
```

4. Run build check

```bash
npm run build
```

## Supabase migrations

Create a Supabase project, then run these SQL files in order in the Supabase SQL Editor:

1. `D:\Vibe coding\kidhero\supabase\migrations\001_initial.sql`
2. `D:\Vibe coding\kidhero\supabase\migrations\002_seed_questions.sql`
3. `D:\Vibe coding\kidhero\supabase\migrations\003_seed_initial_data.sql`

The third file seeds:

- 10 badge definitions
- 1 parent account
- 1 child account
- 3 starter tasks

Default seeded parent login:

- `PIN`: `1234`
- `Parent name`: `家长账号`
- `Kid name`: `小超人`

## Production checklist

Before deployment, confirm:

- Supabase project is created
- all 3 SQL migrations have been executed successfully
- the seeded parent account can be found in `users`
- `NEXT_PUBLIC_SUPABASE_URL` points to the same Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` is set only on the server side

## Supabase setup

1. Create a new project in Supabase
2. Open `SQL Editor`
3. Run:
   - `D:\Vibe coding\kidhero\supabase\migrations\001_initial.sql`
   - `D:\Vibe coding\kidhero\supabase\migrations\002_seed_questions.sql`
   - `D:\Vibe coding\kidhero\supabase\migrations\003_seed_initial_data.sql`
4. In `Project Settings > API`, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## Local verification

After filling `.env.local`, verify locally:

```bash
npm run dev
```

Then test:

- open `/parent`
- enter PIN `1234`
- if no child exists yet, create one at `/parent/create-kid`
- enter `/kid` and confirm it redirects into the child homepage

## Data model notes

- `users.family_id` groups one family
- `users.parent_id` links child to parent
- current frontend uses a lightweight local session model in `D:\Vibe coding\kidhero\lib\session.ts`
- real auth can replace that layer later without rewriting the full app

## Deploy to Vercel

1. Push the repo to GitHub, GitLab, or Bitbucket
2. Import the repo into Vercel
3. In `Project Settings > Environment Variables`, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Deploy

If using CLI instead:

```bash
vercel login
vercel
vercel --prod
```

## Post-deploy verification

After deployment, verify:

- `/parent` can log in with PIN `1234`
- `/parent/create-kid` can create a child
- `/kid` loads the child homepage
- task check-in works
- parent review approval works
- growth records and reports load normally

## Current status

- role selection and PIN login
- parent-child binding
- task check-in and review
- streak and points system
- map progression
- daily study, error book, weekend challenge
- badges, rewards, wishlist
- growth data and reports
