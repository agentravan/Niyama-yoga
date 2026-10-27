# 🌿 Niyama Yoga: Online Live Yoga Platform

A production-ready yoga studio web app with:

- **Marketing site** with a calm glassmorphism design, light and dark mode, and full mobile support
- **4 membership tiers** (Monthly, Quarterly *Most Popular*, Half-Yearly, Annual VIP *Best Value*) and a feature comparison table
- **3-day free trial onboarding**: name, email, phone and experience level. The account is created and the user is signed in right away. The admin gets an instant email.
- **Automated trial lifecycle**: a daily cron expires trials and emails the customer an upgrade or decline follow-up
- **Decline → feedback modal**: the reasons and suggestions are saved to the database and emailed to the admin
- **In-browser live classes**: a private Daily.co room (or Jitsi) embedded in the dashboard, with camera and mic controls. No Zoom needed.
- **Admin portal** (`/admin`): users, trial status, plans, customer details, feedback log, class scheduler, manual status changes and a "simulate trial expiry" button

**Stack (all free tier):** Next.js 15 (App Router) · Tailwind CSS v4 · Supabase (Postgres + Auth) · Resend (email) · Daily.co or Jitsi (video) · Vercel (hosting + cron)

---

## Project structure

```
app/
  page.tsx                  Homepage (hero, classes, how-it-works, pricing, FAQ)
  pricing/                  Pricing page + comparison table
  start/                    Trial / plan registration form
  welcome/                  "Your 3-Day Free Trial Has Started!" success screen
  login/ forgot-password/ reset-password/ auth/confirm/
  dashboard/                Customer portal (overview, live, membership)
  admin/                    Admin portal (only ADMIN_EMAIL)
  actions/                  Server actions (auth, onboarding, membership, admin)
  api/video/session/        Issues a private video room pass to entitled members
  api/cron/trial-check/     Daily trial-expiry + follow-up email job
components/                 UI (pricing cards, comparison table, feedback modal, banners…)
lib/                        Plans, Supabase clients, email templates, lifecycle logic
supabase/migrations/        Database schema + RLS
supabase/seed.sql           Optional sample class schedule
scripts/create-admin.mjs    Creates the admin login
middleware.ts               Session refresh + route protection
vercel.json                 Daily cron schedule
```

---

## 1. Set up Supabase (free)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste in all of `supabase/migrations/0001_init.sql`, and click **Run**.
3. (Optional) Run `supabase/seed.sql` to add a week of sample live classes.
4. Under **Project Settings → API**, copy the **Project URL**, the **anon public** key and the **service_role** key.
5. Under **Authentication → URL Configuration**, set **Site URL** to your production URL, and add `https://YOUR-DOMAIN/auth/confirm` to **Redirect URLs**. Password reset needs this.

## 2. Set up email (Resend, free: 3,000 emails/month)

1. Sign up at [resend.com](https://resend.com) and create an API key.
2. **Important:** until you verify a domain, Resend only delivers to the email that owns the Resend account, and only from `onboarding@resend.dev`.
   - Admin notifications (new leads, feedback, upgrade requests) work right away **if you sign up for Resend with `Chandrapratap.cp30@gmail.com`**.
   - Customer emails (the post-trial follow-up) need a **verified domain**. Add one under **Domains**, then set `EMAIL_FROM="Niyama Yoga <hello@yourdomain.com>"`.
3. If `RESEND_API_KEY` is missing, the app still works. Emails are skipped and logged.

## 3. Set up live video

**Option A: Daily.co (recommended, free: 10,000 participant-minutes/month)**
1. Sign up at [dashboard.daily.co](https://dashboard.daily.co) and copy your API key.
2. Set `NEXT_PUBLIC_VIDEO_PROVIDER=daily` and `DAILY_API_KEY=...`.
   Rooms are created automatically as **private**. Each member gets a 4-hour signed token, and only members on an active trial or membership can get one. The admin joins as room owner.

**Option B: Jitsi.** Set `NEXT_PUBLIC_VIDEO_PROVIDER=jitsi`. Note that the public `meet.jit.si` server **cuts embedded calls after 5 minutes**, so for real classes point `NEXT_PUBLIC_JITSI_DOMAIN` at your own Jitsi server.

## 4. Run locally

```bash
cp .env.local.example .env.local     # fill in the values
npm install
npm run dev                          # http://localhost:3000
```

Create the admin login (it reads `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` from `.env.local`):

```bash
npm run create-admin
```

Then log in at `/login` and you'll land on `/admin`. **Change the initial password afterwards** with *Forgot password*, and remove `ADMIN_INITIAL_PASSWORD` from your env files.

## 5. Deploy to Vercel (free)

```bash
git init && git add . && git commit -m "Niyama Yoga"
git branch -M main
git remote add origin https://github.com/<you>/niyama-yoga.git
git push -u origin main
```

1. Go to [vercel.com/new](https://vercel.com/new) → **Import** your GitHub repo. The framework is detected as Next.js.
2. Under **Environment Variables**, add every key from `.env.local.example`:
   - `NEXT_PUBLIC_SITE_URL` = `https://your-project.vercel.app` (or your domain)
   - `CRON_SECRET` = a long random string (`openssl rand -hex 32`). Vercel sends it automatically to the cron route.
3. Click **Deploy**. Every `git push` to `main` redeploys automatically.
4. Update the Supabase **Site URL** and **Redirect URLs** (step 1.5) to the Vercel URL.

The cron job in `vercel.json` runs `/api/cron/trial-check` **once a day at 03:00 UTC (08:30 IST)**, which is the maximum frequency on the Hobby plan. The dashboard also checks trial expiry in real time, so customers see the "trial ended" screen the moment the 3 days are up. The cron job only sends the follow-up email. Admins can also click **Run trial check now** or **End trial now** in `/admin` to test the flow.

---

## How the flows work

| Step | What happens |
|---|---|
| Visitor clicks a plan or **Start 3-day free trial** | `/start?plan=…` form: name, email, password, phone, experience level |
| Submit | Supabase user is created and signed in → `profiles` row with `trial_ends_at = now + 3 days` → admin email with all details, plan and trial timestamp → `/welcome` banner **"Your 3-Day Free Trial Has Started!"** |
| During trial | Dashboard countdown, perks unlocked for the chosen plan, live studio access |
| Trial ends | Daily cron sets `trial_expired` and emails the customer **Upgrade** / **Not interested** links |
| **Upgrade** | Status becomes `pending_payment`, the admin is emailed, and the optional `NEXT_PUBLIC_PAYMENT_LINK` button appears. The admin confirms payment and sets **Active** in `/admin`, which sets the membership end date from the plan length. |
| **Decline / Not interested** | The feedback modal opens automatically. Reasons and suggestions go into the `feedback` table, the status becomes `declined`, and the admin is emailed. |

### Security notes
- Only the server writes to the database, using the service-role key. RLS lets users **read only their own** profile and feedback.
- `/admin` is guarded in both the middleware and the page by `ADMIN_EMAIL` (case-insensitive).
- Video passes are issued per user, short-lived, and only to entitled members.
- The cron route needs `Authorization: Bearer $CRON_SECRET`.
- Signup has a honeypot field against basic bots. For heavy traffic, add Cloudflare Turnstile or hCaptcha.

### Before going live
- The testimonials and stats on the homepage are **placeholder copy**. Replace them with real ones.
- Prices are in `lib/plans.ts` (INR). Change them there and the cards, table and emails all update.
- Online payment collection isn't built in, which keeps the stack 100% free. Plug in a Razorpay or Stripe payment link with `NEXT_PUBLIC_PAYMENT_LINK`.
