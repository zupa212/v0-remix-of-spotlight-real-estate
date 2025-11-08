# 🎯 START HERE - Supabase CLI Setup Complete!

## ✅ What's Been Done

1. ✅ Supabase CLI installed (v2.54.11)
2. ✅ Project initialized (`supabase init`)
3. ✅ All 17 migration files copied to `supabase/migrations/`
4. ⚠️ **Docker Desktop needs to be running**

---

## 🚨 IMPORTANT: Start Docker Desktop First!

Before proceeding, **you MUST start Docker Desktop**:

1. Open **Docker Desktop** application
2. Wait for it to fully start (you'll see a green icon)
3. Verify it's running: Open PowerShell and run `docker ps`

---

## 🚀 Next Steps (Run These Commands)

### Step 1: Start Supabase

```powershell
supabase start
```

**This will:**
- Download Docker images (first time: ~2-5 minutes)
- Start PostgreSQL database
- Start Supabase Studio
- Start Auth service
- Apply all migrations automatically

**Expected output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
        anon key: eyJhbGc...
```

### Step 2: Create .env.local

After `supabase start` completes, create `.env.local`:

```powershell
# Get the values from the output above
$apiUrl = "http://localhost:54321"
$anonKey = "YOUR_ANON_KEY_FROM_OUTPUT"

@"
# Supabase Local Development
NEXT_PUBLIC_SUPABASE_URL=$apiUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
"@ | Out-File -FilePath .env.local -Encoding utf8
```

**Or manually create `.env.local` with:**
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Step 3: Create Admin User

Open Supabase Studio: **http://localhost:54323**

Then go to: **Authentication** → **Users** → **Add user**

Fill in:
```
Email: admin@spotlight.gr
Password: Admin123!Spotlight
Auto Confirm User: ✅ YES (check this!)
```

Click **Create user**

### Step 4: Install Dependencies & Start Dev Server

```powershell
pnpm install
pnpm dev
```

### Step 5: Access Your App

- **Public Site:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/login
- **Supabase Studio:** http://localhost:54323

**Login credentials:**
```
Email: admin@spotlight.gr
Password: Admin123!Spotlight
```

---

## 📊 Verify Everything Works

After starting the dev server, check:

- [ ] Homepage loads without errors
- [ ] Properties page shows (empty is normal)
- [ ] Can login to admin panel
- [ ] Dashboard loads
- [ ] No console errors (press F12)
- [ ] Supabase Studio accessible

---

## 🛠️ Useful Commands

```powershell
# Supabase
supabase status          # Check if running
supabase stop            # Stop Supabase
supabase start           # Start Supabase
supabase db reset        # Reset database (reapply migrations)

# Development
pnpm dev                 # Start dev server
pnpm build               # Build for production

# Docker
docker ps                # Check Docker containers
```

---

## 🐛 Troubleshooting

### Error: "Docker is not running"
**Solution:** Start Docker Desktop and wait for it to fully start

### Error: "Port already in use"
**Solution:**
```powershell
supabase stop
supabase start
```

### Error: "Cannot connect to database"
**Solution:**
```powershell
supabase status  # Check if services are running
```

### Want to start fresh?
```powershell
supabase stop --no-backup
supabase start
supabase db reset
```

---

## 📚 Documentation

- **[SUPABASE_CLI_SETUP.md](./SUPABASE_CLI_SETUP.md)** - Complete CLI guide
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Cloud setup alternative
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference
- **[README.md](./README.md)** - Project overview

---

## 🎉 You're Almost There!

Just need to:
1. ✅ Start Docker Desktop
2. ✅ Run `supabase start`
3. ✅ Create `.env.local`
4. ✅ Create admin user in Studio
5. ✅ Run `pnpm dev`

---

## 🆘 Need Help?

If you encounter issues:
1. Check Docker is running: `docker ps`
2. Check Supabase status: `supabase status`
3. View logs: `supabase logs`
4. See troubleshooting in [SUPABASE_CLI_SETUP.md](./SUPABASE_CLI_SETUP.md#troubleshooting)

---

**Ready? Start Docker Desktop, then run `supabase start`! 🚀**

