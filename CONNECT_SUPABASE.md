# 🔌 Connect Supabase CLI & Create Backend

This guide will connect your app to a local Supabase instance and create the complete backend.

---

## ⚡ Quick Start (3 Commands)

```powershell
# 1. Start Supabase (requires Docker Desktop running)
supabase start

# 2. Create .env.local with credentials from output
# Copy the anon key from the output above

# 3. Start development
pnpm dev
```

---

## 📋 Detailed Step-by-Step

### Step 1: Start Docker Desktop

**REQUIRED:** Docker Desktop must be running!

1. Open **Docker Desktop** application
2. Wait for it to show "Docker Desktop is running" (green icon)
3. Verify in PowerShell:
   ```powershell
   docker ps
   # Should show: CONTAINER ID   IMAGE   ... (empty list is fine)
   ```

---

### Step 2: Start Supabase Services

```powershell
supabase start
```

**What this does:**
- Downloads required Docker images (first time: 2-5 minutes)
- Starts PostgreSQL database
- Starts Supabase Studio (web UI)
- Starts Auth service
- Starts Storage service
- Starts Realtime service
- **Automatically applies all 17 migrations!**

**Expected Output:**
```
Applying migration 20240101000001_create_profiles.sql...
Applying migration 20240101000002_create_regions.sql...
...
Applying migration 20240101000017_create_audit_trigger.sql...

Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ SAVE THE `anon key` - you'll need it next!**

---

### Step 3: Configure Environment Variables

Create `.env.local` in your project root:

```env
# Supabase Local Development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**PowerShell command to create it:**
```powershell
@"
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
"@ | Out-File -FilePath .env.local -Encoding utf8
```

---

### Step 4: Verify Database Setup

Open **Supabase Studio:** http://localhost:54323

Check that all tables exist:
1. Click **"Table Editor"** in left sidebar
2. You should see all tables:
   - ✅ profiles
   - ✅ regions
   - ✅ agents
   - ✅ properties
   - ✅ property_images
   - ✅ leads
   - ✅ viewings
   - ✅ And 10 more...

If tables are missing, run:
```powershell
supabase db reset
```

---

### Step 5: Create Admin User

**Option A: Using Supabase Studio (Recommended)**

1. Open http://localhost:54323
2. Go to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. Fill in:
   ```
   Email: admin@spotlight.gr
   Password: Admin123!Spotlight
   Auto Confirm User: ✅ YES (IMPORTANT!)
   ```
5. Click **"Create user"**

**Option B: Using SQL**

Open Studio → SQL Editor and run:
```sql
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@spotlight.gr',
  crypt('Admin123!Spotlight', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;
```

---

### Step 6: Install Dependencies & Start Dev Server

```powershell
# Install dependencies (if not already done)
pnpm install

# Start development server
pnpm dev
```

**Expected output:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

---

### Step 7: Test the Connection

#### Test 1: Public Site
1. Open http://localhost:3000
2. Should load without errors
3. Navigate to **Properties** page
4. Should show empty state (no properties yet)

#### Test 2: Admin Login
1. Go to http://localhost:3000/admin/login
2. Enter:
   ```
   Email: admin@spotlight.gr
   Password: Admin123!Spotlight
   ```
3. Click **"Sign In"**
4. Should redirect to dashboard

#### Test 3: Dashboard
1. Dashboard should load with stats showing "0"
2. No error messages
3. All sections visible

#### Test 4: Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Should see NO red errors about Supabase

---

## 🗄️ Backend Architecture Created

Your backend now includes:

### Database Tables (17 total)
- **profiles** - User profiles with roles
- **regions** - Property regions (Athens, Mykonos, etc.)
- **agents** - Real estate agents
- **properties** - Property listings with full details
- **property_images** - Property photo galleries
- **property_documents** - Property documents
- **leads** - Customer inquiries and lead management
- **saved_searches** - User saved property searches
- **viewings** - Property viewing appointments
- **syndication_mappings** - Property feed syndication
- **analytics** - Page views and analytics tracking
- **referrals** - Referral system
- **lead_scoring** - Automated lead scoring
- **tasks** - Task management
- **offers** - Property offers and negotiations
- **gdpr_compliance** - GDPR consent tracking
- **audit_logs** - Audit trail for all changes

### Row Level Security (RLS)
- ✅ Public can view published properties
- ✅ Only authenticated users can manage data
- ✅ Leads can be created by anyone (contact forms)
- ✅ Admin users have full access

### Database Functions
- ✅ Auto-generate property codes (SP25-0001, etc.)
- ✅ Auto-create user profiles on signup
- ✅ Audit logging triggers
- ✅ Lead scoring calculations

### Authentication
- ✅ Email/password authentication
- ✅ Session management
- ✅ Protected admin routes
- ✅ JWT tokens

---

## 🎨 Add Sample Data

### Option 1: Using Supabase Studio (GUI)

1. Open http://localhost:54323
2. Go to **Table Editor**

**Add a Region:**
- Table: `regions`
- Click **Insert** → **Insert row**
- Fill in:
  ```
  name_en: Athens
  name_gr: Αθήνα
  slug: athens
  description_en: The capital city of Greece
  featured: true
  ```

**Add an Agent:**
- Table: `agents`
- Fill in:
  ```
  name_en: Maria Papadopoulos
  name_gr: Μαρία Παπαδοπούλου
  email: maria@spotlight.gr
  phone: +30 210 123 4567
  bio_en: Senior real estate agent specializing in luxury properties
  featured: true
  ```

**Add a Property:**
- Table: `properties`
- Fill in:
  ```
  title_en: Luxury Villa with Sea View
  title_gr: Πολυτελής Βίλα με Θέα στη Θάλασσα
  description_en: Beautiful villa in Mykonos with stunning sea views
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
  region_id: [select Athens from dropdown]
  agent_id: [select Maria from dropdown]
  ```

### Option 2: Using SQL

Open SQL Editor and run:

```sql
-- Insert regions
INSERT INTO regions (name_en, name_gr, slug, description_en, featured) VALUES
  ('Athens', 'Αθήνα', 'athens', 'The capital city of Greece', true),
  ('Mykonos', 'Μύκονος', 'mykonos', 'Beautiful Cycladic island', true),
  ('Santorini', 'Σαντορίνη', 'santorini', 'Iconic island with stunning sunsets', true);

-- Insert agents
INSERT INTO agents (name_en, name_gr, email, phone, bio_en, featured) VALUES
  ('Maria Papadopoulos', 'Μαρία Παπαδοπούλου', 'maria@spotlight.gr', '+30 210 123 4567', 'Senior real estate agent', true),
  ('Dimitris Konstantinou', 'Δημήτρης Κωνσταντίνου', 'dimitris@spotlight.gr', '+30 210 123 4568', 'Property specialist', true);

-- Insert properties
INSERT INTO properties (
  title_en, title_gr, description_en, property_type, listing_type, status,
  price_sale, currency, bedrooms, bathrooms, area_sqm, city_en, published,
  region_id, agent_id
)
SELECT
  'Luxury Villa with Sea View',
  'Πολυτελής Βίλα με Θέα στη Θάλασσα',
  'Beautiful villa in Mykonos with stunning panoramic sea views',
  'villa',
  'sale',
  'available',
  2500000,
  'EUR',
  5,
  4,
  350,
  'Mykonos',
  true,
  (SELECT id FROM regions WHERE slug = 'mykonos'),
  (SELECT id FROM agents WHERE email = 'maria@spotlight.gr');
```

---

## 🔧 Useful Commands

```powershell
# Check Supabase status
supabase status

# View all services and ports
supabase status --output json

# Stop Supabase
supabase stop

# Start Supabase
supabase start

# Reset database (reapply all migrations)
supabase db reset

# View database logs
supabase logs db

# Connect to database shell
supabase db shell

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts

# View all running Docker containers
docker ps

# View Supabase containers only
docker ps | findstr supabase
```

---

## 🐛 Troubleshooting

### Error: "Docker is not running"
**Solution:**
1. Start Docker Desktop
2. Wait for green icon
3. Run `docker ps` to verify
4. Then run `supabase start`

### Error: "Port 54321 already in use"
**Solution:**
```powershell
supabase stop
supabase start
```

Or check what's using the port:
```powershell
netstat -ano | findstr :54321
```

### Error: "relation 'properties' does not exist"
**Solution:**
```powershell
supabase db reset
```

### Error: "Cannot connect to Supabase"
**Solution:**
1. Check services are running: `supabase status`
2. Check `.env.local` has correct values
3. Restart dev server: `Ctrl+C` then `pnpm dev`

### Want to start completely fresh?
```powershell
supabase stop --no-backup
supabase start
supabase db reset
```

---

## 📊 Verify Backend is Working

Run through this checklist:

- [ ] `supabase status` shows all services running
- [ ] http://localhost:54323 opens Supabase Studio
- [ ] All 17 tables visible in Table Editor
- [ ] Admin user created and confirmed
- [ ] `.env.local` exists with correct values
- [ ] `pnpm dev` starts without errors
- [ ] Can login to admin panel
- [ ] Dashboard loads with statistics
- [ ] No console errors in browser
- [ ] Can create/view properties in admin

---

## 🚀 Next Steps After Backend is Running

1. **Add sample data** (see above)
2. **Test all admin features:**
   - Create properties
   - Manage leads
   - Schedule viewings
3. **Test public features:**
   - Browse properties
   - Submit inquiry forms
   - View property details
4. **Customize:**
   - Update branding
   - Add your content
   - Configure settings

---

## 📚 API Endpoints Available

Your backend automatically provides:

### REST API
- `GET /rest/v1/properties` - List properties
- `GET /rest/v1/properties?id=eq.{id}` - Get property
- `POST /rest/v1/leads` - Create lead
- And more...

### GraphQL API
- Available at: http://localhost:54321/graphql/v1

### Realtime
- Subscribe to table changes
- Live updates for dashboard

---

## 🎯 Current Status

- ✅ Supabase CLI installed
- ✅ Project initialized
- ✅ 17 migrations ready
- ⏳ **Waiting for Docker Desktop to start**
- ⏳ Then run `supabase start`
- ⏳ Create `.env.local`
- ⏳ Start `pnpm dev`

---

**Ready to start? Open Docker Desktop, then run `supabase start`!** 🚀

