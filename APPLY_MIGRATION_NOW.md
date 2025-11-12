# 🚨 URGENT: Apply Storage RLS Migration NOW

## ⚠️ Current Error
```
POST .../storage/v1/object/property-images/temp/... 400 (Bad Request)
Upload error: new row violates row-level security policy
```

## ✅ Solution: Apply Migration

Το migration **ΔΕΝ** έχει εφαρμοστεί ακόμα στο Supabase. Πρέπει να το κάνεις **ΤΩΡΑ**:

### 📋 Step-by-Step Instructions

#### 1. Άνοιξε το Supabase Dashboard
- Πήγαινε στο: https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk
- Login αν χρειάζεται

#### 2. Πήγαινε στο SQL Editor
- Left sidebar → **SQL Editor**
- Click **New Query**

#### 3. Αντιγράψε το SQL

Εκτέλεσε αυτή την εντολή στο terminal:
```bash
npm run storage:fix-rls:show
```

Αντιγράψε **ΟΛΟ** το SQL που εμφανίζεται.

#### 4. Επικόλλησε στο SQL Editor
- Paste το SQL στο query editor
- Click **Run** (ή πάτα `Ctrl+Enter`)

#### 5. Περίμενε για "Success"
- Θα δεις: "Success. No rows returned"
- Αν δεις errors, μην ανησυχείς - κάποια μπορεί να είναι "already exists" (normal)

#### 6. Verify
- Πήγαινε στο **Storage** → **Policies** (left sidebar)
- Έλεγξε ότι υπάρχουν policies για:
  - ✅ `property-images`
  - ✅ `agent-avatars`
  - ✅ `property-documents`
- Κάθε bucket πρέπει να έχει 4 policies: SELECT, INSERT, UPDATE, DELETE

#### 7. Test
- Πήγαινε στο admin panel
- Προσπάθησε να ανεβάσεις εικόνα
- Το error θα πρέπει να έχει φύγει!

---

## 🔍 Quick Check

Μετά την εφαρμογή, τρέξε:
```bash
npm run storage:check
```

Αυτό θα ελέγξει αν οι policies είναι σωστές.

---

## 📝 Alternative: Copy SQL Directly

Αν δεν μπορείς να τρέξεις το script, ακολούθησε αυτά τα βήματα:

1. Άνοιξε το αρχείο: `supabase/migrations/20250110000002_complete_storage_rls_fix.sql`
2. Αντιγράψε **ΟΛΟ** το περιεχόμενο
3. Πήγαινε στο Supabase Dashboard → SQL Editor → New Query
4. Επικόλλησε και Run

---

## ⚡ Why This Is Urgent

Χωρίς αυτό το migration:
- ❌ Δεν μπορείς να ανεβάσεις εικόνες
- ❌ Το admin panel δεν λειτουργεί σωστά
- ❌ Production environment έχει broken functionality

Με το migration:
- ✅ Όλα τα uploads λειτουργούν
- ✅ Admin panel fully functional
- ✅ Production ready

---

## 🆘 Still Having Issues?

Αν μετά την εφαρμογή το error συνεχίζεται:

1. **Check if you're logged in**: Make sure you're authenticated in the admin panel
2. **Check browser console**: Look for specific error messages
3. **Verify policies**: Go to Storage → Policies and check they use `auth.uid() IS NOT NULL`
4. **Check buckets exist**: Go to Storage → Buckets and verify all 3 buckets exist

---

**Status**: 🔴 CRITICAL - Apply immediately
**Time needed**: 2-3 minutes
**Difficulty**: 🟢 Easy (copy-paste SQL)

