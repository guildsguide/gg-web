# GG Web (deployable frontend)

This is the same search/filter prototype, now wrapped as a real Next.js
site so it can be deployed to a live URL — which is what you need for
the Booking.com / Expedia affiliate applications.

You do **not** need `npm` working locally to deploy this. GitHub and
Vercel's websites do the building for you. Steps below.

## Part A — Get the code onto GitHub (no git/npm needed)

1. Go to https://github.com and sign up if you don't have an account.
2. Click the **+** icon (top right) → **New repository**.
   - Name it `gg-web`
   - Leave it Public (or Private, doesn't matter)
   - Don't check any of the "initialize with..." boxes
   - Click **Create repository**
3. On the next page, click **"uploading an existing file"** (a blue
   link in the instructions).
4. Open the `gg-web` folder on your computer (from this chat's
   download) in File Explorer, select **all files and folders inside
   it** (not the outer `gg-web` folder itself — its *contents*), and
   drag them into the GitHub upload box in your browser.
5. Scroll down, click **Commit changes**.

Repeat the same for `gg-backend` — new repo named `gg-backend`, upload
its contents the same way.

## Part B — Deploy the frontend on Vercel

1. Go to https://vercel.com → **Sign up** using your GitHub account
   (this links them automatically).
2. Click **Add New → Project**.
3. Find and select your `gg-web` repo → **Import**.
4. Vercel auto-detects Next.js — you don't need to change any settings.
   Click **Deploy**.
5. Wait ~1-2 minutes. You'll get a live URL like
   `https://gg-web-yourname.vercel.app` — **this is the URL you put in
   the Booking.com / Expedia affiliate applications.**

## Part C — Deploy the backend on Render

The frontend needs a live backend to actually return results (right
now it'll show "Can't reach the GG backend" until this part is done).

1. Go to https://render.com → **Sign up** with GitHub.
2. Click **New → Web Service**.
3. Select your `gg-backend` repo.
4. Fill in:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Click **Create Web Service**. Wait a few minutes for it to build.
6. You'll get a URL like `https://gg-backend-yourname.onrender.com`.

Render's free tier sleeps after inactivity — the first request after
a quiet period can take ~30 seconds to wake up. Fine for a demo, worth
upgrading before real users show up.

## Part D — Connect them

1. Back in your **Vercel** project → **Settings → Environment
   Variables**.
2. Add: `NEXT_PUBLIC_API_BASE` = your Render URL from Part C (e.g.
   `https://gg-backend-yourname.onrender.com`) — no trailing slash.
3. Go to the **Deployments** tab → click the **...** menu on the latest
   deployment → **Redeploy**.

Now visit your Vercel URL — search "Rishikesh" and it should pull real
results from your live backend.

## After this

- Every time you push new file changes to GitHub (drag-and-drop
  upload again, or use GitHub Desktop later), Vercel and Render
  auto-redeploy.
- Once you have real provider API keys, update the mock files in
  `gg-backend/src/providers/` and push — no changes needed on the
  frontend or on Vercel/Render's settings.
