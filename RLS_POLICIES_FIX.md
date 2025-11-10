# 🔧 RLS Policies Fix Guide

## Προβλήματα που Διορθώθηκαν

### 1. Storage RLS Policies Conflicts
**Πρόβλημα:** Τα RLS policies για storage buckets δημιουργούνταν χωρίς `DROP POLICY IF EXISTS`, οδηγώντας σε conflicts.

**Λύση:** 
- Δημιουργήθηκε νέο migration file: `20250109000002_fix_storage_rls_policies.sql`
- Προστέθηκε `DROP POLICY IF EXISTS` πριν από κάθε `CREATE POLICY`
- Τα policies είναι τώρα idempotent (μπορούν να τρέξουν πολλές φορές)

### 2. Migration Order
**Πρόβλημα:** Τα storage policies δημιουργούνταν πριν τα buckets.

**Λύση:**
- Τα buckets δημιουργούνται στο `20250109000001_create_storage_buckets.sql`
- Τα policies δημιουργούνται στο `20250109000002_fix_storage_rls_policies.sql`

## Πώς να Εφαρμόσεις το Fix

### Επιλογή 1: Από Supabase Dashboard
1. Πήγαινε στο Supabase Dashboard → SQL Editor
2. Αντιγράψε το περιεχόμενο του `20250109000002_fix_storage_rls_policies.sql`
3. Τρέξε το query

### Επιλογή 2: Από CLI
```bash
npm run db:push
```

### Επιλογή 3: Manual Fix
Αν έχεις ήδη conflicts, τρέξε αυτό το SQL:

```sql
-- Drop all existing storage policies
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete agent avatars" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can view property documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property documents" ON storage.objects;

-- Then run the CREATE POLICY statements from the migration file
```

## Επαλήθευση

Μετά το fix, έλεγξε ότι:
1. ✅ Τα buckets υπάρχουν (Supabase Dashboard → Storage)
2. ✅ Τα RLS policies υπάρχουν (Supabase Dashboard → Authentication → Policies)
3. ✅ Μπορείς να upload images (test από admin panel)

## Buckets που Πρέπει να Υπάρχουν

1. **property-images** (public, 5MB)
2. **agent-avatars** (public, 2MB)
3. **property-documents** (private, 10MB)

Αν τα buckets δεν υπάρχουν, δημιούργησε τα από το Supabase Dashboard → Storage → New Bucket.

