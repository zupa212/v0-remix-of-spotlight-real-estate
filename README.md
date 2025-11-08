# 🏠 Spotlight Real Estate

A modern, full-stack real estate platform built with Next.js 16, React 19, Supabase, and Tailwind CSS.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/xupiter834-gmailcoms-projects/v0-remix-of-spotlight-real-estate)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/Mr7LMwFJXNh)

## ✨ Features

- 🏡 **Property Listings** - Browse and search premium properties
- 👤 **Admin Dashboard** - Comprehensive property management system
- 📊 **Analytics** - Real-time dashboard with statistics
- 📝 **Lead Management** - Track and manage customer inquiries
- 📅 **Viewing Scheduler** - Book and manage property viewings
- 🔐 **Authentication** - Secure admin access with Supabase Auth
- 🗄️ **Database** - PostgreSQL with Row Level Security
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🌐 **SEO Optimized** - Server-side rendering with Next.js 16

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Docker Desktop (for local Supabase)

### Option 1: Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
.\setup-supabase-cli.ps1
pnpm install
pnpm dev
```

**Mac/Linux (Bash):**
```bash
chmod +x setup-supabase-cli.sh
./setup-supabase-cli.sh
pnpm install
pnpm dev
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up Supabase:**
   
   Choose one method:
   
   - **CLI (Recommended):** See [SUPABASE_CLI_SETUP.md](./SUPABASE_CLI_SETUP.md)
   - **Dashboard:** See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

3. **Configure environment:**
   
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

5. **Access the application:**
   - Public site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin/login
   - Supabase Studio: http://localhost:54323 (if using CLI)

## 📚 Documentation

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase setup via Dashboard
- **[SUPABASE_CLI_SETUP.md](./SUPABASE_CLI_SETUP.md)** - Supabase CLI setup (recommended)
- **Setup Scripts:**
  - `setup-supabase-cli.sh` - Automated setup for Mac/Linux
  - `setup-supabase-cli.ps1` - Automated setup for Windows

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

### Backend
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **ORM:** Supabase Client
- **API:** Next.js API Routes

### DevOps
- **Deployment:** Vercel
- **Database Hosting:** Supabase Cloud
- **Version Control:** Git
- **Package Manager:** pnpm

## 📁 Project Structure

```
v0-remix-of-spotlight-real-estate/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin dashboard pages
│   ├── properties/          # Property listing pages
│   ├── agents/              # Agent pages
│   └── feeds/               # API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── ...                  # Custom components
├── lib/                     # Utility libraries
│   └── supabase/           # Supabase client configs
├── scripts/                 # Database migration scripts
├── supabase/               # Supabase CLI files (if using CLI)
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## 🗄️ Database Schema

The application uses 16 database tables:

- `profiles` - User profiles
- `regions` - Property regions
- `agents` - Real estate agents
- `properties` - Property listings
- `property_images` - Property photos
- `property_documents` - Property documents
- `leads` - Customer inquiries
- `saved_searches` - User saved searches
- `viewings` - Property viewing appointments
- `syndication_mappings` - Property feed mappings
- `analytics` - Analytics tracking
- `referrals` - Referral system
- `lead_scoring` - Lead scoring
- `tasks` - Task management
- `offers` - Property offers
- `gdpr_compliance` - GDPR compliance

See `scripts/` folder for detailed schema definitions.

## 🔐 Admin Access

Default admin credentials (after running setup script):

```
Email: admin@spotlight.gr
Password: Admin123!Spotlight
```

**⚠️ Change these credentials in production!**

## 🛠️ Available Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Supabase (if using CLI)
supabase start    # Start local Supabase
supabase stop     # Stop local Supabase
supabase status   # Check status
supabase db reset # Reset database
```

## 🌐 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-production-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
   ```
4. Deploy!

### Supabase Production

1. Create production project on [Supabase](https://supabase.com)
2. Run migrations:
   ```bash
   supabase link --project-ref your-ref
   supabase db push
   ```
3. Create admin user in production
4. Update Vercel environment variables

## 🤝 Contributing

This project is built with v0.app and synced automatically. To contribute:

1. Make changes locally
2. Test thoroughly
3. Commit and push to main branch
4. Changes will sync to v0.app deployment

## 📝 License

This project is private and proprietary.

## 🆘 Support

- **Setup Issues:** See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) troubleshooting section
- **CLI Issues:** See [SUPABASE_CLI_SETUP.md](./SUPABASE_CLI_SETUP.md) troubleshooting section
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

## 🔗 Links

- **Live Demo:** [Vercel Deployment](https://vercel.com/xupiter834-gmailcoms-projects/v0-remix-of-spotlight-real-estate)
- **v0.app Chat:** [Continue Building](https://v0.app/chat/Mr7LMwFJXNh)
- **Supabase Dashboard:** [Your Project](https://supabase.com/dashboard)

---

**Built with ❤️ using v0.app, Next.js, and Supabase**