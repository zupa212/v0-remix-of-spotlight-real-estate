# 🚀 VERCEL DEPLOYMENT GUIDE

## ⚡ Deploy Your Spotlight Real Estate to Production!

---

## 📋 Prerequisites:

1. ✅ All migrations applied to Supabase
2. ✅ Sample data seeded
3. ✅ Admin user created
4. ✅ Local app working (http://localhost:3000)

---

## 🚀 DEPLOYMENT STEPS:

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Complete Spotlight Real Estate platform with Supabase"

# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/spotlight-real-estate.git

# Push
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Vercel CLI (Fastest)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name: spotlight-real-estate
# - Deploy!
```

**Option B: Vercel Dashboard**
1. Go to: https://vercel.com/new
2. Import your GitHub repository
3. Configure project (see below)
4. Click "Deploy"

---

## 🔐 ENVIRONMENT VARIABLES (Critical!):

### In Vercel Dashboard:

**Go to:** Project → Settings → Environment Variables

**Add these:**

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://katlwauxbsbrbegpsawk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdGx3YXV4YnNicmJlZ3BzYXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzI4MzMsImV4cCI6MjA3ODIwODgzM30.JbZMf_kqfOzkZ94cB0Q9D-8kTNx1yz2yZCl6ZWbCuWI

# Email Notifications (Optional - for alerts)
RESEND_API_KEY=re_xxxxx

# Site URL (for emails)
SITE_URL=https://your-domain.vercel.app
```

**Important:** Add to ALL environments (Production, Preview, Development)

---

## 📦 Build Settings:

### Framework Preset:
- **Framework:** Next.js

### Build Command:
```bash
npm run build
```

### Output Directory:
```
.next
```

### Install Command:
```bash
npm install --legacy-peer-deps
```

---

## 🎯 Post-Deployment:

### 1. Verify Deployment:
- Visit your Vercel URL
- Test homepage
- Test admin login
- Check all pages

### 2. Configure Custom Domain (Optional):
- Vercel → Domains
- Add your domain (e.g., spotlight.gr)
- Update DNS records
- Wait for SSL certificate

### 3. Update Supabase URLs:
- Update `SITE_URL` in Vercel env vars
- Update in Supabase Edge Function secrets
- Redeploy if needed

---

## ✅ Deployment Checklist:

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Build settings configured
- [ ] First deployment successful
- [ ] Homepage loads
- [ ] Admin login works
- [ ] All pages accessible
- [ ] Database connection works
- [ ] Real-time updates work
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Email notifications tested
- [ ] Production ready! 🎉

---

## 🔗 Important Links:

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk
- **GitHub:** https://github.com

---

## 🎊 After Deployment:

Your site will be live at:
- **Vercel URL:** https://your-project.vercel.app
- **Admin:** https://your-project.vercel.app/admin/login

---

**Ready to deploy? Run the commands above!** 🚀

**Τέλεια! Έτοιμο για production!** 🇬🇷

