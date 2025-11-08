# ✅ Backend Setup Checklist

Follow this checklist to get your backend running:

## Prerequisites
- [ ] Docker Desktop installed
- [ ] Docker Desktop is **RUNNING** (green icon)
- [ ] Supabase CLI installed (✅ Done - v2.54.11)
- [ ] Project initialized (✅ Done)
- [ ] Migrations copied (✅ Done - 17 files)

## Setup Steps

### 1. Start Supabase
```powershell
supabase start
```
- [ ] Command completed successfully
- [ ] Got API URL: http://localhost:54321
- [ ] Got anon key (save this!)
- [ ] All migrations applied

### 2. Configure Environment
- [ ] Created `.env.local` file
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Create Admin User
- [ ] Opened http://localhost:54323
- [ ] Created user: admin@spotlight.gr
- [ ] Set password: Admin123!Spotlight
- [ ] ✅ Checked "Auto Confirm User"

### 4. Install & Start
```powershell
pnpm install
pnpm dev
```
- [ ] Dependencies installed
- [ ] Dev server started
- [ ] No errors in terminal

### 5. Verify Connection
- [ ] Homepage loads: http://localhost:3000
- [ ] Can login: http://localhost:3000/admin/login
- [ ] Dashboard shows stats
- [ ] No console errors (F12)
- [ ] Supabase Studio works: http://localhost:54323

### 6. Add Sample Data (Optional)
- [ ] Added at least one region
- [ ] Added at least one agent
- [ ] Added at least one property
- [ ] Property shows on public site

## Quick Commands Reference

```powershell
# Check status
supabase status

# Stop/Start
supabase stop
supabase start

# Reset database
supabase db reset

# Development
pnpm dev
```

## Troubleshooting

**Docker not running?**
→ Start Docker Desktop, wait for green icon

**Port in use?**
→ Run `supabase stop` then `supabase start`

**Tables missing?**
→ Run `supabase db reset`

**Can't login?**
→ Check admin user is confirmed in Studio

## Current Status

What's been completed:
- ✅ Supabase CLI installed
- ✅ Project initialized
- ✅ All 17 migrations prepared
- ✅ Documentation created

What you need to do:
1. Start Docker Desktop
2. Run `supabase start`
3. Follow checklist above

---

**See [CONNECT_SUPABASE.md](./CONNECT_SUPABASE.md) for detailed instructions!**

