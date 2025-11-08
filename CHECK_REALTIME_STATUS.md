# 🔴 CHECK REALTIME STATUS ON SERVER

## 🎯 Quick Check

**Run this SQL in Supabase SQL Editor:**

```sql
-- Quick check: Count tables in realtime
SELECT 
  COUNT(*) AS tables_in_realtime,
  CASE 
    WHEN COUNT(*) >= 23 THEN '✅ All tables enabled'
    WHEN COUNT(*) > 0 THEN '⚠️ Some tables missing'
    ELSE '❌ No tables in realtime - RUN MIGRATION!'
  END AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

---

## 📋 Full Verification

**Open:** `supabase/verify_realtime.sql`

**Copy/Paste** the entire file into Supabase SQL Editor

**Click:** "Run"

**Expected Results:**
- ✅ `supabase_realtime publication EXISTS`
- ✅ `23 tables` in realtime
- ✅ All key tables have `REPLICA IDENTITY FULL`

---

## 🔍 What to Check:

### 1. Publication Exists?
```sql
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';
```

### 2. Tables in Publication?
```sql
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
ORDER BY tablename;
```

**Expected:** 23 tables

### 3. REPLICA IDENTITY FULL?
```sql
SELECT tablename, relreplident 
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND tablename = 'properties';
```

**Expected:** `relreplident = 'f'` (FULL)

---

## ⚠️ If Realtime is NOT Enabled:

**Run this migration:**
1. Open: `supabase/migrations/20250108000001_enable_realtime.sql`
2. Copy all contents
3. Paste in Supabase SQL Editor
4. Click "Run"
5. Verify again with `verify_realtime.sql`

---

## 🧪 Test Realtime:

**Use the debug page:**
1. Go to: `http://localhost:3000/debug/realtime`
2. Should see: "✅ Connected - Listening for changes"
3. Click "Insert Dummy Property"
4. Should see INSERT event appear!

---

## 📊 Current Status:

Based on your migration file, Realtime **SHOULD** be enabled for:

✅ **23 Tables:**
- properties ⭐
- property_images
- property_documents
- leads ⭐
- lead_activity
- viewings ⭐
- offers ⭐
- offer_events
- documents
- saved_searches ⭐
- alerts_log
- syndication_mappings
- referrals
- analytics_clicks
- experiments
- experiment_metrics
- consents
- audit_logs
- agents
- regions
- profiles
- tasks
- task_templates

✅ **REPLICA IDENTITY FULL** on all tables

---

## 🚀 Next Steps:

1. **Run** `verify_realtime.sql` in SQL Editor
2. **Check** the results
3. **If missing**, run the migration
4. **Test** with `/debug/realtime` page

---

**Run the verification SQL NOW to see the actual status!** 🔍

