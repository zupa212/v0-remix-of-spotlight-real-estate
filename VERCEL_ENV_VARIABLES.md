# 🔧 VERCEL ENVIRONMENT VARIABLES - FIX BUILD ERROR

## ❌ Current Error:

```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

**Cause:** Missing Supabase environment variables in Vercel

---

## ✅ SOLUTION: Add Environment Variables to Vercel

### Step 1: Get Your Supabase Credentials

**Open:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/settings/api

**Copy these values:**
1. **Project URL**: `https://katlwauxbsbrbegpsawk.supabase.co`
2. **anon/public key**: (starts with `eyJhbGci...`)

---

### Step 2: Add to Vercel

**Open:** https://vercel.com/dashboard

1. **Go to your project** → **Settings** → **Environment Variables**

2. **Add these 2 variables:**

   **Variable 1:**
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** `https://katlwauxbsbrbegpsawk.supabase.co`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdGx3YXV4YnNicmJlZ3BzYXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzI4MzMsImV4cCI6MjA3ODIwODgzM30.JbZMf_kqfOzkZ94cB0Q9D-8kTNx1yz2yZCl6ZWbCuWI`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development

3. **Click:** "Save"

---

### Step 3: Redeploy

**Option A: Automatic (Recommended)**
- Vercel will auto-redeploy when you push to GitHub
- Or go to **Deployments** → **Redeploy** latest

**Option B: Manual**
- Go to **Deployments** tab
- Click **"..."** on latest deployment
- Click **"Redeploy"**

---

## 🔍 Verify Environment Variables

After adding, check:

1. **Settings** → **Environment Variables**
2. Should see:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📋 Required Environment Variables

### For Build (Required):
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Optional (For Admin Features):
- `SUPABASE_SERVICE_ROLE_KEY` (only if using service role in server actions)

---

## ⚠️ Important Notes:

1. **`NEXT_PUBLIC_` prefix**: Required for client-side access
2. **All Environments**: Add to Production, Preview, AND Development
3. **No Quotes**: Don't add quotes around values
4. **Case Sensitive**: Variable names are case-sensitive

---

## 🚀 After Adding Variables:

1. **Redeploy** (automatic or manual)
2. **Wait** 2-3 minutes
3. **Check** build logs - should succeed! ✅

---

## 🐛 If Still Failing:

### Check 1: Variable Names
- Must be exactly: `NEXT_PUBLIC_SUPABASE_URL`
- Must be exactly: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Check 2: Values
- URL should start with `https://`
- Key should be long JWT token

### Check 3: Environments
- Make sure checked for **Production**, **Preview**, **Development**

---

## ✅ Quick Checklist:

- [ ] Opened Supabase API settings
- [ ] Copied Project URL
- [ ] Copied anon/public key
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` to Vercel
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Saved variables
- [ ] Redeployed (or wait for auto-deploy)

---

**After adding these variables, your build will succeed!** ✅

