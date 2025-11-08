# 🏗️ Backend Architecture - Complete Overview

This document explains the complete backend architecture for Spotlight Real Estate.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Public     │  │    Admin     │  │   API Routes    │  │
│  │   Pages      │  │    Pages     │  │                 │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │             │
│         └─────────────────┴────────────────────┘             │
│                           │                                  │
│                           ▼                                  │
│              ┌────────────────────────┐                      │
│              │  Supabase Client       │                      │
│              │  (Browser & Server)    │                      │
│              └────────────┬───────────┘                      │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ HTTPS + JWT Auth
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Cloud Backend                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │     Auth     │  │    Storage      │  │
│  │   Database   │  │   Service    │  │    Service      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │             │
│         │  ┌──────────────┴────────────┐       │             │
│         │  │   Row Level Security      │       │             │
│         │  │   (RLS Policies)          │       │             │
│         │  └───────────────────────────┘       │             │
│         │                                      │             │
│  ┌──────┴──────────┐  ┌──────────────┐  ┌────┴─────────┐  │
│  │   Realtime      │  │   GraphQL    │  │   REST API   │  │
│  │   Subscriptions │  │   Endpoint   │  │   Endpoint   │  │
│  └─────────────────┘  └──────────────┘  └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Core Tables

#### 1. **profiles** (User Management)
```sql
- id (uuid, PK, FK to auth.users)
- email (text)
- full_name (text)
- role (admin | agent | manager)
- avatar_url (text)
- created_at, updated_at
```

**Purpose:** Store user profiles and roles  
**RLS:** Users can only view/edit their own profile

---

#### 2. **regions** (Geographic Areas)
```sql
- id (uuid, PK)
- name_en, name_gr (text)
- slug (text, unique)
- description_en, description_gr (text)
- image_url (text)
- featured (boolean)
- display_order (int)
```

**Purpose:** Property regions (Athens, Mykonos, etc.)  
**RLS:** Public read, admin write

---

#### 3. **agents** (Real Estate Agents)
```sql
- id (uuid, PK)
- name_en, name_gr (text)
- email, phone (text)
- bio_en, bio_gr (text)
- avatar_url (text)
- languages (text[])
- specialties (text[])
- featured (boolean)
```

**Purpose:** Agent profiles and contact info  
**RLS:** Public read, admin write

---

#### 4. **properties** (Property Listings)
```sql
- id (uuid, PK)
- property_code (text, unique, auto-generated)
- title_en, title_gr (text)
- description_en, description_gr (text)
- property_type (apartment | house | villa | land | commercial | office)
- listing_type (sale | rent | both)
- status (available | pending | sold | rented | off-market)
- region_id (FK to regions)
- address_en, address_gr (text)
- city_en, city_gr (text)
- postal_code (text)
- latitude, longitude (decimal)
- price_sale, price_rent (decimal)
- currency (text, default EUR)
- bedrooms, bathrooms (int)
- area_sqm, plot_size_sqm (decimal)
- floor_number, total_floors (int)
- year_built (int)
- energy_rating (text)
- features, amenities (text[])
- main_image_url, tour_3d_url, video_url (text)
- meta_title_en, meta_description_en (text) - SEO
- agent_id (FK to agents)
- featured (boolean)
- views_count, leads_count (int)
- published (boolean)
- created_at, updated_at, created_by
```

**Purpose:** Core property listings with all details  
**RLS:** Public can view published, admin can manage all  
**Features:**
- Auto-generates property codes (SP25-0001)
- Supports bilingual content
- SEO metadata
- Location coordinates for maps

---

#### 5. **property_images** (Property Photos)
```sql
- id (uuid, PK)
- property_id (FK to properties, cascade delete)
- image_url (text)
- caption_en, caption_gr (text)
- display_order (int)
- is_main (boolean)
```

**Purpose:** Property photo galleries  
**RLS:** Public can view published property images

---

#### 6. **property_documents** (Documents)
```sql
- id (uuid, PK)
- property_id (FK to properties)
- document_type (floor_plan | energy_certificate | title_deed | etc)
- file_url (text)
- file_name (text)
- file_size (bigint)
```

**Purpose:** Property documents and certificates  
**RLS:** Admin only

---

#### 7. **leads** (Customer Inquiries)
```sql
- id (uuid, PK)
- full_name, email, phone (text)
- message (text)
- lead_type (property_inquiry | viewing_request | general_inquiry | contact_form)
- lead_source (website | phone | email | referral | walk-in)
- property_id (FK to properties)
- agent_id (FK to agents)
- status (new | contacted | qualified | viewing_scheduled | negotiating | closed_won | closed_lost)
- priority (low | medium | high)
- preferred_contact_method (text)
- preferred_language (text)
- budget_min, budget_max (decimal)
- preferred_regions (text[])
- notes (text)
- last_contacted_at (timestamptz)
- assigned_to (FK to auth.users)
```

**Purpose:** Lead capture and management  
**RLS:** Public can create, admin can view/manage

---

#### 8. **viewings** (Property Viewings)
```sql
- id (uuid, PK)
- property_id (FK to properties)
- lead_id (FK to leads)
- agent_id (FK to agents)
- scheduled_date (timestamptz)
- duration_minutes (int, default 60)
- status (scheduled | confirmed | completed | cancelled | no_show)
- client_name, client_email, client_phone (text)
- notes, feedback (text)
```

**Purpose:** Schedule and track property viewings  
**RLS:** Admin only

---

#### 9. **saved_searches** (User Searches)
```sql
- id (uuid, PK)
- user_id (FK to auth.users)
- name (text)
- search_criteria (jsonb)
- notification_enabled (boolean)
- notification_frequency (daily | weekly | instant)
```

**Purpose:** Save user search preferences  
**RLS:** Users can only view their own searches

---

#### 10. **syndication_mappings** (Property Feeds)
```sql
- id (uuid, PK)
- portal (text) - e.g., "spitogatos", "xe"
- feed_url (text)
- is_active (boolean)
- last_generated_at (timestamptz)
- field_mappings (jsonb)
```

**Purpose:** Syndicate properties to external portals  
**RLS:** Admin only  
**API:** `/feeds/[portal]` generates XML feeds

---

#### 11. **analytics** (Page Tracking)
```sql
- id (uuid, PK)
- entity_type (property | agent | region)
- entity_id (uuid)
- event_type (view | inquiry | favorite | share)
- user_id (FK to auth.users, nullable)
- session_id (text)
- ip_address (inet)
- user_agent (text)
- referrer (text)
```

**Purpose:** Track page views and user interactions  
**RLS:** Public can create, admin can view

---

#### 12. **referrals** (Referral System)
```sql
- id (uuid, PK)
- referrer_id (FK to auth.users)
- referred_email (text)
- status (pending | signed_up | converted)
- reward_amount (decimal)
- reward_status (pending | paid)
```

**Purpose:** Track referrals and rewards  
**RLS:** Users can view their own referrals

---

#### 13. **lead_scoring** (Lead Scoring)
```sql
- id (uuid, PK)
- lead_id (FK to leads)
- score (int)
- factors (jsonb)
- calculated_at (timestamptz)
```

**Purpose:** Automated lead quality scoring  
**RLS:** Admin only

---

#### 14. **tasks** (Task Management)
```sql
- id (uuid, PK)
- title, description (text)
- task_type (follow_up | viewing | document | call)
- related_entity_type (lead | property | viewing)
- related_entity_id (uuid)
- assigned_to (FK to auth.users)
- due_date (timestamptz)
- status (pending | in_progress | completed | cancelled)
- priority (low | medium | high)
```

**Purpose:** Task management for agents  
**RLS:** Users can view assigned tasks

---

#### 15. **offers** (Property Offers)
```sql
- id (uuid, PK)
- property_id (FK to properties)
- lead_id (FK to leads)
- offer_amount (decimal)
- currency (text)
- status (pending | accepted | rejected | countered)
- conditions (text)
- valid_until (timestamptz)
```

**Purpose:** Track property offers and negotiations  
**RLS:** Admin only

---

#### 16. **gdpr_consents** (GDPR Compliance)
```sql
- id (uuid, PK)
- user_email (text)
- consent_type (marketing | analytics | third_party)
- consented (boolean)
- ip_address (inet)
- user_agent (text)
```

**Purpose:** Track GDPR consent for compliance  
**RLS:** Admin can view, public can create

---

#### 17. **audit_logs** (Audit Trail)
```sql
- id (uuid, PK)
- table_name (text)
- record_id (uuid)
- action (INSERT | UPDATE | DELETE)
- old_data, new_data (jsonb)
- user_id (FK to auth.users)
- ip_address (inet)
```

**Purpose:** Complete audit trail of all changes  
**RLS:** Admin only  
**Trigger:** Automatically logs all table changes

---

## 🔐 Row Level Security (RLS)

### Public Access
- ✅ View published properties
- ✅ View regions and agents
- ✅ Submit inquiry forms (create leads)
- ✅ Track analytics events

### Authenticated Users
- ✅ All public access
- ✅ Manage properties
- ✅ View and manage leads
- ✅ Schedule viewings
- ✅ Access admin dashboard
- ✅ View audit logs

### Security Features
- ✅ JWT-based authentication
- ✅ Encrypted passwords (bcrypt)
- ✅ Session management via cookies
- ✅ HTTPS only in production
- ✅ Rate limiting (Supabase default)
- ✅ SQL injection protection (parameterized queries)

---

## 🔄 Database Functions & Triggers

### Auto-Generate Property Codes
```sql
Function: generate_property_code()
Trigger: ON INSERT to properties
Format: SP{YY}-{0001}
Example: SP25-0001, SP25-0002
```

### Auto-Create User Profiles
```sql
Function: handle_new_user()
Trigger: ON INSERT to auth.users
Creates: Profile record with user email
```

### Audit Logging
```sql
Function: audit_trigger()
Trigger: ON INSERT/UPDATE/DELETE to all tables
Logs: Old and new data to audit_logs table
```

---

## 🌐 API Endpoints

### REST API (Auto-Generated)

Base URL: `https://your-project.supabase.co/rest/v1/`

**Properties:**
```
GET    /properties                    - List all published properties
GET    /properties?id=eq.{id}        - Get single property
POST   /properties                    - Create property (auth required)
PATCH  /properties?id=eq.{id}        - Update property (auth required)
DELETE /properties?id=eq.{id}        - Delete property (auth required)
```

**Leads:**
```
GET    /leads                         - List leads (auth required)
POST   /leads                         - Create lead (public)
PATCH  /leads?id=eq.{id}             - Update lead (auth required)
```

**Viewings:**
```
GET    /viewings                      - List viewings (auth required)
POST   /viewings                      - Create viewing (auth required)
PATCH  /viewings?id=eq.{id}          - Update viewing (auth required)
```

**Filtering & Sorting:**
```
GET /properties?property_type=eq.villa
GET /properties?price_sale=gte.500000&price_sale=lte.1000000
GET /properties?order=created_at.desc
GET /properties?limit=10&offset=20
```

### GraphQL API

Endpoint: `https://your-project.supabase.co/graphql/v1`

**Example Query:**
```graphql
query GetProperties {
  propertiesCollection(
    filter: { published: { eq: true } }
    orderBy: { created_at: DescNullsLast }
  ) {
    edges {
      node {
        id
        title_en
        price_sale
        city_en
        region {
          name_en
        }
        agent {
          name_en
          email
        }
      }
    }
  }
}
```

### Custom API Routes

**XML Feed Generation:**
```
GET /feeds/[portal]
Example: /feeds/spitogatos
Returns: XML feed of published properties
```

---

## 🔌 Connection Points

### Client-Side (`lib/supabase/client.ts`)

**Used in:**
- Login/logout
- Form submissions
- Client-side data fetching
- Real-time subscriptions

**Example:**
```typescript
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
const { data, error } = await supabase
  .from("leads")
  .insert({ full_name, email, property_id })
```

---

### Server-Side (`lib/supabase/server.ts`)

**Used in:**
- Server Components (SSR)
- API Routes
- Server-side authentication

**Example:**
```typescript
import { createClient } from "@/lib/supabase/server"

const supabase = await createClient()
const { data } = await supabase
  .from("properties")
  .select("*, region:regions(*), agent:agents(*)")
  .eq("published", true)
```

---

### Middleware (`lib/supabase/middleware.ts`)

**Purpose:**
- Refresh auth sessions
- Protect admin routes
- Handle cookies

**Protected Routes:**
- `/admin/*` - Requires authentication
- Redirects to `/admin/login` if not authenticated

---

## 📈 Data Flow Examples

### Example 1: User Submits Inquiry

```
1. User fills form on property page
   ↓
2. Form submits to Supabase (client-side)
   ↓
3. Lead created in 'leads' table
   ↓
4. RLS policy allows public insert
   ↓
5. Trigger calculates lead score
   ↓
6. Admin sees new lead in dashboard (real-time)
```

### Example 2: Admin Creates Property

```
1. Admin fills property form
   ↓
2. Form submits to Supabase (client-side)
   ↓
3. Property created in 'properties' table
   ↓
4. Trigger auto-generates property code (SP25-0001)
   ↓
5. Audit log records creation
   ↓
6. Property appears on public site (if published)
```

### Example 3: Public Views Property

```
1. User visits /properties/[id]
   ↓
2. Server Component fetches data (SSR)
   ↓
3. Supabase returns property with relations
   ↓
4. Analytics event logged
   ↓
5. views_count incremented
   ↓
6. Page rendered with SEO metadata
```

---

## 🔒 Security Implementation

### Authentication Flow

```
1. User enters email/password
   ↓
2. Supabase Auth validates credentials
   ↓
3. JWT token generated and stored in cookie
   ↓
4. Middleware validates token on each request
   ↓
5. RLS policies enforce data access
```

### RLS Policy Examples

**Properties - Public Read:**
```sql
CREATE POLICY "properties_select_published"
  ON properties FOR SELECT
  USING (published = true OR auth.uid() IS NOT NULL);
```

**Leads - Public Create:**
```sql
CREATE POLICY "leads_insert_all"
  ON leads FOR INSERT
  WITH CHECK (true);
```

**Admin Only:**
```sql
CREATE POLICY "audit_logs_select_auth"
  ON audit_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

---

## 🚀 Performance Optimizations

### Database Indexes

```sql
-- Properties
CREATE INDEX idx_properties_region ON properties(region_id);
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_featured ON properties(featured);
CREATE INDEX idx_properties_code ON properties(property_code);

-- Leads
CREATE INDEX idx_leads_property ON leads(property_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);

-- Viewings
CREATE INDEX idx_viewings_date ON viewings(scheduled_date);
CREATE INDEX idx_viewings_property ON viewings(property_id);
```

### Caching Strategy

- **Static pages:** ISR with 1-hour revalidation
- **Property listings:** SSR with Supabase cache
- **Admin dashboard:** Real-time updates
- **API responses:** HTTP caching headers

---

## 📊 Monitoring & Analytics

### Built-in Monitoring

- **Database Logs:** Supabase Dashboard → Logs
- **API Usage:** Dashboard → Usage
- **Auth Activity:** Dashboard → Auth → Logs
- **Performance:** Dashboard → Reports

### Custom Analytics

- Page views tracked in `analytics` table
- Lead conversion tracking
- Property performance metrics
- Agent activity tracking

---

## 🔄 Realtime Features

### Available Subscriptions

```typescript
// Subscribe to new leads
supabase
  .channel('leads')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'leads' },
    (payload) => console.log('New lead!', payload)
  )
  .subscribe()

// Subscribe to property updates
supabase
  .channel('properties')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'properties' },
    (payload) => console.log('Property updated!', payload)
  )
  .subscribe()
```

---

## 📚 API Documentation

### Supabase Auto-Generated Docs

Your API documentation is automatically available at:

```
https://your-project.supabase.co/rest/v1/
```

Add `?apikey=your-anon-key` to view interactive docs.

---

## 🎯 Backend Capabilities

| Feature | Status | Description |
|---------|--------|-------------|
| **CRUD Operations** | ✅ Ready | Full Create, Read, Update, Delete |
| **Authentication** | ✅ Ready | Email/password, JWT sessions |
| **File Storage** | ⏳ Setup | Supabase Storage for images |
| **Real-time** | ✅ Ready | Live updates via websockets |
| **Search** | ✅ Ready | Full-text search on properties |
| **Filtering** | ✅ Ready | Advanced query filtering |
| **Pagination** | ✅ Ready | Limit/offset pagination |
| **Relationships** | ✅ Ready | Foreign keys with joins |
| **Validation** | ✅ Ready | Database constraints |
| **Audit Trail** | ✅ Ready | All changes logged |
| **GDPR** | ✅ Ready | Consent tracking |
| **Backups** | ✅ Auto | Daily automatic backups |

---

## 🔮 Future Enhancements

### Phase 2 (Optional)
- [ ] Supabase Storage for property images
- [ ] Email notifications (SendGrid/Resend)
- [ ] SMS notifications (Twilio)
- [ ] PDF generation for property brochures
- [ ] Advanced search with Elasticsearch
- [ ] Multi-language support (i18n)
- [ ] Property comparison feature
- [ ] Mortgage calculator
- [ ] Virtual tour integration

### Phase 3 (Advanced)
- [ ] AI-powered property recommendations
- [ ] Automated property valuation
- [ ] Market trend analysis
- [ ] CRM integration
- [ ] Mobile app (React Native)
- [ ] WhatsApp integration
- [ ] Video calls for virtual viewings

---

## 📖 Documentation Links

- **Supabase Docs:** https://supabase.com/docs
- **REST API Reference:** https://supabase.com/docs/guides/api
- **GraphQL Reference:** https://supabase.com/docs/guides/graphql
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Realtime:** https://supabase.com/docs/guides/realtime

---

**Your backend is enterprise-grade and production-ready!** 🎉

