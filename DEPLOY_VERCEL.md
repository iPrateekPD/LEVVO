# 🚀 Deploying LEVVO to Vercel with Cloud PostgreSQL

This guide walks you through deploying **LEVVO** to Vercel in 3 simple steps.

---

## Architecture Overview
- **Frontend & Backend**: Next.js App Router (both live in the same repository). All API routes in `/src/app/api/v1/*` automatically deploy as Vercel Serverless Functions.
- **Database**: Cloud PostgreSQL (Neon or Supabase). SQLite (`dev.db`) cannot be used on Vercel because serverless runtimes are stateless and read-only.

---

## Step 1: Create a Free Cloud Database (Neon or Supabase)

### Option A: Neon.tech (Recommended - Fast & Free)
1. Go to [https://neon.tech](https://neon.tech) and sign in.
2. Click **Create Project**, name it `levvo-db`.
3. Copy the **Connection String** from the Neon dashboard. It looks like:
   ```
   postgresql://[user]:[password]@[endpoint].us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Switch Prisma Schema to PostgreSQL & Seed Data

1. In `prisma/schema.prisma`, update line 2:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Temporarily set your `DATABASE_URL` in `.env` (or pass it via terminal) and push the schema:
   ```bash
   # Push tables & models to your cloud DB
   DATABASE_URL="your_neon_url_here" npx prisma db push

   # Seed initial shop items, bosses & achievements
   DATABASE_URL="your_neon_url_here" npm run db:seed
   ```

---

## Step 3: Connect & Deploy on Vercel

1. Push your latest code to GitHub:
   ```bash
   git add .
   git commit -m "chore: prepare for vercel deployment"
   git push origin main
   ```

2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Import the repository: `iPrateekPD/LEVVO`.
4. In the **Environment Variables** section, add:

| Name | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Your Neon connection string |
| `NEXTAUTH_SECRET` | `your_secret_32_chars` | Run `openssl rand -base64 32` to generate |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your Vercel domain |
| `GEMINI_API_KEY` | `your_gemini_key` | *(Optional)* For AI Plan My Day |

5. Click **Deploy**!

Vercel will run `prisma generate && next build` and deploy your app with live database and serverless APIs.
