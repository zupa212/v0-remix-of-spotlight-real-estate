# 🔍 SUPABASE SERVER ANALYSIS

## 📊 Project Information

- **Project Reference**: `katlwauxbsbrbegpsawk`
- **Project URL**: `https://katlwauxbsbrbegpsawk.supabase.co`
- **MCP Status**: ✅ Configured
- **Database**: PostgreSQL (Supabase)

---

## 🗄️ DATABASE SCHEMA ANALYSIS

### 📋 Complete Table Inventory

Based on migration files, your database contains **17 main tables**:

#### 1. **profiles** (User Management)
- **Purpose**: Admin/Agent/Manager user profiles
- **Columns**: `id`, `email`, `full_name`, `role`, `avatar_url`, `created_at`, `updated_at`
- **RLS**: ✅ Enabled
- **Policies**: Users can view/edit own profile
- **Relations**: Links to `auth.users`

#### 2. **regions** (Geographic Areas)
- **Purpose**: Property regions (Athens, Mykonos, etc.)
- **Columns**: `id`, `name_en`, `name_gr`, `slug`, `description_en/gr`, `image_url`, `featured`, `display_order`
- **RLS**: ✅ Enabled
- **Policies**: Public read, authenticated write
- **Relations**: Referenced by `properties`

#### 3. **agents** (Real Estate Agents)
- **Purpose**: Agent profiles and contact info
- **Columns**: `id`, `name_en/gr`, `email`, `phone`, `bio_en/gr`, `avatar_url`, `languages[]`, `specialties[]`, `featured`
- **RLS**: ✅ Enabled
- **Policies**: Public read, authenticated write
- **Relations**: Referenced by `properties`, `leads`, `viewings`

#### 4. **properties** (Property Listings) ⭐ CORE TABLE
- **Purpose**: Main property listings
- **Columns**: 
  - Basic: `id`, `property_code`, `title_en/gr`, `description_en/gr`
  - Type: `property_type`, `listing_type`, `status`
  - Location: `region_id`, `address_en/gr`, `city_en/gr`, `postal_code`, `latitude`, `longitude`
  - Pricing: `price_sale`, `price_rent`, `currency`
  - Details: `bedrooms`, `bathrooms`, `area_sqm`, `plot_size_sqm`, `floor_number`, `total_floors`, `year_built`, `energy_rating`
  - Features: `features[]`, `amenities[]`
  - Media: `main_image_url`, `tour_3d_url`, `video_url`
  - SEO: `meta_title_en/gr`, `meta_description_en/gr`
  - Management: `agent_id`, `featured`, `views_count`, `leads_count`, `display_order`, `published`
- **RLS**: ✅ Enabled
- **Policies**: Public can view published, authenticated can manage
- **Relations**: 
  - → `property_images` (1:many)
  - → `property_documents` (1:many)
  - → `leads` (1:many)
  - → `viewings` (1:many)
  - → `offers` (1:many)
  - → `saved_searches` (via search criteria)

#### 5. **property_images** (Property Photos)
- **Purpose**: Multiple images per property
- **Columns**: `id`, `property_id`, `image_url`, `caption_en/gr`, `display_order`, `is_main`
- **RLS**: ✅ Enabled
- **Policies**: Public can view published property images
- **Relations**: → `properties` (many:1)

#### 6. **property_documents** (Property Documents)
- **Purpose**: PDFs, brochures, certificates
- **Columns**: `id`, `property_id`, `document_url`, `document_type`, `title_en/gr`, `file_size_kb`
- **RLS**: ✅ Enabled
- **Policies**: Public can view published property documents
- **Relations**: → `properties` (many:1)

#### 7. **leads** (Customer Inquiries) ⭐ CRM TABLE
- **Purpose**: Lead management and pipeline
- **Columns**:
  - Contact: `full_name`, `email`, `phone`
  - Details: `message`, `lead_type`, `lead_source`
  - Relations: `property_id`, `agent_id`
  - Pipeline: `status`, `priority`
  - Preferences: `preferred_contact_method`, `preferred_language`, `budget_min/max`, `preferred_regions[]`
  - Tracking: `notes`, `last_contacted_at`, `assigned_to`
- **RLS**: ✅ Enabled
- **Policies**: Authenticated users can view/manage
- **Relations**: 
  - → `properties` (many:1)
  - → `agents` (many:1)
  - → `lead_activity` (1:many)
  - → `viewings` (1:many)
  - → `offers` (1:many)

#### 8. **lead_activity** (Lead Activity Log)
- **Purpose**: Track all lead interactions
- **Columns**: `id`, `lead_id`, `activity_type`, `description`, `created_by`, `created_at`
- **RLS**: ✅ Enabled
- **Policies**: Admins can manage
- **Relations**: → `leads` (many:1)

#### 9. **viewings** (Property Viewings)
- **Purpose**: Schedule and track property viewings
- **Columns**: 
  - Relations: `property_id`, `lead_id`, `agent_id`
  - Details: `scheduled_date`, `duration_minutes`, `status`
  - Contact: `client_name`, `client_email`, `client_phone`
  - Notes: `notes`, `feedback`
  - Virtual: `virtual_link`, `ics_url`, `start_time`, `end_time`
- **RLS**: ✅ Enabled
- **Policies**: Authenticated users can manage
- **Relations**: 
  - → `properties` (many:1)
  - → `leads` (many:1)
  - → `agents` (many:1)

#### 10. **saved_searches** (Saved Property Searches)
- **Purpose**: User saved searches with alerts
- **Columns**: `id`, `user_id`, `name`, `criteria` (JSONB), `email_alerts`, `frequency`, `last_matched_at`
- **RLS**: ✅ Enabled
- **Policies**: Users can view/edit own searches
- **Relations**: → `auth.users` (many:1)

#### 11. **alerts_log** (Search Alert Logs)
- **Purpose**: Track sent alerts
- **Columns**: `id`, `saved_search_id`, `property_id`, `sent_at`, `channel`
- **RLS**: ✅ Enabled
- **Policies**: Admins can view
- **Relations**: 
  - → `saved_searches` (many:1)
  - → `properties` (many:1)

#### 12. **syndication_mappings** (Property Syndication)
- **Purpose**: Map properties to external portals
- **Columns**: `id`, `property_id`, `portal`, `external_id`, `is_active`, `last_synced_at`, `last_generated_at`
- **RLS**: ✅ Enabled
- **Policies**: Admins can manage
- **Relations**: → `properties` (many:1)

#### 13. **offers** (Property Offers)
- **Purpose**: Track property offers
- **Columns**: `id`, `property_id`, `lead_id`, `offer_amount`, `currency`, `status`, `terms`, `expires_at`, `created_by`
- **RLS**: ✅ Enabled
- **Policies**: Admins can manage
- **Relations**: 
  - → `properties` (many:1)
  - → `leads` (many:1)
  - → `offer_events` (1:many)

#### 14. **offer_events** (Offer History)
- **Purpose**: Track offer status changes
- **Columns**: `id`, `offer_id`, `event_type`, `description`, `created_at`
- **RLS**: ✅ Enabled
- **Policies**: Admins can view
- **Relations**: → `offers` (many:1)

#### 15. **documents** (General Documents)
- **Purpose**: Store documents (contracts, etc.)
- **Columns**: `id`, `lead_id`, `property_id`, `document_type`, `file_url`, `title`, `created_at`
- **RLS**: ✅ Enabled
- **Policies**: Admins can manage
- **Relations**: 
  - → `leads` (many:1)
  - → `properties` (many:1)

#### 16. **tasks** (Task Management)
- **Purpose**: CRM task tracking
- **Columns**: `id`, `title`, `description`, `lead_id`, `assignee_id`, `due_date`, `status`, `priority`, `created_at`
- **RLS**: ✅ Enabled
- **Policies**: Admins can manage
- **Relations**: 
  - → `leads` (many:1)
  - → `task_templates` (many:1)

#### 17. **task_templates** (Task Templates)
- **Purpose**: Reusable task templates
- **Columns**: `id`, `name`, `description`, `default_assignee`, `default_due_days`
- **RLS**: ✅ Enabled
- **Policies**: Admins can manage

#### 18. **referrals** (Referral System)
- **Purpose**: Track referrals and commissions
- **Columns**: `id`, `referrer_id`, `referred_lead_id`, `referral_code`, `status`, `commission_amount`, `created_at`
- **RLS**: ✅ Enabled
- **Policies**: Admins can manage, agents can view own
- **Relations**: 
  - → `agents` (many:1)
  - → `leads` (many:1)

#### 19. **analytics_clicks** (Analytics)
- **Purpose**: Track property clicks/views
- **Columns**: `id`, `property_id`, `click_type`, `source`, `user_agent`, `ip_address`, `created_at`
- **RLS**: ✅ Enabled
- **Policies**: Public can insert, admins can view
- **Relations**: → `properties` (many:1)

#### 20. **experiments** (A/B Testing)
- **Purpose**: A/B test management
- **Columns**: `id`, `name`, `description`, `status`, `variants` (JSONB), `start_date`, `end_date`
- **RLS**: ✅ Enabled
- **Policies**: Admins can manage
- **Relations**: → `experiment_metrics` (1:many)

#### 21. **experiment_metrics** (A/B Test Metrics)
- **Purpose**: Track experiment results
- **Columns**: `id`, `experiment_id`, `variant`, `metric_name`, `metric_value`, `created_at`
- **RLS**: ✅ Enabled
- **Policies**: Public can insert, admins can view
- **Relations**: → `experiments` (many:1)

#### 22. **consents** (GDPR Compliance)
- **Purpose**: Track user consents
- **Columns**: `id`, `user_id`, `consent_type`, `granted`, `ip_address`, `user_agent`, `created_at`
- **RLS**: ✅ Enabled
- **Policies**: System can insert, admins can view
- **Relations**: → `auth.users` (many:1)

#### 23. **audit_logs** (Audit Trail)
- **Purpose**: Track all database changes
- **Columns**: `id`, `table_name`, `record_id`, `action`, `old_data` (JSONB), `new_data` (JSONB), `user_id`, `created_at`
- **RLS**: ✅ Enabled
- **Policies**: System can insert, admins can view
- **Trigger**: Auto-created by migration 016

---

## 🔒 SECURITY ANALYSIS

### Row Level Security (RLS) Status

✅ **ALL TABLES HAVE RLS ENABLED**

#### RLS Policy Summary:

1. **Public Read Tables** (Anyone can view):
   - `regions` - Public property regions
   - `agents` - Public agent profiles
   - `properties` - Published properties only
   - `property_images` - Images of published properties
   - `property_documents` - Documents of published properties

2. **Authenticated Only** (Requires login):
   - `profiles` - Own profile only
   - `leads` - Authenticated users can view/manage
   - Public can INSERT (contact forms)
   - `viewings` - Authenticated users can manage
   - `saved_searches` - Own searches only

3. **Admin Only** (Admin role required):
   - `lead_activity` - Admin management
   - `offers` - Admin management
   - `offer_events` - Admin view
   - `documents` - Admin management
   - `tasks` - Admin management
   - `task_templates` - Admin management
   - `referrals` - Admin management
   - `syndication_mappings` - Admin management
   - `alerts_log` - Admin view
   - `analytics_clicks` - Admin view
   - `experiments` - Admin management
   - `experiment_metrics` - Admin view
   - `consents` - Admin view
   - `audit_logs` - Admin view

4. **System/Public Insert**:
   - `analytics_clicks` - Public can insert
   - `experiment_metrics` - Public can insert
   - `consents` - System can insert
   - `audit_logs` - System can insert

---

## 🔗 RELATIONSHIPS & FOREIGN KEYS

### Core Relationships:

```
auth.users
  └── profiles (1:1)
      └── tasks (assignee_id)

regions (1)
  └── properties (many)

agents (1)
  ├── properties (many)
  ├── leads (many)
  ├── viewings (many)
  └── referrals (many)

properties (1) ⭐ CENTRAL TABLE
  ├── property_images (many)
  ├── property_documents (many)
  ├── leads (many)
  ├── viewings (many)
  ├── offers (many)
  ├── syndication_mappings (many)
  └── analytics_clicks (many)

leads (1) ⭐ CRM CENTRAL
  ├── lead_activity (many)
  ├── viewings (many)
  ├── offers (many)
  ├── documents (many)
  ├── tasks (many)
  └── referrals (many)

saved_searches (1)
  ├── alerts_log (many)
  └── properties (via criteria matching)
```

---

## 📊 DATA FLOW ANALYSIS

### Property Listing Flow:
1. **Property Creation** → `properties` table
2. **Add Images** → `property_images` table
3. **Add Documents** → `property_documents` table
4. **Publish** → `published = true`
5. **Public Views** → `analytics_clicks` tracking
6. **Lead Inquiry** → `leads` table
7. **Schedule Viewing** → `viewings` table
8. **Make Offer** → `offers` table
9. **Close Deal** → `status = 'sold'` or `'rented'`

### Lead Management Flow:
1. **Contact Form** → `leads` (public insert)
2. **Assign Agent** → `leads.agent_id`
3. **Track Activity** → `lead_activity`
4. **Create Tasks** → `tasks`
5. **Schedule Viewing** → `viewings`
6. **Receive Offer** → `offers`
7. **Close** → `status = 'closed_won'` or `'closed_lost'`

### Saved Search Alert Flow:
1. **User Saves Search** → `saved_searches`
2. **New Property Matches** → Trigger fires
3. **Edge Function Called** → `match-properties` function
4. **Alert Sent** → Email/SMS/WhatsApp
5. **Log Created** → `alerts_log`

---

## 🚀 PERFORMANCE ANALYSIS

### Indexes (Based on Schema):

✅ **Primary Keys**: All tables have UUID primary keys
✅ **Foreign Keys**: All relationships indexed
✅ **Search Indexes**:
- `properties.property_code` (unique)
- `properties.region_id`
- `properties.agent_id`
- `properties.status`
- `properties.published`
- `leads.status`
- `leads.agent_id`
- `viewings.scheduled_date`

### Potential Optimizations:

1. **Full-Text Search**: Consider adding GIN indexes for:
   - `properties.title_en/gr`
   - `properties.description_en/gr`
   - `leads.full_name`, `leads.email`

2. **Geographic Queries**: 
   - Add PostGIS extension for location-based searches
   - Index `latitude`, `longitude` for proximity searches

3. **JSONB Queries**:
   - Index `saved_searches.criteria` (JSONB)
   - Index `experiments.variants` (JSONB)

---

## 🔔 REALTIME STATUS

Based on migration `20250108000001_enable_realtime.sql`:

✅ **Realtime Enabled On**:
- `profiles`
- `regions`
- `agents`
- `properties` ⭐
- `property_images`
- `property_documents`
- `leads` ⭐
- `lead_activity`
- `viewings` ⭐
- `offers` ⭐
- `offer_events`
- `saved_searches` ⭐
- `alerts_log`
- `syndication_mappings`
- `referrals`
- `analytics_clicks`
- `experiments`
- `experiment_metrics`
- `consents`
- `audit_logs`

✅ **REPLICA IDENTITY FULL** (for complete change tracking):
- `properties`
- `leads`
- `viewings`
- `offers`
- `saved_searches`

---

## 📈 STORAGE ANALYSIS

### Estimated Storage (Per Record):

- **properties**: ~2-5 KB (with JSON arrays)
- **property_images**: ~200 bytes
- **leads**: ~1-2 KB
- **viewings**: ~500 bytes
- **audit_logs**: ~1-3 KB (JSONB)

### Growth Projections:

- **1,000 properties**: ~5 MB
- **10,000 leads**: ~20 MB
- **50,000 analytics clicks**: ~10 MB
- **100,000 audit logs**: ~300 MB

**Total Estimated**: ~335 MB for 1K properties, 10K leads

---

## ⚠️ POTENTIAL ISSUES & RECOMMENDATIONS

### 1. **Missing Indexes**:
- ❌ No full-text search indexes
- ❌ No geographic indexes (PostGIS)
- ✅ Foreign keys are indexed

### 2. **Data Integrity**:
- ✅ All foreign keys have proper constraints
- ✅ Check constraints on enums
- ✅ Unique constraints on `property_code`

### 3. **Security**:
- ✅ All tables have RLS enabled
- ✅ Policies are properly scoped
- ⚠️ Consider adding rate limiting on public inserts

### 4. **Performance**:
- ✅ UUID primary keys (good for distributed systems)
- ⚠️ Consider adding materialized views for dashboards
- ⚠️ Consider partitioning `audit_logs` by date

### 5. **Backup & Recovery**:
- ✅ Supabase handles automatic backups
- ⚠️ Consider point-in-time recovery for production

---

## 🎯 RECOMMENDATIONS

### Immediate Actions:

1. ✅ **RLS Policies**: All enabled (GOOD!)
2. ⚠️ **Add Full-Text Search**: For property search
3. ⚠️ **Add PostGIS**: For location-based queries
4. ⚠️ **Monitor Query Performance**: Use Supabase dashboard
5. ⚠️ **Set Up Alerts**: For slow queries, errors

### Future Enhancements:

1. **Materialized Views**: For dashboard aggregations
2. **Partitioning**: For `audit_logs` and `analytics_clicks`
3. **Caching Strategy**: For frequently accessed properties
4. **CDN Integration**: For property images
5. **Search Optimization**: Elasticsearch or Algolia integration

---

## 📊 SUMMARY

### ✅ Strengths:
- Complete schema with all necessary tables
- Proper RLS implementation
- Good foreign key relationships
- Realtime enabled on key tables
- Audit logging in place
- GDPR compliance tables

### ⚠️ Areas for Improvement:
- Full-text search indexes
- Geographic search capabilities
- Query performance monitoring
- Materialized views for dashboards

### 🎯 Overall Status: **PRODUCTION READY** ✅

The database schema is well-designed and ready for production use. Focus on:
1. Adding search indexes
2. Monitoring performance
3. Setting up alerts
4. Regular backups verification

---

**Last Updated**: Based on migration files analysis
**Project**: Spotlight Real Estate
**Database**: Supabase PostgreSQL

