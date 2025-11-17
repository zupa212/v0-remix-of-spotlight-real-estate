# Leads Table Column Fix - Summary

## Problem
The database schema had mismatched column names:
- Database had: `name`, `source`, `stage`
- Code expected: `full_name`, `lead_source`, `status`

## Solution

### 1. Migration Created
**File:** `supabase/migrations/20250118000001_fix_leads_columns.sql`

This migration:
- Migrates `name` → `full_name` (preserves data)
- Migrates `source` → `lead_source` (preserves data)
- Migrates `stage` → `status` (preserves data)
- Ensures all required columns exist with proper constraints
- Creates indexes for performance

### 2. Components Fixed
All components now use correct column names with fallback aliases:

✅ **Hooks:**
- `lib/hooks/use-leads.ts` - Uses `full_name`, `lead_source`, `status`
- `lib/hooks/use-recent-leads.ts` - Uses `full_name`, `lead_source`, `status`
- `lib/hooks/use-viewings.ts` - Uses `scheduled_date` ✓
- `lib/hooks/use-upcoming-viewings.ts` - Uses `scheduled_date` ✓
- `lib/hooks/use-kpis.ts` - Uses `status` and `scheduled_date` ✓

✅ **Components:**
- `components/admin-lead-drawer.tsx` - Fixed to use `full_name` and `status`
- `components/admin-leads-pipeline.tsx` - Already fixed ✓
- `components/admin-recent-leads-table.tsx` - Already fixed ✓
- `components/admin-offer-form-sheet.tsx` - Uses `lead.name` (alias) ✓
- `components/admin-task-form-sheet.tsx` - Uses `lead.name` (alias) ✓
- `components/dashboard-content.tsx` - Uses `lead.name` (alias) ✓

✅ **Server Actions:**
- `lib/actions/leads.ts` - Uses `full_name` ✓
- `lib/actions/viewings.ts` - Uses `scheduled_date` ✓

✅ **Pages:**
- `app/admin/leads/pipeline/page.tsx` - Fixed ✓
- `app/admin/leads/[id]/page.tsx` - Fixed ✓

### 3. Migration Script
**File:** `scripts/apply-leads-migration.js`

Provides instructions for applying the migration via:
- Supabase CLI
- Supabase Dashboard (SQL Editor)
- Manual SQL execution

## How to Apply Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/20250118000001_fix_leads_columns.sql`
4. Paste into SQL Editor
5. Click "Run"

### Option 2: Supabase CLI
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### Option 3: Direct SQL
Run the migration SQL directly in your database.

## Verification

After applying migration, verify columns exist:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name IN ('full_name', 'lead_source', 'status');
```

Expected result: Should return 3 rows.

## Status

✅ Migration created
✅ All components verified and fixed
✅ Migration script created
✅ Ready to apply

## Next Steps

1. **Apply the migration** to your Supabase database
2. **Test the leads page** - `/admin/leads`
3. **Verify data integrity** - Check that existing leads still display correctly
4. **Monitor for errors** - Check browser console and server logs

## Notes

- The migration preserves all existing data
- Old columns (`name`, `source`, `stage`) are removed after migration
- All code uses compatibility aliases (`name`, `stage`, `source`) for backward compatibility
- Viewings table uses `scheduled_date` (already correct)

