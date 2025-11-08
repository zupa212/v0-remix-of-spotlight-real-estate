# 🗄️ Run Migrations Manually in Supabase Cloud

Since CLI login requires interactive mode, let's run migrations manually. It's actually quite fast!

---

## ✅ Your Credentials Are Set!

I've created your `.env.local` file with:
- ✅ Project URL: `https://katlwauxbsbrbegpsawk.supabase.co`
- ✅ Anon Key: Configured

---

## 🚀 Run Migrations Now (5 minutes)

### Step 1: Open SQL Editor

1. Go to your Supabase Dashboard
2. Click **"SQL Editor"** in left sidebar
3. Click **"New query"**

### Step 2: Run Each Migration

Copy and paste each file's contents into the SQL Editor and click "Run".

**Run these IN ORDER:**

#### Migration 1: Profiles
```
File: scripts/001_create_profiles.sql
```
1. Open the file in your code editor
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Paste in SQL Editor
4. Click "Run"
5. ✅ Should see "Success"

#### Migration 2: Regions
```
File: scripts/002_create_regions.sql
```
Repeat same process

#### Migration 3: Agents
```
File: scripts/003_create_agents.sql
```

#### Migration 4: Properties
```
File: scripts/004_create_properties.sql
```

#### Migration 5: Property Images
```
File: scripts/005_create_property_images.sql
```

#### Migration 6: Property Documents
```
File: scripts/006_create_property_documents.sql
```

#### Migration 7: Leads
```
File: scripts/007_create_leads.sql
```

#### Migration 8: Saved Searches
```
File: scripts/008_create_saved_searches.sql
```

#### Migration 9: Viewings
```
File: scripts/008_create_viewings.sql
```

#### Migration 10: Syndication
```
File: scripts/009_create_syndication.sql
```

#### Migration 11: Analytics
```
File: scripts/010_create_analytics.sql
```

#### Migration 12: Referrals
```
File: scripts/011_create_referrals.sql
```

#### Migration 13: Lead Scoring
```
File: scripts/012_create_lead_scoring.sql
```

#### Migration 14: Tasks
```
File: scripts/013_create_tasks.sql
```

#### Migration 15: Documents & Offers
```
File: scripts/014_create_documents_offers.sql
```

#### Migration 16: GDPR Compliance
```
File: scripts/015_create_gdpr_compliance.sql
```

#### Migration 17: Audit Trigger
```
File: scripts/016_create_audit_trigger.sql
```

---

## ✅ Verify Tables Created

1. Click **"Table Editor"** in left sidebar
2. You should see ALL these tables:

```
✅ profiles
✅ regions
✅ agents
✅ properties
✅ property_images
✅ property_documents
✅ leads
✅ saved_searches
✅ viewings
✅ syndication_mappings
✅ analytics
✅ referrals
✅ lead_scoring
✅ tasks
✅ offers
✅ gdpr_consents
✅ audit_logs
```

**If you see all 17 tables, migrations are complete!** 🎉

---

## 👤 Create Admin User

1. Click **"Authentication"** → **"Users"**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   ```
   Email: admin@spotlight.gr
   Password: Admin123!Spotlight
   Auto Confirm User: ✅ YES (CHECK THIS!)
   ```
4. Click **"Create user"**

**✅ User should appear with "Confirmed" status**

---

## 🚀 Start Development

```powershell
pnpm install
pnpm dev
```

---

## 🎨 Add Sample Data (Optional)

In SQL Editor, run this to add test data:

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
   'Senior real estate agent specializing in luxury properties with over 15 years of experience', 
   ARRAY['en', 'gr'], ARRAY['luxury', 'villa', 'waterfront'], true, 1),
  ('Dimitris Konstantinou', 'Δημήτρης Κωνσταντίνου', 'dimitris@spotlight.gr', '+30 210 123 4568',
   'Property specialist focusing on Athens metropolitan area',
   ARRAY['en', 'gr', 'de'], ARRAY['apartment', 'commercial'], true, 2),
  ('Elena Georgiou', 'Έλενα Γεωργίου', 'elena@spotlight.gr', '+30 210 123 4569',
   'Island property expert specializing in Cyclades region',
   ARRAY['en', 'gr', 'fr'], ARRAY['island', 'vacation', 'investment'], true, 3);

-- Add properties
INSERT INTO properties (
  title_en, title_gr, description_en, property_type, listing_type, status,
  price_sale, currency, bedrooms, bathrooms, area_sqm, plot_size_sqm, year_built,
  city_en, city_gr, published, featured, region_id, agent_id,
  features, amenities, main_image_url
)
SELECT
  'Luxury Villa with Sea View',
  'Πολυτελής Βίλα με Θέα στη Θάλασσα',
  'Stunning luxury villa perched on the hillside of Mykonos with breathtaking panoramic sea views. This exceptional property combines modern architecture with traditional Cycladic elements, featuring spacious living areas, high-end finishes, and an infinity pool overlooking the Aegean Sea.',
  'villa',
  'sale',
  'available',
  2500000,
  'EUR',
  5,
  4,
  350,
  800,
  2020,
  'Mykonos',
  'Μύκονος',
  true,
  true,
  (SELECT id FROM regions WHERE slug = 'mykonos'),
  (SELECT id FROM agents WHERE email = 'maria@spotlight.gr'),
  ARRAY['Infinity Pool', 'Sea View', 'Private Garden', 'Parking Space', 'Air Conditioning', 'Heating System', 'Solar Panels', 'Security System', 'Smart Home', 'BBQ Area'],
  ARRAY['Fully Furnished', 'Modern Kitchen', 'Walk-in Closets', 'Ensuite Bathrooms', 'Guest House', 'Wine Cellar'],
  '/luxury-villa-sea-view-mykonos.jpg'
UNION ALL
SELECT
  'Modern Apartment in City Center',
  'Μοντέρνο Διαμέρισμα στο Κέντρο της Πόλης',
  'Contemporary apartment in the heart of Athens with easy access to all amenities, shopping, and entertainment. Features modern finishes, open-plan living, and a spacious balcony.',
  'apartment',
  'sale',
  'available',
  450000,
  'EUR',
  3,
  2,
  120,
  NULL,
  2018,
  'Athens',
  'Αθήνα',
  true,
  true,
  (SELECT id FROM regions WHERE slug = 'athens'),
  (SELECT id FROM agents WHERE email = 'dimitris@spotlight.gr'),
  ARRAY['Balcony', 'Central Heating', 'Double Glazing', 'Elevator', 'Storage Room', 'Security Door'],
  ARRAY['Modern Kitchen', 'Built-in Wardrobes', 'Marble Floors', 'A/C Units'],
  '/modern-apartment-athens-city.jpg'
UNION ALL
SELECT
  'Beachfront House in Santorini',
  'Παραθαλάσσια Κατοικία στη Σαντορίνη',
  'Charming beachfront house in Santorini with direct beach access. Traditional Cycladic architecture with modern amenities. Perfect for vacation home or rental investment.',
  'house',
  'sale',
  'available',
  1800000,
  'EUR',
  4,
  3,
  280,
  600,
  2019,
  'Santorini',
  'Σαντορίνη',
  true,
  true,
  (SELECT id FROM regions WHERE slug = 'santorini'),
  (SELECT id FROM agents WHERE email = 'elena@spotlight.gr'),
  ARRAY['Beach Access', 'Sea View', 'Outdoor Shower', 'Terrace', 'BBQ Area', 'Private Parking'],
  ARRAY['Fully Furnished', 'Equipped Kitchen', 'Outdoor Furniture', 'Beach Equipment'],
  '/beachfront-house-santorini.jpg'
UNION ALL
SELECT
  'Penthouse with Acropolis View',
  'Ρετιρέ με Θέα στην Ακρόπολη',
  'Exclusive penthouse apartment with stunning Acropolis views. Top floor location with private terrace, premium finishes, and smart home technology.',
  'apartment',
  'sale',
  'available',
  850000,
  'EUR',
  4,
  3,
  180,
  NULL,
  2021,
  'Athens',
  'Αθήνα',
  true,
  false,
  (SELECT id FROM regions WHERE slug = 'athens'),
  (SELECT id FROM agents WHERE email = 'dimitris@spotlight.gr'),
  ARRAY['Acropolis View', 'Private Terrace', 'Smart Home', 'Underfloor Heating', 'VRV System', 'Security System', 'Private Elevator'],
  ARRAY['Designer Kitchen', 'Master Suite', 'Walk-in Closets', 'Laundry Room', 'Storage'],
  '/placeholder.svg'
UNION ALL
SELECT
  'Waterfront Apartment for Rent',
  'Διαμέρισμα προς Ενοικίαση στην Παραλία',
  'Modern waterfront apartment in Thessaloniki with beautiful sea views. Perfect for professionals or small families.',
  'apartment',
  'rent',
  'available',
  NULL,
  'EUR',
  2,
  1,
  85,
  NULL,
  2020,
  'Thessaloniki',
  'Θεσσαλονίκη',
  true,
  false,
  (SELECT id FROM regions WHERE slug = 'thessaloniki'),
  (SELECT id FROM agents WHERE email = 'elena@spotlight.gr'),
  ARRAY['Sea View', 'Balcony', 'Parking', 'Storage', 'A/C', 'Security Door'],
  ARRAY['Semi-Furnished', 'Equipped Kitchen', 'Built-in Wardrobes'],
  '/placeholder.svg'
WHERE EXISTS (SELECT 1 FROM regions WHERE slug = 'thessaloniki');

-- Update price_rent for the rental property
UPDATE properties 
SET price_rent = 2800 
WHERE listing_type = 'rent' AND city_en = 'Thessaloniki';
```

---

## 🎉 You're Done!

After running migrations and sample data:

1. **Refresh:** http://localhost:3000/properties
2. **You should see 5 properties!**
3. **Login:** http://localhost:3000/admin/login
4. **Dashboard should show stats**

---

**That's it! Your backend is live!** 🚀




