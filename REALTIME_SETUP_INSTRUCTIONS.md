# 🔴 REALTIME SETUP - Run This Migration

## ✅ Realtime Migration Created

**File:** `supabase/migrations/20250108000001_enable_realtime.sql`

This migration enables realtime subscriptions for all 23 Spotlight tables.

---

## 🚀 Run the Migration (2 options):

### Option 1: Via SQL Editor (Recommended)

1. **Open SQL Editor:**
   https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/sql/new

2. **Copy the migration file:**
   - Open `supabase/migrations/20250108000001_enable_realtime.sql`
   - Copy all contents (`Ctrl+A`, `Ctrl+C`)

3. **Paste and Run:**
   - Paste in SQL Editor (`Ctrl+V`)
   - Click **"Run"**
   - Wait for "Success ✓"

### Option 2: Via CLI (When tables don't conflict)

```bash
supabase db push
```

---

## ✅ What This Enables:

### All Tables Now Support Realtime:

1. ✅ **properties** - Property listings
2. ✅ **property_images** - Property photos
3. ✅ **property_documents** - Documents
4. ✅ **leads** - Customer inquiries
5. ✅ **lead_activity** - Lead timeline
6. ✅ **viewings** - Viewing appointments
7. ✅ **offers** - Offers
8. ✅ **offer_events** - Offer history
9. ✅ **documents** - Document management
10. ✅ **saved_searches** - Search alerts
11. ✅ **alerts_log** - Alert delivery tracking
12. ✅ **syndication_mappings** - Portal feeds
13. ✅ **referrals** - Referral tracking
14. ✅ **analytics_clicks** - Heatmap data
15. ✅ **experiments** - A/B testing
16. ✅ **experiment_metrics** - Experiment metrics
17. ✅ **consents** - GDPR compliance
18. ✅ **audit_logs** - Audit trail
19. ✅ **agents** - Real estate agents
20. ✅ **regions** - Property regions
21. ✅ **profiles** - User profiles
22. ✅ **tasks** - Task management
23. ✅ **task_templates** - Task templates

---

## 📡 How to Use Realtime in Your App:

### Subscribe to Changes:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Subscribe to property changes
const channel = supabase
  .channel('property-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // 'INSERT' | 'UPDATE' | 'DELETE' | '*'
      schema: 'public',
      table: 'properties'
    },
    (payload) => {
      console.log('Property changed:', payload)
      // Update your UI here
    }
  )
  .subscribe()

// Cleanup
return () => {
  supabase.removeChannel(channel)
}
```

### Subscribe to Specific Row:

```typescript
// Watch a specific property
const channel = supabase
  .channel('property-123')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'properties',
      filter: `id=eq.${propertyId}`
    },
    (payload) => {
      console.log('Property updated:', payload.new)
    }
  )
  .subscribe()
```

### Subscribe to Multiple Tables:

```typescript
const channel = supabase
  .channel('dashboard-updates')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'properties' },
    handlePropertyChange
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'leads' },
    handleLeadChange
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'viewings' },
    handleViewingChange
  )
  .subscribe()
```

---

## 🎯 Use Cases:

### 1. Live Dashboard Updates
- New leads appear instantly
- Property status changes in real-time
- Viewing confirmations update immediately

### 2. Collaborative Editing
- Multiple admins see each other's changes
- Prevent conflicting edits
- Real-time notifications

### 3. Saved Search Alerts
- New properties trigger instant notifications
- Price changes alert interested users
- Status updates (sold/rented) notify watchers

### 4. Analytics
- Live visitor tracking
- Real-time conversion metrics
- Instant A/B test results

---

## ✅ Verification:

After running the migration, verify with:

```sql
-- Check which tables are in the publication
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
ORDER BY tablename;
```

Should return all 23 tables!

---

## 🔗 Next Steps:

1. ✅ Run the realtime migration
2. ⏭️ Set up auto-sync watcher (Prompt 3)
3. ⏭️ Create idempotent seed script (Prompt 4)
4. ⏭️ Create realtime test page (Prompt 5)
5. ⏭️ Add GitHub Action for CI (Prompt 6)
6. ⏭️ Add production safety guards (Prompt 7)

---

**Run the migration now via SQL Editor!** 🚀

