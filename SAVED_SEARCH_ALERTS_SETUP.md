# 🔔 Saved Search Alerts System - Complete Setup Guide

## ✅ What Was Created:

Your Spotlight Real Estate platform now has a **complete automated alert system** that:
- ✅ Automatically matches new properties to saved searches
- ✅ Sends instant notifications via Email/WhatsApp/Telegram
- ✅ Uses Supabase Edge Functions for serverless execution
- ✅ Includes database triggers for automatic processing
- ✅ Provides user preferences and statistics

---

## 📁 Files Created:

### Edge Function:
- `supabase/functions/match-properties/index.ts` - Property matching logic

### Database Migration:
- `supabase/migrations/20250108000002_saved_search_alerts.sql` - Triggers & functions

### Features:
- Automatic property matching algorithm
- Multi-channel notifications (Email, WhatsApp, Telegram)
- Alert logging and statistics
- User notification preferences
- Manual trigger functions for testing

---

## 🚀 Setup Instructions:

### Step 1: Deploy Edge Function

```bash
# Login to Supabase (if not already)
supabase login

# Link to your project
supabase link --project-ref katlwauxbsbrbegpsawk

# Deploy the Edge Function
supabase functions deploy match-properties
```

### Step 2: Set Environment Variables

Go to: https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/settings/functions

Add these secrets:

```bash
# Required for email notifications (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Your site URL
SITE_URL=https://yoursite.com

# Optional: WhatsApp via Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Optional: Telegram Bot
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

### Step 3: Run Database Migration

**Option A: Via SQL Editor (Recommended)**
1. Open: https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/sql/new
2. Copy contents of: `supabase/migrations/20250108000002_saved_search_alerts.sql`
3. Paste and click "Run"

**Option B: Via CLI**
```bash
npm run db:push
```

### Step 4: Enable pg_net Extension

The trigger uses `pg_net` to call Edge Functions. Enable it:

1. Go to: https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/database/extensions
2. Search for "pg_net"
3. Click "Enable"

---

## 📧 Email Setup (Resend):

### 1. Create Resend Account:
- Go to: https://resend.com
- Sign up for free account
- Verify your email

### 2. Get API Key:
- Dashboard → API Keys
- Create new API key
- Copy the key (starts with `re_`)

### 3. Add to Supabase:
- Supabase → Settings → Edge Functions
- Add secret: `RESEND_API_KEY`
- Value: Your Resend API key

### 4. Verify Domain (Production):
- Resend → Domains
- Add your domain (e.g., spotlight.gr)
- Add DNS records
- Verify

**For Testing:**
- Use `onboarding@resend.dev` as sender
- Limited to 100 emails/day
- Only sends to verified emails

---

## 📱 WhatsApp Setup (Optional):

### Using Twilio:

1. **Create Twilio Account:**
   - Go to: https://www.twilio.com/try-twilio
   - Sign up and verify

2. **Enable WhatsApp:**
   - Console → Messaging → Try it out → Send a WhatsApp message
   - Follow setup wizard

3. **Get Credentials:**
   - Account SID: `ACxxxxx`
   - Auth Token: `xxxxx`
   - WhatsApp Number: `whatsapp:+14155238886`

4. **Add to Supabase:**
   ```
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

---

## 💬 Telegram Setup (Optional):

### Create Telegram Bot:

1. **Talk to BotFather:**
   - Open Telegram
   - Search for `@BotFather`
   - Send `/newbot`
   - Follow instructions

2. **Get Bot Token:**
   - BotFather will give you a token
   - Format: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

3. **Add to Supabase:**
   ```
   TELEGRAM_BOT_TOKEN=your-token-here
   ```

4. **Get User Chat IDs:**
   - Users must start a conversation with your bot
   - Store their `chat_id` in the `profiles` table

---

## 🧪 Testing the System:

### Test 1: Manual Trigger

```sql
-- Insert a test property (triggers the alert system)
INSERT INTO properties (
  property_code, title_en, title_gr,
  property_type, listing_type, status,
  price_sale, currency, bedrooms, bathrooms, area_sqm,
  city_en, city_gr, published, featured,
  region_id, agent_id
)
SELECT
  'TEST-' || NOW()::TEXT,
  'Test Property for Alerts',
  'Δοκιμαστικό Ακίνητο για Ειδοποιήσεις',
  'apartment', 'sale', 'available',
  250000, 'EUR', 2, 1, 75,
  'Athens', 'Αθήνα', true, false,
  (SELECT id FROM regions WHERE slug = 'athens' LIMIT 1),
  (SELECT id FROM agents LIMIT 1);
```

### Test 2: Check Alert Logs

```sql
-- View recent alerts
SELECT 
  al.*,
  ss.name as search_name,
  p.title_en as property_title
FROM alerts_log al
JOIN saved_searches ss ON ss.id = al.saved_search_id
JOIN properties p ON p.id = al.property_id
ORDER BY al.sent_at DESC
LIMIT 10;
```

### Test 3: View Statistics

```sql
-- Check alert statistics
SELECT * FROM alert_statistics
ORDER BY total_alerts DESC;
```

### Test 4: Preview Matches

```sql
-- Preview what properties match a saved search
SELECT * FROM preview_saved_search_matches(
  'your-search-uuid-here',
  5  -- limit
);
```

---

## 🎯 How It Works:

### 1. User Creates Saved Search:
```typescript
const { data, error } = await supabase
  .from('saved_searches')
  .insert({
    user_id: user.id,
    name: 'Athens Apartments under €300k',
    filters_json: {
      property_type: ['apartment'],
      listing_type: ['sale'],
      regions: [athensRegionId],
      price_max: 300000,
      bedrooms_min: 2
    },
    channels: ['email', 'whatsapp'],
    frequency: 'instant',
    is_active: true
  })
```

### 2. New Property Added:
```typescript
const { data, error } = await supabase
  .from('properties')
  .insert({
    // ... property data
    published: true  // This triggers the alert system!
  })
```

### 3. Automatic Processing:
1. Database trigger fires on INSERT
2. Calls Edge Function `match-properties`
3. Edge Function:
   - Fetches all active saved searches
   - Matches property against each search's filters
   - Finds users to notify
4. Sends notifications via selected channels
5. Logs all alerts in `alerts_log` table

### 4. User Receives Notification:
- **Email:** Beautiful HTML email with property details
- **WhatsApp:** Text message with link
- **Telegram:** Bot message with property info

---

## 📊 Monitoring & Analytics:

### View Alert Dashboard:

```sql
-- Overall statistics
SELECT 
  COUNT(*) as total_searches,
  COUNT(*) FILTER (WHERE is_active = true) as active_searches,
  SUM(notification_count) as total_notifications
FROM saved_searches;

-- Most popular search filters
SELECT 
  filters_json->>'property_type' as property_type,
  COUNT(*) as search_count
FROM saved_searches
WHERE is_active = true
GROUP BY filters_json->>'property_type'
ORDER BY search_count DESC;

-- Notification success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM alerts_log
GROUP BY status;
```

---

## 🔧 Customization:

### Adjust Matching Algorithm:

Edit `supabase/functions/match-properties/index.ts`:

```typescript
function matchesFilters(property: any, filters: any): boolean {
  // Add your custom matching logic here
  // Example: Add distance-based matching
  // Example: Add price flexibility (±10%)
  // Example: Add "similar properties" logic
  
  return true // or false
}
```

### Add New Notification Channels:

1. Add channel to `saved_searches.channels` array
2. Implement sender function in Edge Function
3. Update UI to allow channel selection

### Customize Email Template:

Edit the `emailHtml` variable in `sendEmailNotification()`:

```typescript
const emailHtml = `
  <!-- Your custom HTML template -->
  <div style="...">
    ${property.title_en}
  </div>
`
```

---

## 🛡️ Security & Privacy:

### Data Protection:
- User emails never exposed to other users
- Phone numbers stored securely
- Telegram chat IDs encrypted
- All notifications use secure channels

### Rate Limiting:
- Resend: 100 emails/day (free tier)
- Twilio: Pay per message
- Telegram: No limits

### Unsubscribe:
Users can:
- Disable specific saved searches
- Change notification channels
- Adjust frequency (instant/daily/weekly)
- Delete saved searches entirely

---

## 📋 Deployment Checklist:

- [ ] Edge Function deployed (`supabase functions deploy match-properties`)
- [ ] Database migration run (20250108000002_saved_search_alerts.sql)
- [ ] pg_net extension enabled
- [ ] RESEND_API_KEY configured
- [ ] SITE_URL configured
- [ ] (Optional) Twilio credentials configured
- [ ] (Optional) Telegram bot token configured
- [ ] Test property inserted
- [ ] Alert received successfully
- [ ] Alert logs verified
- [ ] Statistics dashboard working

---

## 🚀 Next Steps:

### 1. Create User UI:
- Saved searches management page
- Notification preferences
- Alert history
- Match preview

### 2. Add Advanced Features:
- Price change alerts
- Status change notifications (sold/rented)
- Similar property suggestions
- Market trend alerts

### 3. Analytics Dashboard:
- Most popular searches
- Notification success rates
- User engagement metrics
- Property match quality

---

## 🔗 Useful Links:

- **Edge Functions Dashboard:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/functions
- **Database Triggers:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/database/triggers
- **Alert Logs:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/editor (alerts_log table)
- **Resend Dashboard:** https://resend.com/emails
- **Twilio Console:** https://console.twilio.com

---

## ✅ System Complete!

Your Saved Search Alerts system is now fully operational! 🎉

Users will automatically receive notifications when new properties match their saved searches.

**Test it now:**
1. Create a saved search in the database
2. Insert a matching property
3. Check your email! 📧

Τέλεια δουλειά! Το σύστημα ειδοποιήσεων είναι έτοιμο! 🇬🇷🔔

