# 🌐 Supabase Cloud Setup - Let's Do This!

Follow these steps **exactly** to get your backend running in 10 minutes.

---

## 🎯 Step 1: Create Supabase Cloud Project

### 1.1 Sign Up / Login

1. Open your browser to: **https://supabase.com**
2. Click **"Start your project"** or **"Sign In"**
3. Sign in with:
   - GitHub (recommended)
   - Google
   - Or email

### 1.2 Create New Project

1. Once logged in, you'll see your dashboard
2. Click the **"New Project"** button (green button)
3. Select your organization (or create one if first time)

### 1.3 Fill in Project Details

```
Project Name: spotlight-real-estate
Database Password: [Click "Generate a password" - COPY AND SAVE THIS!]
Region: Europe West (Ireland) or closest to you
Pricing Plan: Free
```

4. Click **"Create new project"**
5. ⏳ **Wait 2-3 minutes** - Don't close the tab!
   - You'll see "Setting up project..."
   - Progress bar will fill up
   - When done, you'll see "Project is ready"

---

## 🔑 Step 2: Get Your API Credentials

### 2.1 Navigate to API Settings

1. In your project dashboard (left sidebar), click **"Settings"** (gear icon at bottom)
2. Click **"API"** under Project Settings
3. You'll see the API configuration page

### 2.2 Copy Your Credentials

**You need TWO values:**

#### **A. Project URL**
- Section: "Project URL"
- Looks like: `https://abcdefghijklmnop.supabase.co`
- Click the **📋 copy icon** next to it
- **SAVE THIS!**

#### **B. anon/public Key**
- Section: "Project API keys"
- Find the row labeled **"anon" "public"**
- It's a LONG string starting with `eyJ...`
- Click the **📋 copy icon** next to it
- **SAVE THIS!**

**⚠️ DO NOT copy the `service_role` key - that's for server-side only!**

---

## 📝 Step 3: Configure Environment Variables

### 3.1 Create `.env.local` File

In your project root (where `package.json` is), create a file named **`.env.local`**

**Paste this content:**

```env
# Supabase Cloud Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
```

### 3.2 Replace with YOUR Values

Replace the placeholder values with what you copied in Step 2:

```env
# Supabase Cloud Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMDAwMDAwMCwiZXhwIjoxOTQ1NTc2MDAwfQ.your-signature-here
```

**✅ Save the file!**

---

## 🗄️ Step 4: Run Database Migrations

Now we'll create all 17 database tables.

### Option A: Using Supabase CLI (Easiest) ⭐

```powershell
# Login to Supabase
supabase login

# Link to your cloud project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

**To find your project-ref:**
- In Supabase Dashboard → Settings → General
- Look for "Reference ID"
- It's the part after `https://` and before `.supabase.co`
- Example: if URL is `https://abcdefg.supabase.co`, ref is `abcdefg`

### Option B: Using SQL Editor (Manual)

1. In Supabase Dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Open `scripts/001_create_profiles.sql` in your code editor
4. Copy **ALL contents**
5. Paste into SQL Editor
6. Click **"Run"** (or Ctrl/Cmd + Enter)
7. ✅ You should see "Success. No rows returned"

**Repeat for all 17 files IN ORDER:**

- ✅ `001_create_profiles.sql`
- ✅ `002_create_regions.sql`
- ✅ `003_create_agents.sql`
- ✅ `004_create_properties.sql`
- ✅ `005_create_property_images.sql`
- ✅ `006_create_property_documents.sql`
- ✅ `007_create_leads.sql`
- ✅ `008_create_saved_searches.sql`
- ✅ `008_create_viewings.sql` (note: also 008)
- ✅ `009_create_syndication.sql`
- ✅ `010_create_analytics.sql`
- ✅ `011_create_referrals.sql`
- ✅ `012_create_lead_scoring.sql`
- ✅ `013_create_tasks.sql`
- ✅ `014_create_documents_offers.sql`
- ✅ `015_create_gdpr_compliance.sql`
- ✅ `016_create_audit_trigger.sql`

### 4.3 Verify Tables Created

1. Click **"Table Editor"** in left sidebar
2. You should see ALL these tables:
   - profiles
   - regions
   - agents
   - properties
   - property_images
   - property_documents
   - leads
   - saved_searches
   - viewings
   - syndication_mappings
   - analytics
   - referrals
   - lead_scoring
   - tasks
   - offers
   - gdpr_consents
   - audit_logs

**If you see all 17 tables, you're good!** ✅

---

## 👤 Step 5: Create Admin User

### 5.1 Go to Authentication

1. In Supabase Dashboard, click **"Authentication"** in left sidebar
2. Click **"Users"**
3. Click **"Add user"** button (top right)
4. Select **"Create new user"**

### 5.2 Fill in User Details

```
Email: admin@spotlight.gr
Password: Admin123!Spotlight
Auto Confirm User: ✅ CHECK THIS BOX (very important!)
```

5. Click **"Create user"**

### 5.3 Verify User

- You should see the user in the list
- Email: admin@spotlight.gr
- Status: "Confirmed" (green checkmark)

**✅ Admin user created!**

---

## 🚀 Step 6: Start Development Server

### 6.1 Install Dependencies

```powershell
pnpm install
```

### 6.2 Start Dev Server

```powershell
pnpm dev
```

**Expected output:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

---

## ✅ Step 7: Test Everything

### Test 1: Homepage

1. Open http://localhost:3000
2. Should load without errors
3. Should see the Spotlight Real Estate homepage

### Test 2: Properties Page

1. Go to http://localhost:3000/properties
2. Should show "No properties found" (normal - no data yet)
3. No errors in console

### Test 3: Admin Login

1. Go to http://localhost:3000/admin/login
2. Enter:
   ```
   Email: admin@spotlight.gr
   Password: Admin123!Spotlight
   ```
3. Click **"Sign In"**
4. Should redirect to `/admin` dashboard

### Test 4: Admin Dashboard

1. Dashboard should load
2. Stats should show "0" (no data yet)
3. All sections visible
4. No errors

### Test 5: Browser Console

1. Press **F12** to open DevTools
2. Go to **"Console"** tab
3. Should see NO red errors about Supabase
4. If you see errors, check `.env.local` values

**✅ If all tests pass, you're connected!**

---

## 🎨 Step 8: Add Sample Data

Let's add some test data to see everything working!

### 8.1 Add Regions

In Supabase Dashboard → **Table Editor** → **regions** → **Insert** → **Insert row**

**Add these regions:**

```
Region 1:
name_en: Athens
name_gr: Αθήνα
slug: athens
description_en: The capital and largest city of Greece
featured: true
display_order: 1

Region 2:
name_en: Mykonos
name_gr: Μύκονος
slug: mykonos
description_en: Beautiful Cycladic island known for luxury properties
featured: true
display_order: 2

Region 3:
name_en: Santorini
name_gr: Σαντορίνη
slug: santorini
description_en: Iconic island with stunning sunsets and white houses
featured: true
display_order: 3
```

### 8.2 Add Agents

**Table Editor** → **agents** → **Insert row**

```
Agent 1:
name_en: Maria Papadopoulos
name_gr: Μαρία Παπαδοπούλου
email: maria@spotlight.gr
phone: +30 210 123 4567
bio_en: Senior real estate agent specializing in luxury properties with over 15 years of experience
languages: {en, gr}
specialties: {luxury, villa, waterfront}
featured: true
display_order: 1

Agent 2:
name_en: Dimitris Konstantinou
name_gr: Δημήτρης Κωνσταντίνου
email: dimitris@spotlight.gr
phone: +30 210 123 4568
bio_en: Property specialist focusing on Athens metropolitan area
languages: {en, gr, de}
specialties: {apartment, commercial}
featured: true
display_order: 2
```

### 8.3 Add Properties

**Table Editor** → **properties** → **Insert row**

```
Property 1:
title_en: Luxury Villa with Sea View
title_gr: Πολυτελής Βίλα με Θέα στη Θάλασσα
description_en: Stunning luxury villa perched on the hillside of Mykonos with breathtaking panoramic sea views. This exceptional property combines modern architecture with traditional Cycladic elements.
property_type: villa
listing_type: sale
status: available
price_sale: 2500000
currency: EUR
bedrooms: 5
bathrooms: 4
area_sqm: 350
plot_size_sqm: 800
year_built: 2020
city_en: Mykonos
published: true
featured: true
region_id: [Select Mykonos from dropdown]
agent_id: [Select Maria from dropdown]
features: {Infinity Pool, Sea View, Private Garden, Parking Space, Air Conditioning, Smart Home}
amenities: {Fully Furnished, Modern Kitchen, Walk-in Closets, Guest House}

Property 2:
title_en: Modern Apartment in City Center
title_gr: Μοντέρνο Διαμέρισμα στο Κέντρο της Πόλης
description_en: Contemporary apartment in the heart of Athens with easy access to all amenities
property_type: apartment
listing_type: sale
status: available
price_sale: 450000
currency: EUR
bedrooms: 3
bathrooms: 2
area_sqm: 120
year_built: 2018
city_en: Athens
published: true
featured: true
region_id: [Select Athens]
agent_id: [Select Dimitris]
features: {Balcony, Central Heating, Double Glazing, Elevator}
amenities: {Modern Kitchen, Built-in Wardrobes, Security Door}
```

### 8.4 Verify Sample Data

1. Refresh your app: http://localhost:3000/properties
2. You should now see 2 properties!
3. Click on one to see the detail page
4. Go to `/admin` to see updated dashboard stats

---

## 🎉 Success Checklist

- [ ] Supabase Cloud project created
- [ ] Got Project URL and anon key
- [ ] Created `.env.local` with credentials
- [ ] All 17 migrations run successfully
- [ ] All tables visible in Table Editor
- [ ] Admin user created and confirmed
- [ ] `pnpm dev` running without errors
- [ ] Can login to admin panel
- [ ] Dashboard shows statistics
- [ ] Sample data added and displays
- [ ] No console errors

---

## 🔗 Important URLs

Save these for quick access:

- **Your Supabase Dashboard:** https://supabase.com/dashboard/project/YOUR-PROJECT-REF
- **Table Editor:** https://supabase.com/dashboard/project/YOUR-PROJECT-REF/editor
- **SQL Editor:** https://supabase.com/dashboard/project/YOUR-PROJECT-REF/sql
- **Authentication:** https://supabase.com/dashboard/project/YOUR-PROJECT-REF/auth/users
- **Your App:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/login

---

## 📊 Backend Features Now Available

Once setup is complete, you'll have:

### Database (17 Tables)
- ✅ User profiles with roles
- ✅ Property regions
- ✅ Real estate agents
- ✅ Property listings
- ✅ Property images & documents
- ✅ Lead management
- ✅ Viewing scheduler
- ✅ Analytics tracking
- ✅ GDPR compliance
- ✅ Audit logging

### Authentication
- ✅ Email/password login
- ✅ Session management
- ✅ Protected admin routes
- ✅ JWT tokens

### APIs
- ✅ REST API (auto-generated)
- ✅ GraphQL API
- ✅ Realtime subscriptions
- ✅ Custom API routes

### Security
- ✅ Row Level Security (RLS)
- ✅ Encrypted passwords
- ✅ Secure sessions
- ✅ CORS configured

---

## 🛠️ Useful Commands

```powershell
# Link CLI to cloud project (optional)
supabase login
supabase link --project-ref your-ref

# Push future migrations
supabase db push

# Pull schema changes
supabase db pull

# Generate TypeScript types
supabase gen types typescript --linked > types/supabase.ts

# Development
pnpm dev
pnpm build
```

---

## 🐛 Troubleshooting

### "Invalid API key" error
→ Check `.env.local` has correct anon key (not service_role)
→ Restart dev server after creating `.env.local`

### "relation 'properties' does not exist"
→ You didn't run all migrations
→ Go back to Step 4 and run all SQL files

### "Authentication failed"
→ Check admin user is confirmed (green checkmark)
→ Try resetting password in Supabase Dashboard

### "Cannot connect to Supabase"
→ Check project URL in `.env.local` is correct
→ Verify project is active in Supabase Dashboard

---

## 🎯 Next Steps After Setup

1. **Explore Supabase Dashboard:**
   - View tables
   - Check authentication
   - Monitor API usage

2. **Add More Data:**
   - More regions
   - More agents
   - More properties

3. **Test Features:**
   - Create property via admin
   - Submit inquiry form
   - Schedule viewing

4. **Customize:**
   - Update branding
   - Add your content
   - Configure email templates

---

## 💡 Pro Tips

- **Bookmark your Supabase Dashboard** for quick access
- **Enable email templates** in Authentication → Email Templates
- **Set up Storage** for property images: Storage → Create bucket
- **Monitor usage** in Settings → Usage
- **Enable database backups** in Settings → Database

---

**Ready? Let's start with Step 1: Create your Supabase project!** 🚀

Tell me when you've created the project and I'll help with the next steps!

