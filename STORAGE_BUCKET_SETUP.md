# Storage Bucket Setup Guide

## Problem

The error `Bucket not found` occurs when trying to upload agent avatars because the `agent-avatars` storage bucket doesn't exist in Supabase.

## Solution

You have two options to create the storage buckets:

### Option 1: Run the Script (Recommended)

```bash
npm run storage:create
```

This script will:
- Check if buckets exist
- Create them if they don't exist
- Verify all 3 buckets: `property-images`, `agent-avatars`, `property-documents`

### Option 2: Manual Creation via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New Bucket**
4. Create each bucket with these settings:

#### Bucket 1: `agent-avatars`
- **Name**: `agent-avatars`
- **Public**: ✅ Yes
- **File size limit**: `2097152` (2MB)
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`

#### Bucket 2: `property-images`
- **Name**: `property-images`
- **Public**: ✅ Yes
- **File size limit**: `5242880` (5MB)
- **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

#### Bucket 3: `property-documents`
- **Name**: `property-documents`
- **Public**: ❌ No (Private)
- **File size limit**: `10485760` (10MB)
- **Allowed MIME types**: `application/pdf, image/jpeg, image/png, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Verify Buckets Exist

After creating buckets, verify they exist:

```bash
npm run test:storage
```

## RLS Policies

The RLS policies for storage buckets are already created in migration:
- `supabase/migrations/20250109000002_fix_storage_rls_policies.sql`

If you need to apply them manually:

```bash
npm run db:push
```

## Troubleshooting

### Error: "Bucket not found"
- Run `npm run storage:create` to create buckets
- Or create them manually in Supabase Dashboard

### Error: "Permission denied"
- Check RLS policies are applied: `npm run db:push`
- Verify you're authenticated (logged in as admin)

### Error: "File size exceeds limit"
- Check bucket file size limits
- Reduce image size before uploading

## Next Steps

1. ✅ Create storage buckets (`npm run storage:create`)
2. ✅ Verify buckets exist (`npm run test:storage`)
3. ✅ Test image upload in admin panel

---

**Status**: After creating buckets, image uploads will work correctly.

