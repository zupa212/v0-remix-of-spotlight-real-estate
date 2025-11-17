# 🎨 Logo Upload Feature - Complete Setup Guide

## ✅ Completed Actions

### 1. ✅ Created Storage Bucket Migration
**File:** `supabase/migrations/20250118000002_create_logos_bucket.sql`
- Creates `logos` bucket in Supabase Storage
- Sets up RLS policies for authenticated uploads
- Allows public read access for displaying logos
- 2MB file size limit
- Supports PNG, JPEG, WebP, SVG formats

### 2. ✅ Created Settings Table Migration
**File:** `supabase/migrations/20250118000003_create_settings_table.sql`
- Creates `settings` table to store admin configuration
- Stores logo URL, company name, email, theme colors, scoring thresholds
- Single settings record constraint
- Auto-updates `updated_at` timestamp
- RLS policies for authenticated access

### 3. ✅ Created Settings Server Actions
**File:** `lib/actions/settings.ts`
- `getSettings()` - Fetch current settings
- `updateLogoUrl()` - Update logo URL in database
- `updateSettings()` - Update other settings
- Includes authentication checks
- Revalidates paths after updates

### 4. ✅ Created Settings Hook
**File:** `lib/hooks/use-settings.ts`
- React Query hook for fetching settings
- Caches settings for 5 minutes
- Type-safe settings interface

### 5. ✅ Updated Settings Page
**File:** `app/admin/settings/page-client.tsx`
- Logo upload with preview
- File validation (type and size)
- Upload to Supabase Storage
- Save to database via server action
- Delete logo functionality
- Loads existing logo from database

### 6. ✅ Updated Admin Header
**File:** `components/admin-header-bar.tsx`
- Displays uploaded logo
- Shows company name next to logo
- Links logo to dashboard
- Falls back to localStorage if database not available
- Responsive design (hides company name on mobile)

## 📋 Migration Steps

### Step 1: Create Storage Bucket
Run this SQL in Supabase SQL Editor:
```sql
-- File: supabase/migrations/20250118000002_create_logos_bucket.sql
-- Copy and paste the entire file content
```

### Step 2: Create Settings Table
Run this SQL in Supabase SQL Editor:
```sql
-- File: supabase/migrations/20250118000003_create_settings_table.sql
-- Copy and paste the entire file content
```

### Step 3: Verify Setup
Run this verification query:
```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'logos';

-- Check settings table exists
SELECT * FROM settings;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'settings';
```

## 🎯 How to Use

### Upload Logo:
1. Go to `/admin/settings`
2. Click "Theme" tab
3. In "Logo" section:
   - Click "Choose File"
   - Select image (PNG, JPEG, WebP, or SVG, max 2MB)
   - Preview appears automatically
   - Logo uploads to Supabase Storage
   - Click "Save Logo" to persist to database

### Delete Logo:
1. Go to `/admin/settings` → "Theme" tab
2. Click "Delete Logo" button
3. Logo is removed from database and storage

### Logo Display:
- Logo automatically appears in admin header
- Shows company name next to logo (on desktop)
- Logo links to dashboard when clicked

## 🔧 Storage Bucket Configuration

The `logos` bucket is configured with:
- **Public Access:** Yes (for displaying in header)
- **File Size Limit:** 2MB
- **Allowed Types:** PNG, JPEG, WebP, SVG
- **RLS Policies:**
  - Authenticated users can upload/update/delete
  - Public can read (for header display)

## 📊 Database Schema

### Settings Table:
```sql
- id (UUID, fixed: 00000000-0000-0000-0000-000000000000)
- logo_url (TEXT, nullable)
- company_name (TEXT, default: 'Spotlight Estate Group')
- company_email (TEXT, default: 'admin@spotlight.gr')
- primary_color (TEXT, default: '#0EA5E9')
- accent_color (TEXT, default: '#F59E0B')
- hot_threshold (INTEGER, default: 75)
- warm_threshold (INTEGER, default: 50)
- created_at, updated_at (TIMESTAMPTZ)
```

## 🚀 Next Steps

1. **Run Migrations:**
   - Apply both migration files in Supabase SQL Editor
   - Verify bucket and table are created

2. **Test Logo Upload:**
   - Upload a logo in settings
   - Verify it appears in header
   - Test delete functionality

3. **Optional Enhancements:**
   - Add logo to public site header
   - Support multiple logo sizes (favicon, etc.)
   - Add logo cropping/resizing
   - Store logo in CDN for better performance

## ✅ Status

- ✅ Storage bucket migration created
- ✅ Settings table migration created
- ✅ Server actions implemented
- ✅ Settings hook created
- ✅ Settings page updated
- ✅ Admin header updated
- ✅ Delete functionality added
- ✅ Ready to deploy!

