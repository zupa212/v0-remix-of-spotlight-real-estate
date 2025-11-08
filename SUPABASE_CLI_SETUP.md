# 🔧 Supabase CLI Setup Guide

This guide shows you how to set up Supabase using the **Command Line Interface (CLI)** instead of the web dashboard. This is the **recommended approach** for professional development.

---

## 📋 Table of Contents

1. [Why Use Supabase CLI?](#why-use-supabase-cli)
2. [Prerequisites](#prerequisites)
3. [Install Supabase CLI](#step-1-install-supabase-cli)
4. [Initialize Local Project](#step-2-initialize-local-project)
5. [Start Local Supabase](#step-3-start-local-supabase)
6. [Run Migrations](#step-4-run-migrations)
7. [Create Admin User](#step-5-create-admin-user)
8. [Link to Cloud Project](#step-6-link-to-cloud-project-optional)
9. [Deploy to Production](#step-7-deploy-to-production)
10. [CLI Commands Reference](#cli-commands-reference)
11. [Troubleshooting](#troubleshooting)

---

## Why Use Supabase CLI?

### Benefits:

✅ **Local Development** - Run Supabase locally without internet  
✅ **Version Control** - Track database changes in Git  
✅ **Automated Migrations** - Apply schema changes automatically  
✅ **Team Collaboration** - Share database schema with team  
✅ **Testing** - Test changes locally before deploying  
✅ **CI/CD Integration** - Automate deployments  

### CLI vs Dashboard:

| Feature | CLI | Dashboard |
|---------|-----|-----------|
| Local development | ✅ Yes | ❌ No |
| Migration tracking | ✅ Yes | ⚠️ Manual |
| Team collaboration | ✅ Easy | ⚠️ Harder |
| Learning curve | ⚠️ Steeper | ✅ Easier |
| Production ready | ✅ Yes | ✅ Yes |

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Docker Desktop** installed and running
  - [Download for Windows](https://www.docker.com/products/docker-desktop/)
  - [Download for Mac](https://www.docker.com/products/docker-desktop/)
  - [Download for Linux](https://docs.docker.com/desktop/install/linux-install/)
- ✅ **Node.js 18+** installed
- ✅ **pnpm** installed (`npm install -g pnpm`)
- ✅ **Git** installed
- ✅ This project cloned locally

### Verify Docker is Running:

```bash
docker --version
# Should show: Docker version 24.x.x or higher

docker ps
# Should show: CONTAINER ID   IMAGE   ... (empty list is fine)
```

If Docker is not running, start Docker Desktop application.

---

## Step 1: Install Supabase CLI

### Option A: Using npm (Recommended)

```bash
npm install -g supabase
```

### Option B: Using Homebrew (Mac/Linux)

```bash
brew install supabase/tap/supabase
```

### Option C: Using Scoop (Windows)

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Verify Installation:

```bash
supabase --version
# Should show: supabase version 1.x.x
```

---

## Step 2: Initialize Local Project

### 2.1 Navigate to Project Directory

```bash
cd v0-remix-of-spotlight-real-estate
```

### 2.2 Initialize Supabase

```bash
supabase init
```

**Expected output:**
```
✔ Port for Supabase URL: · 54321
✔ Port for PostgreSQL database: · 54322
✔ Project initialized.
Supabase URL: http://localhost:54321
Supabase Anon Key: eyJhbGc...
```

### 2.3 Verify Initialization

Your project should now have:

```
v0-remix-of-spotlight-real-estate/
├── supabase/
│   ├── config.toml          ← Supabase configuration
│   ├── seed.sql             ← Seed data (optional)
│   └── migrations/          ← Database migrations folder
├── .env.local
├── package.json
└── ...
```

---

## Step 3: Start Local Supabase

### 3.1 Start Supabase Services

```bash
supabase start
```

**⏳ First run takes 2-5 minutes** - Docker will download required images.

**Expected output:**
```
Applying migration 20240101000000_init.sql...
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**✅ Save these values!** You'll need them for `.env.local`

### 3.2 Verify Services are Running

```bash
supabase status
```

Should show all services as "running":
```
supabase local development setup is running.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
```

### 3.3 Open Supabase Studio

Open your browser to: **http://localhost:54323**

You should see the local Supabase Studio interface (same as cloud dashboard).

---

## Step 4: Run Migrations

### 4.1 Move Migration Files

Copy your SQL scripts to the migrations folder:

```bash
# Create migrations directory if it doesn't exist
mkdir -p supabase/migrations

# Copy migration files (Windows PowerShell)
Copy-Item scripts\*.sql supabase\migrations\

# OR on Mac/Linux
cp scripts/*.sql supabase/migrations/
```

### 4.2 Rename Migration Files

Supabase CLI requires specific naming format: `YYYYMMDDHHMMSS_description.sql`

Rename your files:

```bash
# In supabase/migrations/ folder
mv 001_create_profiles.sql 20240101000001_create_profiles.sql
mv 002_create_regions.sql 20240101000002_create_regions.sql
mv 003_create_agents.sql 20240101000003_create_agents.sql
mv 004_create_properties.sql 20240101000004_create_properties.sql
mv 005_create_property_images.sql 20240101000005_create_property_images.sql
mv 006_create_property_documents.sql 20240101000006_create_property_documents.sql
mv 007_create_leads.sql 20240101000007_create_leads.sql
mv 008_create_saved_searches.sql 20240101000008_create_saved_searches.sql
mv 008_create_viewings.sql 20240101000009_create_viewings.sql
mv 009_create_syndication.sql 20240101000010_create_syndication.sql
mv 010_create_analytics.sql 20240101000011_create_analytics.sql
mv 011_create_referrals.sql 20240101000012_create_referrals.sql
mv 012_create_lead_scoring.sql 20240101000013_create_lead_scoring.sql
mv 013_create_tasks.sql 20240101000014_create_tasks.sql
mv 014_create_documents_offers.sql 20240101000015_create_documents_offers.sql
mv 015_create_gdpr_compliance.sql 20240101000016_create_gdpr_compliance.sql
mv 016_create_audit_trigger.sql 20240101000017_create_audit_trigger.sql
```

**Or use this script** (save as `rename-migrations.sh` for Mac/Linux or `rename-migrations.ps1` for Windows):

**PowerShell (Windows):**
```powershell
$files = @(
    @{old="001_create_profiles.sql"; new="20240101000001_create_profiles.sql"},
    @{old="002_create_regions.sql"; new="20240101000002_create_regions.sql"},
    @{old="003_create_agents.sql"; new="20240101000003_create_agents.sql"},
    @{old="004_create_properties.sql"; new="20240101000004_create_properties.sql"},
    @{old="005_create_property_images.sql"; new="20240101000005_create_property_images.sql"},
    @{old="006_create_property_documents.sql"; new="20240101000006_create_property_documents.sql"},
    @{old="007_create_leads.sql"; new="20240101000007_create_leads.sql"},
    @{old="008_create_saved_searches.sql"; new="20240101000008_create_saved_searches.sql"},
    @{old="008_create_viewings.sql"; new="20240101000009_create_viewings.sql"},
    @{old="009_create_syndication.sql"; new="20240101000010_create_syndication.sql"},
    @{old="010_create_analytics.sql"; new="20240101000011_create_analytics.sql"},
    @{old="011_create_referrals.sql"; new="20240101000012_create_referrals.sql"},
    @{old="012_create_lead_scoring.sql"; new="20240101000013_create_lead_scoring.sql"},
    @{old="013_create_tasks.sql"; new="20240101000014_create_tasks.sql"},
    @{old="014_create_documents_offers.sql"; new="20240101000015_create_documents_offers.sql"},
    @{old="015_create_gdpr_compliance.sql"; new="20240101000016_create_gdpr_compliance.sql"},
    @{old="016_create_audit_trigger.sql"; new="20240101000017_create_audit_trigger.sql"}
)

foreach ($file in $files) {
    $source = "supabase\migrations\$($file.old)"
    $dest = "supabase\migrations\$($file.new)"
    if (Test-Path $source) {
        Move-Item $source $dest
        Write-Host "✓ Renamed $($file.old)"
    }
}
```

### 4.3 Apply Migrations

```bash
supabase db reset
```

This will:
1. Drop existing database
2. Apply all migrations in order
3. Run seed data (if any)

**Expected output:**
```
Resetting local database...
Applying migration 20240101000001_create_profiles.sql...
Applying migration 20240101000002_create_regions.sql...
...
Applying migration 20240101000017_create_audit_trigger.sql...
Finished supabase db reset.
```

### 4.4 Verify Migrations

```bash
supabase db diff
```

Should show: `No schema changes detected.`

Or check in Studio: **http://localhost:54323** → Table Editor

---

## Step 5: Create Admin User

### 5.1 Using SQL

Open Supabase Studio (**http://localhost:54323**) → SQL Editor:

```sql
-- Create admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@spotlight.gr',
  crypt('YourSecurePassword123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
);
```

### 5.2 Using Supabase Studio UI

1. Open **http://localhost:54323**
2. Go to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Fill in:
   ```
   Email: admin@spotlight.gr
   Password: YourSecurePassword123!
   Auto Confirm User: ✅ YES
   ```
5. Click **Create user**

---

## Step 6: Link to Cloud Project (Optional)

If you want to deploy to Supabase Cloud later:

### 6.1 Login to Supabase

```bash
supabase login
```

Opens browser for authentication. Sign in with your Supabase account.

### 6.2 Create Cloud Project

```bash
supabase projects create spotlight-real-estate
```

Or create via dashboard: https://supabase.com/dashboard

### 6.3 Link Local to Cloud

```bash
supabase link --project-ref your-project-ref
```

Find your project ref in: Supabase Dashboard → Settings → General

**Expected output:**
```
Linked to project: spotlight-real-estate (your-project-ref)
```

---

## Step 7: Deploy to Production

### 7.1 Push Migrations to Cloud

```bash
supabase db push
```

This applies all local migrations to your cloud database.

### 7.2 Get Production Credentials

```bash
supabase status --output json
```

Or from dashboard: Settings → API

### 7.3 Update Production Environment

Update your production `.env` (e.g., Vercel):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

---

## Configure Local Environment

### Update `.env.local`

After running `supabase start`, update your `.env.local`:

```env
# Local Supabase (for development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Production Supabase (uncomment when deploying)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
```

---

## CLI Commands Reference

### Essential Commands

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Check status
supabase status

# Reset database (reapply all migrations)
supabase db reset

# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# View database diff
supabase db diff

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts

# View logs
supabase logs

# Login to Supabase
supabase login

# Link to cloud project
supabase link --project-ref your-ref

# Deploy functions
supabase functions deploy function_name
```

### Database Commands

```bash
# Connect to database
supabase db shell

# Dump database schema
supabase db dump --schema public > schema.sql

# Dump database data
supabase db dump --data-only > data.sql

# Restore database
psql -h localhost -p 54322 -U postgres < backup.sql
```

### Migration Commands

```bash
# Create migration from SQL file
supabase migration new --sql-file path/to/file.sql

# Squash migrations
supabase migration squash

# Repair migration history
supabase migration repair
```

---

## Troubleshooting

### ❌ Error: "Docker is not running"

**Solution:**
1. Start Docker Desktop
2. Wait for Docker to fully start (green icon)
3. Run `supabase start` again

---

### ❌ Error: "Port already in use"

**Symptoms:**
```
Error: port 54321 is already in use
```

**Solution:**

```bash
# Check what's using the port
netstat -ano | findstr :54321  # Windows
lsof -i :54321                 # Mac/Linux

# Stop Supabase and restart
supabase stop
supabase start
```

Or change port in `supabase/config.toml`:
```toml
[api]
port = 54325  # Change to different port
```

---

### ❌ Error: "Migration failed"

**Symptoms:**
```
Error applying migration: relation "table_name" already exists
```

**Solution:**

```bash
# Reset database completely
supabase db reset

# If that fails, stop and remove volumes
supabase stop --no-backup
docker volume prune
supabase start
```

---

### ❌ Error: "Cannot connect to database"

**Solution:**

```bash
# Check if services are running
supabase status

# If not running, start them
supabase start

# Check Docker containers
docker ps

# Restart if needed
supabase stop
supabase start
```

---

### ❌ Error: "Authentication failed"

**Solution:**

```bash
# Re-login to Supabase
supabase login

# Check if linked correctly
supabase projects list
supabase link --project-ref your-ref
```

---

### 🔄 Reset Everything

If you want to start completely fresh:

```bash
# Stop Supabase
supabase stop --no-backup

# Remove all Docker volumes
docker volume prune -f

# Remove Supabase folder
rm -rf supabase/

# Start fresh
supabase init
supabase start
```

---

## Best Practices

### 1. **Use Migrations for All Schema Changes**

❌ **Don't:**
```sql
-- Manually editing in Studio
ALTER TABLE properties ADD COLUMN new_field text;
```

✅ **Do:**
```bash
# Create migration file
supabase migration new add_new_field_to_properties

# Edit the generated file in supabase/migrations/
# Then apply
supabase db reset
```

### 2. **Commit Migrations to Git**

```bash
git add supabase/migrations/
git commit -m "Add properties table migration"
```

### 3. **Test Locally Before Deploying**

```bash
# Test locally
supabase db reset
pnpm dev

# If all works, deploy
supabase db push
```

### 4. **Generate TypeScript Types**

```bash
# Generate types from local database
supabase gen types typescript --local > types/supabase.ts

# Use in your code
import { Database } from '@/types/supabase'
```

### 5. **Use Seed Data for Testing**

Create `supabase/seed.sql`:

```sql
-- Insert test data
INSERT INTO regions (name_en, name_gr, slug) VALUES
  ('Athens', 'Αθήνα', 'athens'),
  ('Thessaloniki', 'Θεσσαλονίκη', 'thessaloniki');

INSERT INTO agents (name_en, email) VALUES
  ('Maria Papadopoulos', 'maria@spotlight.gr');
```

Then run:
```bash
supabase db reset  # Applies migrations + seed data
```

---

## Next Steps

After CLI setup is complete:

1. ✅ Start development: `pnpm dev`
2. ✅ Access local Studio: http://localhost:54323
3. ✅ Add sample data via Studio or seed.sql
4. ✅ Generate TypeScript types
5. ✅ Commit migrations to Git
6. ✅ Deploy to production when ready

---

## Comparison: CLI vs Dashboard Setup

| Task | CLI Method | Dashboard Method |
|------|------------|------------------|
| Initial setup | `supabase init && supabase start` | Create project online |
| Run migrations | `supabase db reset` | Copy/paste in SQL Editor |
| Create tables | Write SQL in migrations/ | Use Table Editor |
| Version control | ✅ Automatic | ❌ Manual export |
| Team collaboration | ✅ Easy (Git) | ⚠️ Share SQL files |
| Local testing | ✅ Full local stack | ❌ Cloud only |
| Cost | ✅ Free (local) | ✅ Free tier available |
| Learning curve | ⚠️ Steeper | ✅ Easier |

---

**Recommendation:** Use CLI for development, Dashboard for quick checks and monitoring.

---

## 📚 Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Local Development Guide](https://supabase.com/docs/guides/cli/local-development)
- [Database Migrations](https://supabase.com/docs/guides/cli/managing-environments)
- [CLI GitHub Repository](https://github.com/supabase/cli)

---

**Last Updated:** November 2024  
**Supabase CLI Version:** 1.x.x  
**Docker Required:** Yes

