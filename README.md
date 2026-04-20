# 🏁 Bois Trip Generator — Deploy Guide

You're about to deploy a real website at **justacoupleofboistrip.vercel.app** that the bois can use from their phones.

**Time:** ~15 minutes total. **Cost:** ~$5 one-time for Anthropic API credits (you'll use pennies per trip generation). Vercel is free.

---

## 📋 What You Need Before Starting

1. A **GitHub** account (free) — https://github.com
2. A **Vercel** account (free) — https://vercel.com (sign up with GitHub, it's easier)
3. An **Anthropic API key** — https://console.anthropic.com ($5 minimum deposit)
4. **Node.js** installed on your computer — https://nodejs.org (download the LTS version)
5. A terminal / command line app

---

## ⚡ Quick Path (Recommended)

### Step 1 — Get your Anthropic API key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Go to **Settings → Billing** and add $5 of credits
4. Go to **Settings → API Keys** → **Create Key**
5. Copy the key (starts with `sk-ant-api03-...`). **Save it somewhere safe — you won't see it again.**

### Step 2 — Get this project onto your computer

Open a terminal, `cd` to wherever you want the project to live (e.g. `cd ~/Desktop`), then:

```bash
# Unzip the project folder you downloaded
# cd into it
cd boistrip

# Install dependencies
npm install
```

### Step 3 — Test locally (optional but smart)

Create a file called `.env.local` in the project root:

```
ANTHROPIC_API_KEY=sk-ant-api03-paste-your-real-key-here
```

Then install the Vercel CLI and run it (this mimics the real serverless environment):

```bash
npm install -g vercel
vercel dev
```

Open http://localhost:3000 — the app should work exactly like it will in production.

Press `Ctrl+C` when done testing.

### Step 4 — Push to GitHub

```bash
# Initialize git
git init
git add .
git commit -m "initial bois trip commit"

# Create a new empty repo on github.com (name it "boistrip" — DO NOT check "add README")
# Then, back in terminal:
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/boistrip.git
git push -u origin main
```

### Step 5 — Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **"Import"** next to your `boistrip` repo
3. Vercel auto-detects it's a Vite project. You don't need to change any build settings.
4. **IMPORTANT:** Before clicking Deploy, expand **"Environment Variables"** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your `sk-ant-api03-...` key
5. Click **Deploy**. Wait ~1 minute.

### Step 6 — Get your custom URL

Vercel assigns you a random URL like `boistrip-abc123.vercel.app` by default. To get the name you want:

1. In the Vercel dashboard, open your project
2. Go to **Settings → Domains**
3. Type `justacoupleofboistrip.vercel.app` and click **Add**
4. That's it — the domain is instantly live (Vercel owns `.vercel.app` subdomains, so any available name is free)

### Step 7 — Text the bois

Open **https://justacoupleofboistrip.vercel.app** on your phone to confirm it works, then paste the link into the group chat.

---

## 🔧 How Updates Work

Anytime you want to change something (tweak the prompt, add another boi, etc.):

```bash
# Edit the files
git add .
git commit -m "what you changed"
git push
```

Vercel auto-redeploys in ~30 seconds. No manual deploy needed.

---

## 💰 Cost Breakdown

- **Vercel hosting:** $0 (free tier is plenty — millions of requests/month)
- **Anthropic API:**
  - Each trip generation (with web search) costs roughly **$0.03–$0.08**
  - $5 in credits = ~60–150 trips
  - You can set a spend limit in the Anthropic console to sleep easier
- **Domain:** $0 (the `.vercel.app` subdomain is free)

---

## 🐛 Troubleshooting

**"API error 500" when generating:**
- Your Anthropic API key isn't set in Vercel. Go to Project Settings → Environment Variables → add `ANTHROPIC_API_KEY` → redeploy.

**"API error 401":**
- Your key is wrong or got revoked. Generate a new one.

**"API error 429":**
- You're out of Anthropic credits. Top up at console.anthropic.com.

**Share link doesn't pre-fill the form:**
- Make sure the URL includes the `#plan=...` hash. Some chat apps strip hash fragments — have the bois copy-paste the full link if tapping doesn't work.

**"Something broke" on a fresh deploy:**
- Check Vercel logs: Dashboard → your project → Deployments → click the latest → Functions tab → click `/api/generate` to see error output.

---

## 🔒 Security Notes

- Your API key lives ONLY in:
  - Your local `.env.local` file (which is gitignored — won't be pushed)
  - Vercel's encrypted environment variables
- The frontend never sees it. Anyone who "inspects" your site sees only `/api/generate`, not your key.
- If you ever leak it accidentally, revoke it immediately at console.anthropic.com and generate a new one.

---

## 🎨 Customization Ideas

Files to edit:
- **`src/BoisTripGenerator.jsx`** — everything. The `BOIS` array at the top is where you add/edit bois. The prompt text around line 70 is where you tweak how Claude thinks.
- **`index.html`** — page title, meta description, Open Graph tags (for link previews in texts)
- **`public/favicon.svg`** — the icon

Enjoy, and have fun out there. 🍻
