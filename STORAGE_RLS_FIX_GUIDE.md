# 🔧 Storage RLS Policy Fix Guide

## Problem
You're getting this error when uploading images:
```
Failed to upload image: new row violates row-level security policy
```

## Root Cause
The storage RLS policies are using `auth.role() = 'authenticated'` instead of `auth.uid() IS NOT NULL`, which causes permission issues.

## Solution

### Option 1: Apply via Supabase Dashboard (Recommended - Most Reliable)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy and Paste the Migration**
   - Open the file: `supabase/migrations/20250110000002_complete_storage_rls_fix.sql`
   - Copy ALL the SQL code
   - Paste it into the SQL Editor

4. **Run the Query**
   - Click **Run** (or press `Ctrl+Enter`)
   - Wait for "Success. No rows returned" message

5. **Verify the Fix**
   - Go to **Storage** → **Policies** in the left sidebar
   - Check that policies for `property-images`, `agent-avatars`, and `property-documents` exist
   - Verify they use `auth.uid() IS NOT NULL` (not `auth.role()`)

### Option 2: Apply via Supabase CLI

If you have Supabase CLI installed and linked:

```bash
# Make sure you're in the project root
cd C:\Users\xupit\Documents\GIT\v0-remix-of-spotlight-real-estate

# Push the migration
supabase db push
```

### Option 3: Manual Policy Creation

If the migration doesn't work, you can create policies manually:

1. Go to **Storage** → **Policies** in Supabase Dashboard
2. For each bucket (`property-images`, `agent-avatars`, `property-documents`):

   **For property-images and agent-avatars (Public buckets):**
   - **SELECT Policy**: `bucket_id = 'property-images'` (or `agent-avatars`)
   - **INSERT Policy**: `bucket_id = 'property-images' AND auth.uid() IS NOT NULL`
   - **UPDATE Policy**: `bucket_id = 'property-images' AND auth.uid() IS NOT NULL`
   - **DELETE Policy**: `bucket_id = 'property-images' AND auth.uid() IS NOT NULL`

   **For property-documents (Private bucket):**
   - **SELECT Policy**: `bucket_id = 'property-documents' AND auth.uid() IS NOT NULL`
   - **INSERT Policy**: `bucket_id = 'property-documents' AND auth.uid() IS NOT NULL`
   - **UPDATE Policy**: `bucket_id = 'property-documents' AND auth.uid() IS NOT NULL`
   - **DELETE Policy**: `bucket_id = 'property-documents' AND auth.uid() IS NOT NULL`

## What This Fix Does

1. **Drops all old policies** that use `auth.role() = 'authenticated'`
2. **Creates new policies** that use `auth.uid() IS NOT NULL` (more reliable)
3. **Includes SELECT policies** for reading images (was missing in previous fix)
4. **Covers all operations**: SELECT, INSERT, UPDATE, DELETE for all 3 buckets

## Verification

After applying the fix:

1. **Try uploading an image** in the admin panel
2. **Check browser console** - should see no RLS errors
3. **Verify in Supabase Dashboard**:
   - Storage → Policies
   - All policies should show `auth.uid() IS NOT NULL` (not `auth.role()`)

## Files Changed

- ✅ `supabase/migrations/20250110000002_complete_storage_rls_fix.sql` - Complete migration
- ✅ `scripts/apply-storage-rls-fix.js` - Script to apply (may need manual application)
- ✅ `package.json` - Added `npm run storage:fix-rls` script

## Still Having Issues?

1. **Check if buckets exist**: Go to Storage → Buckets in Supabase Dashboard
2. **Check if you're logged in**: Make sure you're authenticated in the admin panel
3. **Check browser console**: Look for specific error messages
4. **Verify environment variables**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

## Quick Test

After applying the fix, test with:

```bash
npm run test:storage
```

This will test upload operations for all storage buckets.

