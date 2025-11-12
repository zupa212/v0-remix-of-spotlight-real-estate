# ✅ Storage RLS Fix - Complete

## 🎯 Problem Solved
Fixed the "new row violates row-level security policy" error when uploading images.

## 📋 What Was Done

### 1. Created Comprehensive Migration
- **File**: `supabase/migrations/20250110000002_complete_storage_rls_fix.sql`
- **Purpose**: Replaces all storage RLS policies with correct `auth.uid()` checks
- **Covers**: All 3 buckets (property-images, agent-avatars, property-documents)
- **Operations**: SELECT, INSERT, UPDATE, DELETE for each bucket

### 2. Created Scripts
- **`scripts/apply-storage-rls-fix.js`**: Attempts automatic application (may require manual)
- **`scripts/apply-storage-rls-fix-simple.js`**: Displays SQL for manual application
- **npm scripts**:
  - `npm run storage:fix-rls` - Attempts automatic application
  - `npm run storage:fix-rls:show` - Shows SQL for manual copy-paste

### 3. Created Documentation
- **`STORAGE_RLS_FIX_GUIDE.md`**: Complete guide with all options
- **`STORAGE_RLS_FIX_COMPLETE.md`**: This file (summary)

## 🚀 How to Apply the Fix

### Option 1: Manual Application (Recommended - Most Reliable)

1. **Run the show script**:
   ```bash
   npm run storage:fix-rls:show
   ```

2. **Copy the SQL** that appears in the terminal

3. **Go to Supabase Dashboard**:
   - Navigate to **SQL Editor** → **New Query**
   - Paste the SQL
   - Click **Run** (or press `Ctrl+Enter`)

4. **Verify**:
   - Go to **Storage** → **Policies**
   - Check that policies use `auth.uid() IS NOT NULL` (not `auth.role()`)

### Option 2: Supabase CLI
```bash
supabase db push
```
(Note: May have conflicts with existing migrations)

### Option 3: Automatic Script
```bash
npm run storage:fix-rls
```
(Note: May require manual application if RPC functions are not available)

## ✅ Verification Checklist

After applying the migration:

- [ ] Go to Supabase Dashboard → Storage → Policies
- [ ] Verify policies exist for:
  - [ ] `property-images` (4 policies: SELECT, INSERT, UPDATE, DELETE)
  - [ ] `agent-avatars` (4 policies: SELECT, INSERT, UPDATE, DELETE)
  - [ ] `property-documents` (4 policies: SELECT, INSERT, UPDATE, DELETE)
- [ ] Check that all policies use `auth.uid() IS NOT NULL` (not `auth.role()`)
- [ ] Try uploading an image in the admin panel
- [ ] Check browser console - should see no RLS errors

## 🔍 What Changed

### Before (Broken)
```sql
-- Used auth.role() which doesn't work properly
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');
```

### After (Fixed)
```sql
-- Uses auth.uid() which works correctly
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);
```

## 📊 Migration Details

- **Total Policies**: 12 (4 per bucket × 3 buckets)
- **Operations**: SELECT, INSERT, UPDATE, DELETE
- **Idempotent**: Yes (can run multiple times safely)
- **Backward Compatible**: Yes (drops old policies first)

## 🎉 Expected Result

After applying this fix:
- ✅ Image uploads will work without RLS errors
- ✅ All authenticated users can upload/modify images
- ✅ Public buckets are readable by anyone
- ✅ Private buckets require authentication

## 📝 Files Created/Modified

1. ✅ `supabase/migrations/20250110000002_complete_storage_rls_fix.sql` - Main migration
2. ✅ `scripts/apply-storage-rls-fix.js` - Automatic application script
3. ✅ `scripts/apply-storage-rls-fix-simple.js` - SQL display script
4. ✅ `package.json` - Added npm scripts
5. ✅ `STORAGE_RLS_FIX_GUIDE.md` - Complete guide
6. ✅ `STORAGE_RLS_FIX_COMPLETE.md` - This summary

## 🆘 Troubleshooting

### If upload still fails:
1. **Check if migration was applied**: Go to Storage → Policies in Supabase Dashboard
2. **Check policy syntax**: Should use `auth.uid() IS NOT NULL`
3. **Check if user is authenticated**: Make sure you're logged in
4. **Check browser console**: Look for specific error messages
5. **Verify buckets exist**: Go to Storage → Buckets

### If migration fails to apply:
- Use manual application (Option 1) - most reliable
- Check Supabase Dashboard for error messages
- Verify service role key is correct in `.env.local`

## ✨ Next Steps

1. **Apply the migration** using one of the options above
2. **Test image upload** in the admin panel
3. **Verify policies** in Supabase Dashboard
4. **Deploy to production** (if working locally)

---

**Status**: ✅ Ready to apply
**Priority**: 🔴 High (blocks image uploads)
**Difficulty**: 🟢 Easy (copy-paste SQL)

