# KREN Wall

**KREN 2026 — ARE YOU NEXT?**

A digital event wall for KREN 2026, the entrepreneurship expo by
**Politeknik Wilmar Bisnis Indonesia (WBI)** and **WBI Business Initiative
Center (WBIIC)**. Visitors scan a QR code, leave a message, optionally add a
photo with an official 9:16 event frame, and appear live on a Smart TV and in
the public gallery. Built entirely on free-tier services.

## Features

- 📝 Message wall — name + message (max 300 chars), no approval queue
- 📸 Optional photo with in-browser 9:16 crop (drag / zoom / pan / rotate)
- 🖼️ Two official event frames, overlaid dynamically (never baked into storage)
- ⚡ In-browser processing: crop → resize 720×1280 → WebP 80% (~150–300KB)
- 📺 `/tv` — fullscreen realtime slideshow (8s fade slides, keyboard control)
- 🖼️ `/gallery` — live responsive grid, modal detail, framed PNG download
- 🔐 `/admin` — Supabase Auth login, stats cards, delete-only moderation
- 🚦 Spam protection — 30s cooldown per device (localStorage) and per IP
- 🎨 Poppins + Inter, orange `#FF7A00`, glassmorphism, Framer Motion

## Tech Stack

Next.js 15 (App Router) · TypeScript · TailwindCSS v4 · shadcn/ui ·
Framer Motion · Supabase (Postgres, Storage, Realtime, Auth) ·
react-easy-crop · Canvas API · Vercel

## Project Structure

```
src/
├── app/
│   ├── page.tsx               # Landing (hero, QR placeholder)
│   ├── share/page.tsx         # Submission form + crop + frame + preview
│   ├── thanks/page.tsx        # Thank-you page
│   ├── gallery/page.tsx       # Live photo grid + download modal
│   ├── tv/page.tsx            # Smart TV slideshow
│   ├── admin/page.tsx         # Dashboard (stats + delete)
│   ├── admin/login/page.tsx   # Supabase Auth login
│   └── api/submit/route.ts    # Validated insert + IP rate limit
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── logo-bar.tsx           # Official WBI + WBIIC logos
│   ├── framed-photo.tsx       # Photo + dynamic PNG frame overlay
│   ├── crop-editor.tsx        # Fullscreen 9:16 react-easy-crop editor
│   ├── animated-background.tsx
│   └── fade-in.tsx
├── hooks/
│   └── use-submissions.ts     # Fetch + Supabase Realtime sync
├── lib/
│   ├── supabase/              # client / server / middleware helpers
│   ├── image.ts               # Crop → resize → WebP pipeline + download
│   ├── frames.ts              # Frame registry
│   └── types.ts               # Shared types + limits
└── middleware.ts              # /admin auth guard
public/frames/                 # frame1.png, frame2.png (720×1280, 9:16)
supabase/migrations/           # SQL schema + RLS + storage policies
```

## Setup

### 1. Supabase (free tier)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `supabase/migrations/0001_init.sql`.
   This creates the `submissions` table, RLS policies, realtime publication
   and the public `kren-wall` storage bucket.
3. Create the admin user: **Authentication → Users → Add user**
   (email + password, auto-confirm). Keep signups disabled
   (**Authentication → Providers → Email → disable signups**) so only this
   account exists.

### 2. Local development

```bash
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm install
npm run dev
```

### 3. Frames

`public/frames/frame1.png` and `frame2.png` are generated placeholders.
Replace them with the official KREN 2026 frame designs — any 720×1280 PNG
with a transparent window works. No code changes needed.

## Deployment (Vercel free plan)

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. `vercel.json` pins the `sin1` (Singapore) region for low latency
   at the venue.
5. Point the event QR code at the production URL.

### Event-day checklist

- [ ] Open `https://<your-domain>/tv` on the Smart TV browser, press `F`
- [ ] Test a submission from a phone (message only + with photo)
- [ ] Verify it appears on TV and gallery without refresh
- [ ] Log into `/admin` and verify delete removes it everywhere

## Smart TV shortcuts

| Key | Action |
| --- | ------ |
| `F` | Toggle fullscreen |
| `Space` | Pause / resume slideshow |
| `←` | Previous slide |
| `→` | Next slide |

## Free-tier budget

- **Supabase free**: 500MB DB / 1GB storage ≈ 4,000+ photos at ~250KB each;
  200 concurrent realtime connections.
- **Vercel free**: 100GB bandwidth — photos are served from Supabase CDN,
  so Vercel only serves the app shell.
