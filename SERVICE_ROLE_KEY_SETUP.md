# 🔐 Service Role Key Setup

## 📍 Πού να το Βάλεις

### Βήμα 1: Βρες το Service Role Key

1. **Άνοιξε το Supabase Dashboard:**
   - https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk

2. **Πήγαινε σε Settings → API:**
   - Left sidebar → **Settings** (gear icon)
   - Click **API**

3. **Βρες το "service_role" key:**
   - Scroll down στο "Project API keys" section
   - Βρες το **"service_role"** key (secret!)
   - Click το **👁️ eye icon** για να το δεις
   - **Copy το key** (θα είναι πολύ μακρύ)

---

## 📝 Βήμα 2: Πρόσθεσε το στο `.env.local`

### Το `.env.local` πρέπει να έχει:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://katlwauxbsbrbegpsawk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdGx3YXV4YnNicmJlZ3BzYXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzI4MzMsImV4cCI6MjA3ODIwODgzM30.JbZMf_kqfOzkZ94cB0Q9D-8kTNx1yz2yZCl6ZWbCuWI

# Service Role Key (for admin operations - KEEP SECRET!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdGx3YXV4YnNicmJlZ3BzYXdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzMjgzMywiZXhwIjoyMDc4MjA4ODMzfQ.KPqanHz14uHzJAbxC9W7iO_7X5DzPqIxOaPl3c-lkJk
```

---

## 🔒 Security Notes

### ⚠️ IMPORTANT:

1. **ΜΗΝ το commit στο Git!**
   - Το `.env.local` είναι ήδη στο `.gitignore`
   - ΜΗΝ το προσθέσεις στο `.env` (που commit-εται)

2. **ΜΗΝ το μοιράσεις!**
   - Το service_role key έχει **πλήρη πρόσβαση** στο database
   - Μόνο εσύ πρέπει να το έχεις

3. **Μόνο για local development:**
   - Χρησιμοποιείται για automatic table creation
   - Δεν χρειάζεται στο production (Vercel)

---

## ✅ Verification

Μετά την προσθήκη, έλεγξε:

```bash
# Test αν το script μπορεί να το διαβάσει
npm run db:create:all
```

Αν δεις:
```
✅ Using Management API...
✅ Executed: ALL_MIGRATIONS_COMBINED.sql
```

Τότε είναι OK! 🎉

---

## 📋 Quick Steps Summary

1. ✅ Supabase Dashboard → Settings → API
2. ✅ Copy το "service_role" key
3. ✅ Άνοιξε `.env.local` στο project root
4. ✅ Πρόσθεσε: `SUPABASE_SERVICE_ROLE_KEY=your_key_here`
5. ✅ Save το file
6. ✅ Test με: `npm run db:create:all`

---

## 🎯 Direct Link

**Γρήγορη πρόσβαση:**
https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/settings/api

---

**Μόλις το προσθέσεις, πες μου να δοκιμάσουμε!** 🚀

