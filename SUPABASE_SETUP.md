# 🚀 Complete Supabase Setup Guide for Spotlight Real Estate

This is a **comprehensive, step-by-step guide** to set up Supabase for this project. Follow every step carefully.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Supabase Project](#step-1-create-supabase-project)
3. [Get API Credentials](#step-2-get-api-credentials)
4. [Configure Environment Variables](#step-3-configure-environment-variables)
5. [Run Database Migrations](#step-4-run-database-migrations)
6. [Create First Admin User](#step-5-create-first-admin-user)
7. [Verify Connection](#step-6-verify-connection)
8. [Seed Sample Data (Optional)](#step-7-seed-sample-data-optional)
9. [Connection Architecture](#connection-architecture)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ A Supabase account (free tier is fine) - [Sign up here](https://supabase.com)
- ✅ Node.js 18+ installed
- ✅ pnpm installed (`npm install -g pnpm`)
- ✅ This project cloned locally
- ✅ Basic understanding of SQL (helpful but not required)

---

## Step 1: Create Supabase Project

### 1.1 Sign Up / Log In

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign In"**
3. Sign in with GitHub, Google, or email

### 1.2 Create New Project

1. Once logged in, click **"New Project"**
2. Select your organization (or create one)
3. Fill in project details:
   ```
   Name: spotlight-real-estate
   Database Password: [Generate a strong password - SAVE THIS!]
   Region: Choose closest to your users (e.g., Europe (Frankfurt), US East, etc.)
   Pricing Plan: Free (or Pro if needed)
   ```
4. Click **"Create new project"**
5. ⏳ **Wait 2-3 minutes** for the database to initialize
   - You'll see a progress indicator
   - Don't close the browser tab

### 1.3 Verify Project is Ready

- Once ready, you'll see the project dashboard
- Green indicator showing "Project is ready"
- You should see sections: Table Editor, SQL Editor, Authentication, etc.

---

## Step 2: Get API Credentials

### 2.1 Navigate to API Settings

1. In your Supabase project dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. You'll see the API settings page

### 2.2 Copy Your Credentials

You need **two values**:

#### **Project URL**
- Look for the section: **"Project URL"**
- It looks like: `https://abcdefghijklmnop.supabase.co`
- Click the **copy icon** next to it
- Save this somewhere temporarily

#### **API Keys - anon/public**
- Scroll down to **"Project API keys"**
- Find the **"anon" "public"** key (NOT the service_role key)
- It's a long string starting with `eyJ...`
- Click the **copy icon** next to it
- Save this somewhere temporarily

**⚠️ Important:**
- The `anon` key is safe to use in client-side code
- **NEVER** expose the `service_role` key in your frontend
- Keep your database password secure

---

## Step 3: Configure Environment Variables

### 3.1 Create `.env.local` File

1. In your project root directory (where `package.json` is), create a new file named **`.env.local`**
2. Add the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
```

### 3.2 Replace with Your Actual Values

Replace the placeholder values with what you copied in Step 2:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMDAwMDAwMCwiZXhwIjoxOTQ1NTc2MDAwfQ.your-actual-signature-here
```

### 3.3 Verify File Location

Your project structure should now look like:

```
v0-remix-of-spotlight-real-estate/
├── .env.local          ← NEW FILE (should be here)
├── .gitignore          ← Should contain .env.local
├── package.json
├── app/
├── components/
├── lib/
└── scripts/
```

### 3.4 Confirm .gitignore

Open `.gitignore` and verify it contains:

```
.env.local
.env*.local
```

This ensures your credentials are never committed to Git.

---

## Step 4: Run Database Migrations

### 4.1 Open Supabase SQL Editor

1. Go back to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

### 4.2 Run Migrations in Order

You need to run **16 SQL migration files** in the `scripts/` folder **in numerical order**.

#### Migration 1: Create Profiles Table

1. Open `scripts/001_create_profiles.sql` in your code editor
2. Copy the **entire contents**
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl/Cmd + Enter)
5. ✅ Verify: You should see "Success. No rows returned"

#### Migration 2: Create Regions Table

1. Open `scripts/002_create_regions.sql`
2. Copy entire contents
3. Paste into SQL Editor (clear previous query first)
4. Click **"Run"**
5. ✅ Verify success message

#### Continue for All Migrations

Repeat the above process for each file in order:

- ✅ `001_create_profiles.sql` - User profiles
- ✅ `002_create_regions.sql` - Property regions
- ✅ `003_create_agents.sql` - Real estate agents
- ✅ `004_create_properties.sql` - Property listings
- ✅ `005_create_property_images.sql` - Property photos
- ✅ `006_create_property_documents.sql` - Property documents
- ✅ `007_create_leads.sql` - Customer inquiries
- ✅ `008_create_saved_searches.sql` - Saved searches
- ✅ `008_create_viewings.sql` - Property viewings
- ✅ `009_create_syndication.sql` - Property syndication
- ✅ `010_create_analytics.sql` - Analytics tracking
- ✅ `011_create_referrals.sql` - Referral system
- ✅ `012_create_lead_scoring.sql` - Lead scoring
- ✅ `013_create_tasks.sql` - Task management
- ✅ `014_create_documents_offers.sql` - Documents & offers
- ✅ `015_create_gdpr_compliance.sql` - GDPR compliance
- ✅ `016_create_audit_trigger.sql` - Audit logging

**⚠️ Important Notes:**
- Run them **in order** (001, 002, 003, etc.)
- If you get an error, read it carefully - it might indicate a dependency issue
- Some scripts create triggers and functions - these are normal

### 4.3 Verify Tables Were Created

1. Click **"Table Editor"** in the left sidebar
2. You should see all tables listed:
   - profiles
   - regions
   - agents
   - properties
   - property_images
   - leads
   - viewings
   - etc.

If you see all these tables, **migrations are complete!** ✅

---

## Step 5: Create First Admin User

### 5.1 Enable Email Auth

1. Go to **"Authentication"** in the left sidebar
2. Click **"Providers"**
3. Ensure **"Email"** is enabled (it should be by default)

### 5.2 Create Admin User

1. Click **"Users"** under Authentication
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   ```
   Email: admin@spotlight.gr
   Password: [Choose a secure password - SAVE THIS!]
   Auto Confirm User: ✅ YES (check this box)
   ```
4. Click **"Create user"**

### 5.3 Verify User Creation

- You should see the user in the users list
- Status should be "Confirmed"
- Email should be "admin@spotlight.gr"

**🎉 You now have an admin account to log into the system!**

---

## Step 6: Verify Connection

### 6.1 Install Dependencies

Open your terminal in the project directory:

```bash
pnpm install
```

Wait for all packages to install.

### 6.2 Start Development Server

```bash
pnpm dev
```

You should see:

```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

### 6.3 Test Public Pages

1. Open browser to `http://localhost:3000`
2. You should see the homepage
3. Navigate to **Properties** page
4. **Expected:** Empty state or "No properties found" (this is normal - no data yet)

### 6.4 Test Admin Login

1. Go to `http://localhost:3000/admin/login`
2. Enter credentials:
   ```
   Email: admin@spotlight.gr
   Password: [the password you set in Step 5.2]
   ```
3. Click **"Sign In"**
4. **Expected:** Redirect to `/admin` dashboard
5. **Success indicators:**
   - Dashboard loads without errors
   - Stats show "0" (no data yet)
   - No error messages in browser console

### 6.5 Check Browser Console

1. Press **F12** to open Developer Tools
2. Go to **"Console"** tab
3. **Expected:** No red error messages about Supabase
4. **If you see errors:** Jump to [Troubleshooting](#troubleshooting)

---

## Step 7: Seed Sample Data (Optional)

To test the system with sample data, you can add some manually:

### 7.1 Add a Region

1. Go to Supabase → **Table Editor** → **regions**
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   ```
   name_en: Athens
   name_gr: Αθήνα
   slug: athens
   description_en: The capital city of Greece
   featured: true
   ```
4. Click **"Save"**

### 7.2 Add an Agent

1. Go to **Table Editor** → **agents**
2. Click **"Insert row"**
3. Fill in:
   ```
   name_en: Maria Papadopoulos
   name_gr: Μαρία Παπαδοπούλου
   email: maria@spotlight.gr
   phone: +30 210 123 4567
   bio_en: Senior real estate agent
   featured: true
   ```
4. Click **"Save"**

### 7.3 Add a Property

1. Go to **Table Editor** → **properties**
2. Click **"Insert row"**
3. Fill in:
   ```
   title_en: Luxury Villa with Sea View
   title_gr: Πολυτελής Βίλα με Θέα στη Θάλασσα
   description_en: Beautiful villa in Mykonos
   property_type: villa
   listing_type: sale
   status: available
   price_sale: 2500000
   currency: EUR
   bedrooms: 5
   bathrooms: 4
   area_sqm: 350
   city_en: Mykonos
   published: true
   region_id: [select the Athens region you created]
   agent_id: [select the agent you created]
   ```
4. Click **"Save"**

### 7.4 Verify Sample Data

1. Refresh your app at `http://localhost:3000/properties`
2. You should now see the property you created
3. Click on it to see the detail page
4. Go to `/admin` to see updated dashboard stats

---

## Connection Architecture

### How Supabase is Connected

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Browser    │  │   Server     │  │  Middleware  │ │
│  │  Components  │  │  Components  │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │          │
│         ▼                 ▼                  ▼          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ client.ts    │  │ server.ts    │  │middleware.ts │ │
│  │ (Browser)    │  │ (SSR/API)    │  │ (Auth)       │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │          │
│         └─────────────────┴──────────────────┘          │
│                           │                             │
│                           ▼                             │
│                  ┌─────────────────┐                    │
│                  │  @supabase/ssr  │                    │
│                  └────────┬────────┘                    │
└───────────────────────────┼─────────────────────────────┘
                            │
                            │ HTTPS + Auth
                            ▼
                ┌───────────────────────┐
                │   Supabase Cloud      │
                ├───────────────────────┤
                │ • PostgreSQL Database │
                │ • Authentication      │
                │ • Row Level Security  │
                │ • Real-time           │
                └───────────────────────┘
```

### File Breakdown

#### 1. **Client-Side** (`lib/supabase/client.ts`)

**Purpose:** Browser/client-side Supabase operations

**Used in:**
- `app/admin/login/page.tsx` - User login/logout
- `components/inquiry-form.tsx` - Form submissions
- `components/property-form.tsx` - Property CRUD
- `app/admin/leads/page.tsx` - Lead management
- `app/admin/viewings/page.tsx` - Viewing management

**Example:**
```typescript
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
await supabase.auth.signInWithPassword({ email, password })
```

#### 2. **Server-Side** (`lib/supabase/server.ts`)

**Purpose:** Server-side data fetching (SSR, API routes)

**Used in:**
- `app/properties/page.tsx` - Property listings
- `app/properties/[id]/page.tsx` - Property details
- `app/admin/page.tsx` - Dashboard statistics
- `app/admin/properties/page.tsx` - Admin property list
- `app/feeds/[portal]/route.ts` - XML feed generation

**Example:**
```typescript
import { createClient } from "@/lib/supabase/server"

const supabase = await createClient()
const { data } = await supabase.from("properties").select("*")
```

#### 3. **Middleware** (`lib/supabase/middleware.ts`)

**Purpose:** Session management and route protection

**Protects:**
- All `/admin/*` routes
- Redirects to `/admin/login` if not authenticated

**Auto-runs on:** Every request (configured in `middleware.ts`)

### Environment Variables

```env
# Required for ALL Supabase connections
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

**Why NEXT_PUBLIC_?**
- Makes variables available to both client and server
- Safe because `anon` key is protected by Row Level Security (RLS)

---

## Troubleshooting

### ❌ Error: "Missing environment variables"

**Symptoms:**
- App crashes on startup
- Console shows: `Error: supabaseUrl is required`

**Solution:**
1. Verify `.env.local` exists in project root
2. Check variable names are **exact** (case-sensitive):
   - `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not `ANON_KEY`)
3. Restart dev server: `Ctrl+C` then `pnpm dev`
4. Clear Next.js cache: `rm -rf .next` then restart

---

### ❌ Error: "Invalid API key"

**Symptoms:**
- Login fails with "Invalid login credentials"
- Console shows 401 errors

**Solution:**
1. Go to Supabase → Settings → API
2. Copy the **anon/public** key again (not service_role)
3. Update `.env.local`
4. Restart dev server

---

### ❌ Error: "relation 'properties' does not exist"

**Symptoms:**
- Pages load but show errors
- Console shows SQL errors about missing tables

**Solution:**
1. You didn't run all migrations
2. Go back to [Step 4](#step-4-run-database-migrations)
3. Run **all** SQL scripts in order
4. Verify tables exist in Table Editor

---

### ❌ Error: "Row Level Security policy violation"

**Symptoms:**
- Can't read/write data
- Console shows "new row violates row-level security policy"

**Solution:**
1. RLS policies are too strict
2. Check migration files ran successfully
3. For testing, you can temporarily disable RLS:
   ```sql
   ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
   ```
4. **⚠️ Re-enable in production!**

---

### ❌ Error: "Failed to fetch"

**Symptoms:**
- Network errors in console
- Can't connect to Supabase

**Solution:**
1. Check internet connection
2. Verify Supabase project is active (not paused)
3. Check project URL is correct in `.env.local`
4. Try accessing Supabase dashboard - if it's down, wait for it to come back

---

### ❌ Login works but dashboard shows no data

**Symptoms:**
- Can log in successfully
- Dashboard shows all zeros
- No errors in console

**Solution:**
- **This is normal!** You have no data yet
- Add sample data using [Step 7](#step-7-seed-sample-data-optional)
- Or use the admin panel to create properties manually

---

### ❌ Can't create admin user

**Symptoms:**
- "Create user" button doesn't work
- Email confirmation required

**Solution:**
1. In Supabase → Authentication → Providers
2. Click **Email** provider
3. **Disable** "Confirm email" requirement
4. Save changes
5. Try creating user again

---

### 🆘 Still Having Issues?

1. **Check Supabase Status:** https://status.supabase.com
2. **Clear browser cache:** Hard refresh (Ctrl+Shift+R)
3. **Check Node version:** `node -v` (should be 18+)
4. **Reinstall dependencies:** `rm -rf node_modules pnpm-lock.yaml && pnpm install`
5. **Check Supabase logs:** Dashboard → Logs → Database logs

---

## ✅ Success Checklist

Before considering setup complete, verify:

- [ ] Supabase project created and active
- [ ] `.env.local` file exists with correct credentials
- [ ] All 16 migration scripts executed successfully
- [ ] All tables visible in Supabase Table Editor
- [ ] Admin user created and confirmed
- [ ] Can log into `/admin/login` successfully
- [ ] Dashboard loads without errors
- [ ] No console errors about Supabase
- [ ] (Optional) Sample data added and displays correctly

---

## 🎉 Next Steps

Once setup is complete:

1. **Add real data:** Use admin panel to create properties, agents, regions
2. **Configure authentication:** Set up email templates, OAuth providers
3. **Set up storage:** Configure Supabase Storage for property images
4. **Deploy:** Deploy to Vercel and add production env vars
5. **Monitor:** Set up Supabase monitoring and alerts

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Community](https://github.com/supabase/supabase/discussions)

---

**Last Updated:** November 2024  
**Project:** Spotlight Real Estate v0-remix  
**Supabase Version:** Latest (SSR with @supabase/ssr)

