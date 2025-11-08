# ⚡ Quick Start Guide

Get Spotlight Real Estate running in **5 minutes** with this guide.

---

## 🎯 Choose Your Setup Method

### Method 1: Automated CLI Setup (Recommended) ⭐

**Best for:** Developers who want local development with full control

**Time:** ~5 minutes

**Requirements:**
- Docker Desktop installed and running
- Node.js 18+
- pnpm

**Steps:**

1. **Clone and navigate:**
   ```bash
   cd v0-remix-of-spotlight-real-estate
   ```

2. **Run setup script:**
   
   **Windows (PowerShell):**
   ```powershell
   .\setup-supabase-cli.ps1
   ```
   
   **Mac/Linux:**
   ```bash
   chmod +x setup-supabase-cli.sh
   ./setup-supabase-cli.sh
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Start development:**
   ```bash
   pnpm dev
   ```

5. **Done!** 🎉
   - App: http://localhost:3000
   - Admin: http://localhost:3000/admin/login
   - Studio: http://localhost:54323

**Default Login:**
```
Email: admin@spotlight.gr
Password: Admin123!Spotlight
```

---

### Method 2: Cloud Dashboard Setup

**Best for:** Quick testing without Docker

**Time:** ~10 minutes

**Requirements:**
- Supabase account (free)
- Node.js 18+
- pnpm

**Steps:**

1. **Create Supabase project:**
   - Go to https://supabase.com
   - Create new project
   - Wait 2-3 minutes

2. **Get credentials:**
   - Settings → API
   - Copy Project URL and anon key

3. **Configure environment:**
   ```bash
   # Create .env.local
   echo "NEXT_PUBLIC_SUPABASE_URL=your-url" > .env.local
   echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key" >> .env.local
   ```

4. **Run migrations:**
   - Open Supabase SQL Editor
   - Run each file in `scripts/` folder (001, 002, 003...)

5. **Create admin user:**
   - Authentication → Users → Add user
   - Email: admin@spotlight.gr
   - Auto-confirm: YES

6. **Install and start:**
   ```bash
   pnpm install
   pnpm dev
   ```

7. **Done!** 🎉

**See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Project overview and features |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Detailed cloud setup guide |
| [SUPABASE_CLI_SETUP.md](./SUPABASE_CLI_SETUP.md) | CLI setup and commands |
| This file | Quick start guide |

---

## 🔧 Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Supabase CLI (if using local)
supabase start        # Start local Supabase
supabase stop         # Stop local Supabase
supabase status       # Check status
supabase db reset     # Reset database
```

---

## 🌐 Access Points

After setup, access these URLs:

| Service | URL | Description |
|---------|-----|-------------|
| **App** | http://localhost:3000 | Public website |
| **Admin** | http://localhost:3000/admin/login | Admin dashboard |
| **Studio** | http://localhost:54323 | Supabase Studio (CLI only) |

---

## 🐛 Troubleshooting

### "Docker is not running"
→ Start Docker Desktop and wait for it to fully start

### "Port already in use"
→ Run `supabase stop` then `supabase start`

### "Missing environment variables"
→ Check `.env.local` exists and has correct variables

### "Cannot connect to database"
→ Run `supabase status` to check if services are running

### More help?
→ See troubleshooting sections in:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md#troubleshooting)
- [SUPABASE_CLI_SETUP.md](./SUPABASE_CLI_SETUP.md#troubleshooting)

---

## ✅ Verify Setup

After setup, verify everything works:

- [ ] Homepage loads without errors
- [ ] Properties page shows (empty or with data)
- [ ] Can login to admin panel
- [ ] Dashboard shows statistics
- [ ] No console errors
- [ ] Supabase Studio accessible (if using CLI)

---

## 🎓 Next Steps

Once running:

1. **Add sample data:**
   - Open Supabase Studio
   - Add regions, agents, properties

2. **Explore admin panel:**
   - Create properties
   - Manage leads
   - Schedule viewings

3. **Customize:**
   - Update branding
   - Add your content
   - Configure settings

4. **Deploy:**
   - Push to GitHub
   - Deploy to Vercel
   - Link production Supabase

---

## 🆘 Need Help?

- **Setup Issues:** Check troubleshooting sections in docs
- **Supabase Help:** https://supabase.com/docs
- **Next.js Help:** https://nextjs.org/docs

---

**Ready to build? Let's go! 🚀**

