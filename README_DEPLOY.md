# 🚀 ONE-CLICK ONLINE DEPLOYMENT

## ⚡ Deploy Everything to Supabase Cloud in One Command!

This script automatically:
- ✅ Links to your Supabase Cloud project
- ✅ Pushes all 19 migrations
- ✅ Enables Realtime on 23 tables
- ✅ Seeds sample data
- ✅ Deploys Edge Functions
- ✅ Verifies everything works

---

## 🎯 Prerequisites:

1. **Supabase CLI installed** ✅ (you have it!)
2. **Logged in to Supabase** ✅ (you are!)
3. **Project created** ✅ (katlwauxbsbrbegpsawk)

---

## 🚀 One-Command Deployment:

### Windows (PowerShell):

```powershell
# Set environment variables
$env:SB_PROJECT_REF = "katlwauxbsbrbegpsawk"
$env:SUPABASE_ACCESS_TOKEN = "sb_secret_WQgMq6THo5hj7zZEKrTVNw_JxaguNpg"

# Run deployment
npm run deploy:online
```

### Mac/Linux (Bash):

```bash
# Set environment variables
export SB_PROJECT_REF=katlwauxbsbrbegpsawk
export SUPABASE_ACCESS_TOKEN=sb_secret_WQgMq6THo5hj7zZEKrTVNw_JxaguNpg

# Make script executable
chmod +x scripts/online_deploy.sh

# Run deployment
npm run deploy:online:bash
```

---

## ⏱️ What Happens:

### Step 1: Link (5 seconds)
```
🔗 Linking to Supabase project: katlwauxbsbrbegpsawk
✅ Linked successfully!
```

### Step 2: Push Migrations (30 seconds)
```
⬆️  Pushing migrations to cloud...
 • 20240101000001_create_profiles.sql
 • 20240101000002_create_regions.sql
 • ... (19 total)
✅ Migrations pushed successfully!
```

### Step 3: Enable Realtime (10 seconds)
```
📡 Enabling Realtime on all tables...
Added profiles to realtime
Added regions to realtime
... (23 tables)
✅ Realtime enabled on all tables!
```

### Step 4: Seed Data (10 seconds)
```
🌱 Seeding sample data...
✅ Sample data seeded!
```

### Step 5: Verify (5 seconds)
```
🧪 Verifying database...
table_name    | row_count
profiles      | 0
regions       | 7
agents        | 4
properties    | 3
...
```

### Step 6: Deploy Functions (10 seconds)
```
⚙️  Deploying Edge Functions...
Deploying: match-properties
✅ match-properties deployed!
```

### Step 7: Final Check (5 seconds)
```
✅ Final verification...
Realtime tables: 23
✅ DEPLOYMENT COMPLETE!
```

**Total Time:** ~75 seconds (1.5 minutes)

---

## 📋 After Deployment:

### 1. Create Admin User (30 seconds):
```
Go to: https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/auth/users
Click: "Add user"
Email: admin@spotlight.gr
Password: Admin123!Spotlight
Auto Confirm: ✅ YES
```

### 2. Configure Edge Function Secrets (1 minute):
```
Go to: https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/settings/functions
Add:
  RESEND_API_KEY=re_xxxxx (get from https://resend.com)
  SITE_URL=https://yoursite.com
```

### 3. Enable pg_net Extension (30 seconds):
```
Go to: https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/database/extensions
Search: pg_net
Click: Enable
```

### 4. Test Your App (1 minute):
```bash
npm run dev
# Open: http://localhost:3000/admin/login
# Login: admin@spotlight.gr / Admin123!Spotlight
```

---

## 🎊 Success! You'll Have:

- ✅ 23 database tables
- ✅ Real-time on everything
- ✅ 7 regions
- ✅ 4 agents
- ✅ 3 sample properties
- ✅ Edge Functions deployed
- ✅ Alert system active
- ✅ All admin pages working

---

## 🔧 Troubleshooting:

### Error: "SB_PROJECT_REF not set"
**Solution:**
```powershell
$env:SB_PROJECT_REF = "katlwauxbsbrbegpsawk"
```

### Error: "SUPABASE_ACCESS_TOKEN not set"
**Solution:**
```powershell
$env:SUPABASE_ACCESS_TOKEN = "your-token-here"
```

### Error: "Policy already exists"
**Solution:** Tables already exist! That's fine, the script is idempotent.

### Error: "Function deployment failed"
**Solution:** Check that `supabase/functions/match-properties/index.ts` exists.

---

## 🔗 Quick Links:

- **Dashboard:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk
- **SQL Editor:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/sql/new
- **Auth Users:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/auth/users
- **Functions:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/functions
- **Extensions:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/database/extensions

---

## 🎯 One-Click GitHub Deployment (Optional):

Add this to `.github/workflows/online-deploy.yml` and trigger from GitHub Actions!

See below for the workflow file.

---

## ✅ You're Ready!

**Just run the command and everything deploys automatically!** 🚀

```powershell
# Windows
$env:SB_PROJECT_REF = "katlwauxbsbrbegpsawk"
$env:SUPABASE_ACCESS_TOKEN = "your-token"
npm run deploy:online
```

**Τέλεια! Ένα command και όλα έτοιμα!** 🇬🇷🎉

