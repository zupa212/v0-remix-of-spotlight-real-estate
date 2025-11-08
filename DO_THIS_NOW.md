# ⚡ DO THIS NOW - Quick Cloud Setup

Follow these steps **in order**. Should take 10 minutes total.

---

## 🎯 Step 1: Create Supabase Project (3 minutes)

1. **Open:** https://supabase.com
2. **Sign in** with GitHub or Google
3. **Click:** "New Project" button
4. **Fill in:**
   - Name: `spotlight-real-estate`
   - Password: Click "Generate" and **SAVE IT**
   - Region: Choose closest to you
   - Plan: Free
5. **Click:** "Create new project"
6. **Wait:** 2-3 minutes (don't close tab)

**✅ When you see "Project is ready", continue to Step 2**

---

## 🔑 Step 2: Get Credentials (1 minute)

1. **Click:** "Settings" (gear icon, bottom left)
2. **Click:** "API"
3. **Copy TWO things:**
   
   **A. Project URL:**
   - Find "Project URL" section
   - Copy the URL (looks like `https://xxx.supabase.co`)
   
   **B. anon key:**
   - Find "Project API keys" section
   - Copy the **"anon" "public"** key (NOT service_role)
   - It's a long string starting with `eyJ...`

**✅ Save both values somewhere, you'll need them next**

---

## 📝 Step 3: Create .env.local (30 seconds)

**Run this PowerShell command** (replace with YOUR values):

```powershell
@"
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
"@ | Out-File -FilePath .env.local -Encoding utf8
```

**Or manually create `.env.local` file** with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

**✅ File created? Continue to Step 4**

---

## 🗄️ Step 4: Run Migrations (5 minutes)

### Option A: Using CLI (Fastest) ⭐

```powershell
# Login
supabase login

# Link to cloud (replace with YOUR project ref)
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

**Done! Skip to Step 5**

### Option B: Manual (if CLI fails)

1. **Open:** Supabase Dashboard → SQL Editor
2. **Click:** "New query"
3. **For EACH file** in `scripts/` folder (001 to 016):
   - Open the file
   - Copy ALL contents
   - Paste in SQL Editor
   - Click "Run"
   - Wait for "Success"
   - Repeat for next file

**Files to run in order:**
```
001_create_profiles.sql
002_create_regions.sql
003_create_agents.sql
004_create_properties.sql
005_create_property_images.sql
006_create_property_documents.sql
007_create_leads.sql
008_create_saved_searches.sql
008_create_viewings.sql
009_create_syndication.sql
010_create_analytics.sql
011_create_referrals.sql
012_create_lead_scoring.sql
013_create_tasks.sql
014_create_documents_offers.sql
015_create_gdpr_compliance.sql
016_create_audit_trigger.sql
```

**✅ Verify:** Click "Table Editor" - you should see 17 tables

---

## 👤 Step 5: Create Admin User (1 minute)

1. **Click:** "Authentication" in left sidebar
2. **Click:** "Users"
3. **Click:** "Add user" → "Create new user"
4. **Fill in:**
   ```
   Email: admin@spotlight.gr
   Password: Admin123!Spotlight
   Auto Confirm User: ✅ CHECK THIS!
   ```
5. **Click:** "Create user"

**✅ You should see the user with "Confirmed" status**

---

## 🚀 Step 6: Start Development (1 minute)

```powershell
# Install dependencies (if not done)
pnpm install

# Start dev server
pnpm dev
```

**Expected:**
```
▲ Next.js 16.0.0
- Local: http://localhost:3000
- Ready in 2.3s
```

**✅ Server started? Continue to Step 7**

---

## ✅ Step 7: Test Connection (2 minutes)

### Test 1: Login

1. **Open:** http://localhost:3000/admin/login
2. **Enter:**
   - Email: `admin@spotlight.gr`
   - Password: `Admin123!Spotlight`
3. **Click:** "Sign In"
4. **Expected:** Redirect to dashboard

**✅ Can you see the dashboard?**

### Test 2: Console

1. **Press:** F12 (open DevTools)
2. **Go to:** Console tab
3. **Check:** No red errors about Supabase

**✅ No errors? You're connected!**

---

## 🎨 Step 8: Add Sample Data (Optional - 3 minutes)

### Quick SQL Method:

1. **Open:** Supabase Dashboard → SQL Editor
2. **Paste and run:**

```sql
-- Add regions
INSERT INTO regions (name_en, name_gr, slug, description_en, featured) VALUES
  ('Athens', 'Αθήνα', 'athens', 'The capital city of Greece', true),
  ('Mykonos', 'Μύκονος', 'mykonos', 'Beautiful Cycladic island', true),
  ('Santorini', 'Σαντορίνη', 'santorini', 'Iconic island destination', true);

-- Add agents
INSERT INTO agents (name_en, name_gr, email, phone, bio_en, featured) VALUES
  ('Maria Papadopoulos', 'Μαρία Παπαδοπούλου', 'maria@spotlight.gr', '+30 210 123 4567', 'Senior real estate agent', true),
  ('Dimitris Konstantinou', 'Δημήτρης Κωνσταντίνου', 'dimitris@spotlight.gr', '+30 210 123 4568', 'Property specialist', true);

-- Add sample property
INSERT INTO properties (
  title_en, title_gr, description_en, property_type, listing_type, status,
  price_sale, currency, bedrooms, bathrooms, area_sqm, city_en, published,
  region_id, agent_id, featured
)
SELECT
  'Luxury Villa with Sea View',
  'Πολυτελής Βίλα με Θέα στη Θάλασσα',
  'Beautiful villa in Mykonos with stunning panoramic sea views. Features modern architecture with traditional Cycladic elements.',
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
  (SELECT id FROM agents WHERE email = 'maria@spotlight.gr'),
  true;

-- Add another property
INSERT INTO properties (
  title_en, title_gr, description_en, property_type, listing_type, status,
  price_sale, currency, bedrooms, bathrooms, area_sqm, city_en, published,
  region_id, agent_id, featured
)
SELECT
  'Modern Apartment in City Center',
  'Μοντέρνο Διαμέρισμα στο Κέντρο',
  'Contemporary apartment in the heart of Athens with easy access to all amenities.',
  'apartment',
  'sale',
  'available',
  450000,
  'EUR',
  3,
  2,
  120,
  'Athens',
  true,
  (SELECT id FROM regions WHERE slug = 'athens'),
  (SELECT id FROM agents WHERE email = 'dimitris@spotlight.gr'),
  true;
```

3. **Click:** "Run"
4. **Refresh:** http://localhost:3000/properties
5. **You should see 2 properties!** 🎉

---

## ✅ Success Checklist

Check all these:

- [ ] Supabase project created and active
- [ ] Got Project URL and anon key
- [ ] `.env.local` file exists with correct values
- [ ] All 17 tables visible in Table Editor
- [ ] Admin user created (admin@spotlight.gr)
- [ ] Dev server running (`pnpm dev`)
- [ ] Can login to admin panel
- [ ] Dashboard loads without errors
- [ ] No console errors (F12)
- [ ] (Optional) Sample data shows on site

---

## 🎉 You're Done!

Your backend is now **live and running**!

### What You Have:

- ✅ PostgreSQL database with 17 tables
- ✅ Authentication system
- ✅ REST & GraphQL APIs
- ✅ Row Level Security
- ✅ Audit logging
- ✅ Real-time capabilities
- ✅ Admin dashboard
- ✅ Public property listings

### Access Points:

- **Your App:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/login
- **Supabase Dashboard:** https://supabase.com/dashboard

### Login:

```
Email: admin@spotlight.gr
Password: Admin123!Spotlight
```

---

## 🚀 Next Steps

1. **Add more properties** via admin panel
2. **Upload property images** (we'll set up Storage next)
3. **Test all features** (leads, viewings, etc.)
4. **Customize branding** and content
5. **Deploy to Vercel** when ready

---

## 🆘 Having Issues?

### Can't login?
→ Check admin user is "Confirmed" in Supabase Dashboard → Auth → Users

### No tables?
→ Run migrations again (Step 4)

### Console errors?
→ Check `.env.local` values are correct
→ Restart dev server

### Still stuck?
→ See [CLOUD_SETUP_NOW.md](./CLOUD_SETUP_NOW.md) for detailed guide
→ See [DOCKER_ISSUE_WORKAROUND.md](./DOCKER_ISSUE_WORKAROUND.md) for troubleshooting

---

**Questions? Let me know and I'll help!** 💬

