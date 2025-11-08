# 🔴 REALTIME STATUS - QUICK CHECK

## ✅ Based on Your Code:

**Migration File:** `supabase/migrations/20250108000001_enable_realtime.sql` ✅ EXISTS

**Realtime Enabled For:** 23 tables ✅

**REPLICA IDENTITY FULL:** All tables ✅

---

## 🔍 TO SEE ACTUAL SERVER STATUS:

### Step 1: Run Verification SQL

**Open:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/sql/new

**Copy/Paste:**
```sql
-- Quick Realtime Status Check
SELECT 
  COUNT(*) AS tables_in_realtime,
  CASE 
    WHEN COUNT(*) >= 23 THEN '✅ All 23 tables enabled'
    WHEN COUNT(*) > 0 THEN '⚠️ Only ' || COUNT(*) || ' tables enabled'
    ELSE '❌ NO TABLES in realtime - RUN MIGRATION!'
  END AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**Click:** "Run"

---

### Step 2: List All Tables

```sql
-- See which tables are in realtime
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
ORDER BY tablename;
```

**Expected:** 23 tables listed

---

### Step 3: Check REPLICA IDENTITY

```sql
-- Check if REPLICA IDENTITY FULL is set
SELECT 
  tablename,
  CASE 
    WHEN relreplident = 'f' THEN '✅ FULL'
    ELSE '❌ NOT FULL'
  END AS replica_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND tablename IN ('properties', 'leads', 'viewings', 'offers', 'saved_searches')
ORDER BY tablename;
```

**Expected:** All should show `✅ FULL`

---

## 🧪 Test Realtime (If Enabled):

1. **Open:** `http://localhost:3000/debug/realtime`
2. **Check Status:** Should say "✅ Connected"
3. **Click:** "Insert Dummy Property"
4. **Watch:** INSERT event should appear!

---

## ⚠️ If Realtime is NOT Working:

**Run Migration:**
1. Open: `supabase/migrations/20250108000001_enable_realtime.sql`
2. Copy entire file
3. Paste in SQL Editor
4. Run
5. Verify again

---

## 📊 Expected Results:

✅ **Publication exists:** `supabase_realtime`
✅ **23 tables** in publication
✅ **REPLICA IDENTITY FULL** on key tables
✅ **Debug page** shows "Connected"

---

**Run the SQL queries above to see the ACTUAL status on your server!** 🔍

