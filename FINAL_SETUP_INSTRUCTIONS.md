# 🎯 FINAL SETUP INSTRUCTIONS - Do This Now!

## ✅ What's Already Done:

- ✅ `.env.local` created with YOUR credentials
- ✅ Project: `katlwauxbsbrbegpsawk`
- ✅ All 17 migrations ready in `supabase/migrations/`

---

## 🚀 Complete These 3 Steps:

### Step 1: Run Migrations in Supabase Dashboard (5 minutes)

**Option A: Run each file (Recommended - more control)**

1. Open: **https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/sql/new**
2. For EACH file in `scripts/` folder, do this:
   - Open file in your code editor
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste in SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for "Success" message
   - Move to next file

**Files to run IN ORDER:**
```
✅ 001_create_profiles.sql
✅ 002_create_regions.sql
✅ 003_create_agents.sql
✅ 004_create_properties.sql
✅ 005_create_property_images.sql
✅ 006_create_property_documents.sql
✅ 007_create_leads.sql
✅ 008_create_saved_searches.sql
✅ 008_create_viewings.sql
✅ 009_create_syndication.sql
✅ 010_create_analytics.sql
✅ 011_create_referrals.sql
✅ 012_create_lead_scoring.sql
✅ 013_create_tasks.sql
✅ 014_create_documents_offers.sql
✅ 015_create_gdpr_compliance.sql
✅ 016_create_audit_trigger.sql
```

**Verify:** Click "Table Editor" - you should see 17 tables

---

### Step 2: Create Admin User (1 minute)

1. Go to: **https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/auth/users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in EXACTLY:
   ```
   Email: admin@spotlight.gr
   Password: Admin123!Spotlight
   Auto Confirm User: ✅ CHECK THIS BOX!
   ```
4. Click **"Create user"**
5. Verify user shows "Confirmed" status

---

### Step 3: Start Your App (1 minute)

Open a **NEW PowerShell window** (to avoid terminal issues) and run:

```powershell
cd C:\Users\xupit\Documents\GIT\v0-remix-of-spotlight-real-estate

# Install dependencies
npm install -g pnpm
pnpm install

# Start development
pnpm dev
```

**Expected output:**
```
▲ Next.js 16.0.0
- Local: http://localhost:3000
```

---

## ✅ Test Your Backend:

### Test 1: Login
1. Open: **http://localhost:3000/admin/login**
2. Enter:
   - Email: `admin@spotlight.gr`
   - Password: `Admin123!Spotlight`
3. Click "Sign In"
4. **Expected:** Dashboard loads with stats showing "0"

### Test 2: Check Console
1. Press F12
2. Go to Console tab
3. **Expected:** No red errors

### Test 3: Verify Tables
1. Go to: **https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/editor**
2. **Expected:** See all 17 tables

---

## 🎨 Add Sample Data (Optional - 2 minutes)

In SQL Editor, run this to add 5 test properties:

```sql
-- Add regions
INSERT INTO regions (name_en, name_gr, slug, description_en, featured, display_order) VALUES
  ('Athens', 'Αθήνα', 'athens', 'The capital city of Greece', true, 1),
  ('Mykonos', 'Μύκονος', 'mykonos', 'Beautiful Cycladic island', true, 2),
  ('Santorini', 'Σαντορίνη', 'santorini', 'Iconic island destination', true, 3),
  ('Thessaloniki', 'Θεσσαλονίκη', 'thessaloniki', 'Second largest city', true, 4),
  ('Crete', 'Κρήτη', 'crete', 'Largest Greek island', true, 5);

-- Add agents
INSERT INTO agents (name_en, name_gr, email, phone, bio_en, languages, specialties, featured, display_order) VALUES
  ('Maria Papadopoulos', 'Μαρία Παπαδοπούλου', 'maria@spotlight.gr', '+30 210 123 4567', 
   'Senior real estate agent specializing in luxury properties', 
   ARRAY['en', 'gr'], ARRAY['luxury', 'villa', 'waterfront'], true, 1),
  ('Dimitris Konstantinou', 'Δημήτρης Κωνσταντίνου', 'dimitris@spotlight.gr', '+30 210 123 4568',
   'Property specialist focusing on Athens area',
   ARRAY['en', 'gr', 'de'], ARRAY['apartment', 'commercial'], true, 2),
  ('Elena Georgiou', 'Έλενα Γεωργίου', 'elena@spotlight.gr', '+30 210 123 4569',
   'Island property expert',
   ARRAY['en', 'gr', 'fr'], ARRAY['island', 'vacation'], true, 3);

-- Add 5 sample properties
INSERT INTO properties (
  title_en, title_gr, description_en, property_type, listing_type, status,
  price_sale, price_rent, currency, bedrooms, bathrooms, area_sqm, plot_size_sqm, year_built,
  city_en, city_gr, published, featured, region_id, agent_id,
  features, amenities, main_image_url
)
SELECT
  'Luxury Villa with Sea View',
  'Πολυτελής Βίλα με Θέα στη Θάλασσα',
  'Stunning luxury villa in Mykonos with breathtaking panoramic sea views.',
  'villa', 'sale', 'available',
  2500000, NULL, 'EUR', 5, 4, 350, 800, 2020,
  'Mykonos', 'Μύκονος', true, true,
  (SELECT id FROM regions WHERE slug = 'mykonos'),
  (SELECT id FROM agents WHERE email = 'maria@spotlight.gr'),
  ARRAY['Infinity Pool', 'Sea View', 'Private Garden', 'Smart Home'],
  ARRAY['Fully Furnished', 'Modern Kitchen', 'Guest House'],
  '/luxury-villa-sea-view-mykonos.jpg'
UNION ALL SELECT
  'Modern Apartment in City Center', 'Μοντέρνο Διαμέρισμα',
  'Contemporary apartment in the heart of Athens.',
  'apartment', 'sale', 'available',
  450000, NULL, 'EUR', 3, 2, 120, NULL, 2018,
  'Athens', 'Αθήνα', true, true,
  (SELECT id FROM regions WHERE slug = 'athens'),
  (SELECT id FROM agents WHERE email = 'dimitris@spotlight.gr'),
  ARRAY['Balcony', 'Elevator', 'Central Heating'],
  ARRAY['Modern Kitchen', 'Built-in Wardrobes'],
  '/modern-apartment-athens-city.jpg'
UNION ALL SELECT
  'Beachfront House', 'Παραθαλάσσια Κατοικία',
  'Charming beachfront house in Santorini.',
  'house', 'sale', 'available',
  1800000, NULL, 'EUR', 4, 3, 280, 600, 2019,
  'Santorini', 'Σαντορίνη', true, true,
  (SELECT id FROM regions WHERE slug = 'santorini'),
  (SELECT id FROM agents WHERE email = 'elena@spotlight.gr'),
  ARRAY['Beach Access', 'Sea View', 'Terrace'],
  ARRAY['Fully Furnished', 'Outdoor Furniture'],
  '/beachfront-house-santorini.jpg'
UNION ALL SELECT
  'Penthouse with Acropolis View', 'Ρετιρέ με Θέα',
  'Exclusive penthouse with Acropolis views.',
  'apartment', 'sale', 'available',
  850000, NULL, 'EUR', 4, 3, 180, NULL, 2021,
  'Athens', 'Αθήνα', true, false,
  (SELECT id FROM regions WHERE slug = 'athens'),
  (SELECT id FROM agents WHERE email = 'dimitris@spotlight.gr'),
  ARRAY['Acropolis View', 'Private Terrace', 'Smart Home'],
  ARRAY['Designer Kitchen', 'Master Suite'],
  '/placeholder.svg'
UNION ALL SELECT
  'Waterfront Apartment for Rent', 'Διαμέρισμα προς Ενοικίαση',
  'Modern waterfront apartment in Thessaloniki.',
  'apartment', 'rent', 'available',
  NULL, 2800, 'EUR', 2, 1, 85, NULL, 2020,
  'Thessaloniki', 'Θεσσαλονίκη', true, false,
  (SELECT id FROM regions WHERE slug = 'thessaloniki'),
  (SELECT id FROM agents WHERE email = 'elena@spotlight.gr'),
  ARRAY['Sea View', 'Balcony', 'Parking'],
  ARRAY['Semi-Furnished', 'Equipped Kitchen'],
  '/placeholder.svg';
```

**Click "Run"** and you'll have 5 properties to test with!

---

## 🎉 Success Checklist:

- [ ] All 17 SQL files run successfully
- [ ] 17 tables visible in Table Editor
- [ ] Admin user created (admin@spotlight.gr)
- [ ] `pnpm dev` running without errors
- [ ] Can login to admin panel
- [ ] Dashboard shows stats
- [ ] Sample data displays on site
- [ ] No console errors

---

## 📊 Your Backend URLs:

- **Dashboard:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk
- **Table Editor:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/editor
- **SQL Editor:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/sql
- **Auth Users:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/auth/users
- **API Docs:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/api

---

## 🎯 Quick Commands:

```powershell
# Start development
pnpm dev

# Build for production
pnpm build

# Check for errors
pnpm lint
```

---

## 🆘 Troubleshooting:

**Can't run migrations?**
→ Make sure you're running them IN ORDER (001, 002, 003...)
→ Each must succeed before moving to next

**"relation already exists" error?**
→ That migration already ran, skip to next one

**Can't login to app?**
→ Check admin user is "Confirmed" in Auth → Users
→ Try resetting password

**No properties showing?**
→ Run the sample data SQL above
→ Check `published = true` in properties table

---

## 🎊 You're Almost Done!

Just need to:
1. Run the 17 migration files in SQL Editor
2. Create admin user
3. Start `pnpm dev`
4. Login and test!

**Your backend will be fully operational!** 🚀



