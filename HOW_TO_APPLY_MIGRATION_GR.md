# 🚀 Πώς να Εφαρμόσεις το Migration - Οδηγίες

## ⚡ Γρήγορη Εγκατάσταση (2-3 λεπτά)

### Βήμα 1: Άνοιξε το Supabase Dashboard

1. Πήγαινε στο: **https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk**
2. Login αν χρειάζεται

### Βήμα 2: Άνοιξε το SQL Editor

1. Στο **left sidebar**, βρες το **"SQL Editor"**
2. Κάνε κλικ στο **"New Query"** (μπλε κουμπί)

### Βήμα 3: Πάρε το SQL

**Επιλογή Α**: Τρέξε αυτή την εντολή στο terminal:
```bash
npm run storage:fix-rls:show
```
Αντιγράψε **ΟΛΟ** το SQL που εμφανίζεται.

**Επιλογή Β**: Άνοιξε το αρχείο:
```
supabase/migrations/20250110000002_complete_storage_rls_fix.sql
```
Αντιγράψε **ΟΛΟ** το περιεχόμενο.

### Βήμα 4: Επικόλλησε και Run

1. **Επικόλλησε** το SQL στο query editor (Ctrl+V)
2. Κάνε κλικ στο **"Run"** (ή πάτα `Ctrl+Enter`)
3. Περίμενε για **"Success. No rows returned"**

### Βήμα 5: Verify (Επαλήθευση)

1. Πήγαινε στο **Storage** → **Policies** (left sidebar)
2. Έλεγξε ότι υπάρχουν policies για:
   - ✅ `property-images` (4 policies)
   - ✅ `agent-avatars` (4 policies)
   - ✅ `property-documents` (4 policies)
3. Κάνε κλικ σε κάθε policy και έλεγξε ότι χρησιμοποιεί **`auth.uid() IS NOT NULL`** (όχι `auth.role()`)

### Βήμα 6: Test (Δοκιμή)

1. Πήγαινε στο **admin panel** της εφαρμογής
2. Προσπάθησε να **ανεβάσεις εικόνα**
3. Το error **"new row violates row-level security policy"** θα πρέπει να έχει φύγει! ✅

---

## 📋 Το SQL που χρειάζεσαι

Αν δεν μπορείς να τρέξεις το script, εδώ είναι το SQL:

```sql
-- ============================================================================
-- COMPLETE STORAGE RLS FIX - All policies with auth.uid()
-- This migration replaces all previous storage RLS policies
-- ============================================================================

-- Drop ALL existing storage policies (idempotent)
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

-- ============================================================================
-- PROPERTY-IMAGES BUCKET (Public - Anyone can view, Authenticated can modify)
-- ============================================================================

-- SELECT: Anyone can view property images (public bucket)
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- INSERT: Authenticated users can upload property images
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

-- UPDATE: Authenticated users can update property images
CREATE POLICY "Authenticated users can update property images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

-- DELETE: Authenticated users can delete property images
CREATE POLICY "Authenticated users can delete property images"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

-- ============================================================================
-- AGENT-AVATARS BUCKET (Public - Anyone can view, Authenticated can modify)
-- ============================================================================

-- SELECT: Anyone can view agent avatars (public bucket)
CREATE POLICY "Anyone can view agent avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'agent-avatars');

-- INSERT: Authenticated users can upload agent avatars
CREATE POLICY "Authenticated users can upload agent avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'agent-avatars' AND auth.uid() IS NOT NULL);

-- UPDATE: Authenticated users can update agent avatars
CREATE POLICY "Authenticated users can update agent avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'agent-avatars' AND auth.uid() IS NOT NULL);

-- DELETE: Authenticated users can delete agent avatars
CREATE POLICY "Authenticated users can delete agent avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'agent-avatars' AND auth.uid() IS NOT NULL);

-- ============================================================================
-- PROPERTY-DOCUMENTS BUCKET (Private - Only authenticated users)
-- ============================================================================

-- SELECT: Authenticated users can view property documents (private bucket)
CREATE POLICY "Authenticated users can view property documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-documents' AND auth.uid() IS NOT NULL);

-- INSERT: Authenticated users can upload property documents
CREATE POLICY "Authenticated users can upload property documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-documents' AND auth.uid() IS NOT NULL);

-- UPDATE: Authenticated users can update property documents
CREATE POLICY "Authenticated users can update property documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-documents' AND auth.uid() IS NOT NULL);

-- DELETE: Authenticated users can delete property documents
CREATE POLICY "Authenticated users can delete property documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-documents' AND auth.uid() IS NOT NULL);
```

---

## ✅ Μετά την Εφαρμογή

### Verify με Script:
```bash
npm run storage:check
```

Αυτό θα ελέγξει αν οι policies είναι σωστές.

### Test Upload:
1. Άνοιξε το admin panel
2. Πήγαινε σε Properties → Edit Property
3. Προσπάθησε να ανεβάσεις εικόνα
4. Θα πρέπει να λειτουργεί! ✅

---

## 🆘 Αν Κάτι Πάει Στραβά

### Error: "policy already exists"
- **Δεν είναι πρόβλημα!** Το migration είναι idempotent
- Μπορείς να το τρέξεις πολλές φορές

### Error: "permission denied"
- Έλεγξε ότι είσαι logged in στο Supabase Dashboard
- Έλεγξε ότι έχεις admin access

### Upload ακόμα δεν λειτουργεί:
1. Έλεγξε ότι το migration τρέχει χωρίς errors
2. Έλεγξε ότι είσαι logged in στο admin panel
3. Έλεγξε browser console για errors
4. Run: `npm run storage:check`

---

## 📊 Τι Κάνει το Migration

1. **Διαγράφει** τις παλιές policies (που χρησιμοποιούν `auth.role()`)
2. **Δημιουργεί** νέες policies (που χρησιμοποιούν `auth.uid()`)
3. **Καλύπτει** όλα τα 3 buckets
4. **Καλύπτει** όλες τις operations (SELECT, INSERT, UPDATE, DELETE)

**Total**: 12 policies για 3 buckets

---

## ⏱️ Χρόνος

- **SQL Application**: 2-3 λεπτά
- **Verification**: 1-2 λεπτά
- **Testing**: 1-2 λεπτά
- **Total**: ~5-7 λεπτά

---

**Status**: ✅ Ready to apply  
**Difficulty**: 🟢 Easy  
**Time**: 5-7 minutes  

