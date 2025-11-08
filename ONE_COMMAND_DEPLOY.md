# ⚡ ONE COMMAND DEPLOYMENT - Complete Setup

## 🎯 Deploy Everything with ONE Command!

---

## 🚀 WINDOWS (PowerShell) - COPY THIS:

```powershell
$env:SB_PROJECT_REF = "katlwauxbsbrbegpsawk"; $env:SUPABASE_ACCESS_TOKEN = "sb_secret_WQgMq6THo5hj7zZEKrTVNw_JxaguNpg"; npm run deploy:online
```

**That's it!** One line deploys everything! 🎉

---

## 🚀 MAC/LINUX (Bash) - COPY THIS:

```bash
export SB_PROJECT_REF=katlwauxbsbrbegpsawk && export SUPABASE_ACCESS_TOKEN=sb_secret_WQgMq6THo5hj7zZEKrTVNw_JxaguNpg && npm run deploy:online:bash
```

---

## ⏱️ What Happens (75 seconds):

1. **Links to Supabase** (5s)
2. **Pushes 19 migrations** (30s)
3. **Enables Realtime on 23 tables** (10s)
4. **Seeds sample data** (10s)
5. **Deploys Edge Functions** (10s)
6. **Verifies everything** (10s)

**Total:** ~75 seconds

---

## ✅ After Deployment:

### 1. Create Admin User (30s):
https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/auth/users

```
Email: admin@spotlight.gr
Password: Admin123!Spotlight
Auto Confirm: ✅ YES
```

### 2. Configure Secrets (1min):
https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/settings/functions

```
RESEND_API_KEY=re_xxxxx
SITE_URL=https://yoursite.com
```

### 3. Enable pg_net (30s):
https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/database/extensions

```
Search: pg_net
Click: Enable
```

### 4. Test (30s):
```bash
npm run dev
# Open: http://localhost:3000/admin/login
```

---

## 🎊 You'll Have:

- ✅ 23 database tables
- ✅ Real-time everywhere
- ✅ 7 regions
- ✅ 4 agents  
- ✅ 3 properties
- ✅ Edge Functions
- ✅ Alert system
- ✅ All admin pages

---

## 🔗 Quick Links:

- **Dashboard:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk
- **Your App:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login

---

## 📱 Test These Pages:

- `/admin` - Dashboard
- `/admin/properties` - Properties
- `/admin/leads` - Leads list
- `/admin/leads/pipeline` - Pipeline ⭐ NEW!
- `/admin/tasks` - Tasks ⭐ NEW!
- `/admin/offers` - Offers ⭐ NEW!
- `/admin/saved-searches` - Alerts ⭐ NEW!
- `/admin/viewings` - Calendar
- `/debug/realtime` - Realtime test

---

## 🎉 ONE COMMAND = COMPLETE DEPLOYMENT!

**Copy the PowerShell command above and run it!** 🚀

**Τέλεια! Ένα command και όλα online!** 🇬🇷

