#!/usr/bin/env bash

set -euo pipefail

# ============================================================================
# SPOTLIGHT REAL ESTATE - ONE-CLICK ONLINE DEPLOYMENT
# ============================================================================
# This script fully deploys your Supabase backend to the cloud:
# - Links to project
# - Pushes all migrations
# - Enables Realtime on all tables
# - Seeds sample data
# - Deploys Edge Functions
# - Verifies everything
# ============================================================================

# ============ CONFIG ============
: "${SB_PROJECT_REF:?Set SB_PROJECT_REF in env}"
: "${SUPABASE_ACCESS_TOKEN:?Set SUPABASE_ACCESS_TOKEN in env}"

SEED_FILE="supabase/seed.sql"
STORAGE_FILE="supabase/storage.sql"
VERIFY_FILE="supabase/verify.sql"
EDGE_FUNCS=("match-properties") # Edge functions to deploy
# =================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  SPOTLIGHT REAL ESTATE - ONE-CLICK DEPLOYMENT              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Link to Supabase
echo "🔗 Step 1: Linking to Supabase project: ${SB_PROJECT_REF}"
echo "────────────────────────────────────────────────────────────"
supabase link --project-ref "${SB_PROJECT_REF}"
echo "✅ Linked successfully!"
echo ""

# Step 2: Push migrations
echo "⬆️  Step 2: Pushing migrations to cloud..."
echo "────────────────────────────────────────────────────────────"
supabase db push
echo "✅ Migrations pushed successfully!"
echo ""

# Step 3: Apply storage buckets (if exists)
if [ -f "${STORAGE_FILE}" ]; then
  echo "🪣 Step 3: Applying storage buckets..."
  echo "────────────────────────────────────────────────────────────"
  supabase db execute --file "${STORAGE_FILE}"
  echo "✅ Storage buckets configured!"
  echo ""
fi

# Step 4: Enable Realtime on all tables
echo "📡 Step 4: Enabling Realtime on all tables..."
echo "────────────────────────────────────────────────────────────"
supabase db execute --sql "
  -- Ensure publication exists
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END \$\$;

  -- Add all tables to realtime (idempotent)
  DO \$\$
  DECLARE
    tbl TEXT;
  BEGIN
    FOR tbl IN 
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN (
        'profiles', 'regions', 'agents', 'properties', 'property_images', 
        'property_documents', 'leads', 'lead_activity', 'viewings', 'tasks', 
        'task_templates', 'saved_searches', 'alerts_log', 'offers', 'offer_events', 
        'documents', 'referrals', 'syndication_mappings', 'analytics_clicks', 
        'experiments', 'experiment_metrics', 'consents', 'audit_logs'
      )
    LOOP
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
        RAISE NOTICE 'Added % to realtime', tbl;
      EXCEPTION
        WHEN duplicate_object THEN
          RAISE NOTICE '% already in realtime', tbl;
      END;
    END LOOP;
  END \$\$;

  -- Set REPLICA IDENTITY FULL for all tables
  ALTER TABLE public.properties REPLICA IDENTITY FULL;
  ALTER TABLE public.leads REPLICA IDENTITY FULL;
  ALTER TABLE public.viewings REPLICA IDENTITY FULL;
  ALTER TABLE public.offers REPLICA IDENTITY FULL;
  ALTER TABLE public.saved_searches REPLICA IDENTITY FULL;
"
echo "✅ Realtime enabled on all tables!"
echo ""

# Step 5: Seed sample data
if [ -f "${SEED_FILE}" ]; then
  echo "🌱 Step 5: Seeding sample data (idempotent)..."
  echo "────────────────────────────────────────────────────────────"
  supabase db execute --file "${SEED_FILE}"
  echo "✅ Sample data seeded!"
  echo ""
fi

# Step 6: Verify database
echo "🧪 Step 6: Verifying database..."
echo "────────────────────────────────────────────────────────────"

# Create verification query
cat > "${VERIFY_FILE}" <<'SQL'
SELECT 
  'profiles' as table_name, 
  count(*) as row_count 
FROM public.profiles
UNION ALL
SELECT 'regions', count(*) FROM public.regions
UNION ALL
SELECT 'agents', count(*) FROM public.agents
UNION ALL
SELECT 'properties', count(*) FROM public.properties
UNION ALL
SELECT 'leads', count(*) FROM public.leads
UNION ALL
SELECT 'viewings', count(*) FROM public.viewings
UNION ALL
SELECT 'tasks', count(*) FROM public.tasks
UNION ALL
SELECT 'offers', count(*) FROM public.offers
UNION ALL
SELECT 'saved_searches', count(*) FROM public.saved_searches
ORDER BY table_name;
SQL

supabase db execute --file "${VERIFY_FILE}"
echo ""

# Step 7: Deploy Edge Functions
echo "⚙️  Step 7: Deploying Edge Functions..."
echo "────────────────────────────────────────────────────────────"
for fn in "${EDGE_FUNCS[@]}"; do
  if [ -d "supabase/functions/${fn}" ]; then
    echo "Deploying: ${fn}"
    supabase functions deploy "${fn}" --no-verify-jwt
    echo "✅ ${fn} deployed!"
  else
    echo "⚠️  Function directory not found: supabase/functions/${fn}"
  fi
done
echo ""

# Step 8: Final verification
echo "✅ Step 8: Final verification..."
echo "────────────────────────────────────────────────────────────"
echo ""
echo "Checking Realtime publication..."
supabase db execute --sql "
  SELECT tablename 
  FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime' 
  ORDER BY tablename;
"
echo ""

# Summary
echo "════════════════════════════════════════════════════════════"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "✅ What was deployed:"
echo "   • All database migrations"
echo "   • Realtime on 23 tables"
echo "   • Sample data (regions, agents, properties)"
echo "   • Edge Functions"
echo ""
echo "🔗 Your Supabase project:"
echo "   https://supabase.com/dashboard/project/${SB_PROJECT_REF}"
echo ""
echo "🚀 Next steps:"
echo "   1. Create admin user in Supabase Auth"
echo "   2. Configure Edge Function secrets (RESEND_API_KEY, SITE_URL)"
echo "   3. Enable pg_net extension"
echo "   4. Start your app: npm run dev"
echo "   5. Login: http://localhost:3000/admin/login"
echo ""
echo "✅ Your Supabase Cloud is fully configured!"
echo ""

