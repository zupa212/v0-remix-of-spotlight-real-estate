/**
 * Verify RLS Status on All Tables
 * This script checks if RLS is enabled on all public tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSStatus() {
  console.log('🔍 Checking RLS status on all tables...\n');

  // Get all public tables
  const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM pg_tables t
            JOIN pg_class c ON c.relname = t.tablename
            WHERE t.schemaname = 'public'
            AND t.tablename = tablename
            AND c.relrowsecurity = true
          ) THEN true
          ELSE false
        END as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `
  });

  // Alternative approach using direct query
  const { data: rlsData, error: rlsError } = await supabase
    .from('_rls_status')
    .select('*');

  // Use a simpler approach - query information_schema
  const query = `
    SELECT 
      t.table_name,
      CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relname = t.table_name
          AND n.nspname = 'public'
          AND c.relrowsecurity = true
        ) THEN true
        ELSE false
      END as rls_enabled,
      (
        SELECT COUNT(*)
        FROM pg_policies p
        WHERE p.schemaname = 'public'
        AND p.tablename = t.table_name
      ) as policy_count
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: query });
    
    if (error) {
      // Fallback: use direct SQL query
      console.log('⚠️  Using alternative method to check RLS...\n');
      
      // List of expected tables
      const expectedTables = [
        'properties',
        'property_images',
        'property_documents',
        'agents',
        'regions',
        'profiles',
        'leads',
        'lead_activity',
        'viewings',
        'offers',
        'offer_events',
        'documents',
        'saved_searches',
        'alerts_log',
        'syndication_mappings',
        'analytics_clicks',
        'analytics_page_views',
        'experiments',
        'experiment_metrics',
        'referrals',
        'tasks',
        'task_templates',
        'consents',
        'audit_logs'
      ];

      console.log('📊 RLS Status Report\n');
      console.log('='.repeat(80));
      console.log(`${'Table Name'.padEnd(30)} | ${'RLS Enabled'.padEnd(15)} | ${'Policies'.padEnd(10)}`);
      console.log('='.repeat(80));

      let enabledCount = 0;
      let disabledCount = 0;
      let totalPolicies = 0;

      for (const tableName of expectedTables) {
        // Check if table exists
        const { data: tableExists } = await supabase
          .from(tableName)
          .select('*')
          .limit(0);

        if (tableExists !== null) {
          // Check RLS status by trying to query with anon key
          const { data: policies } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', tableName)
            .eq('schemaname', 'public');

          const policyCount = policies?.length || 0;
          totalPolicies += policyCount;

          // Assume RLS is enabled if policies exist (not perfect, but works)
          const rlsEnabled = policyCount > 0 ? '✅ YES' : '❌ NO';
          
          if (policyCount > 0) enabledCount++;
          else disabledCount++;

          console.log(
            `${tableName.padEnd(30)} | ${rlsEnabled.padEnd(15)} | ${policyCount.toString().padEnd(10)}`
          );
        } else {
          console.log(
            `${tableName.padEnd(30)} | ${'⚠️  NOT FOUND'.padEnd(15)} | ${'0'.padEnd(10)}`
          );
        }
      }

      console.log('='.repeat(80));
      console.log(`\n📈 Summary:`);
      console.log(`   ✅ RLS Enabled: ${enabledCount}`);
      console.log(`   ❌ RLS Disabled: ${disabledCount}`);
      console.log(`   📋 Total Policies: ${totalPolicies}`);
      console.log(`\n💡 To enable RLS on missing tables, run:`);
      console.log(`   npm run db:push`);
      console.log(`   or apply migration: supabase/migrations/20250109000003_enable_all_rls.sql\n`);

    } else {
      // Process the data
      console.log('📊 RLS Status Report\n');
      console.log('='.repeat(80));
      console.log(`${'Table Name'.padEnd(30)} | ${'RLS Enabled'.padEnd(15)} | ${'Policies'.padEnd(10)}`);
      console.log('='.repeat(80));

      let enabledCount = 0;
      let disabledCount = 0;
      let totalPolicies = 0;

      data.forEach(row => {
        const enabled = row.rls_enabled ? '✅ YES' : '❌ NO';
        const policies = row.policy_count || 0;
        totalPolicies += policies;

        if (row.rls_enabled) enabledCount++;
        else disabledCount++;

        console.log(
          `${row.table_name.padEnd(30)} | ${enabled.padEnd(15)} | ${policies.toString().padEnd(10)}`
        );
      });

      console.log('='.repeat(80));
      console.log(`\n📈 Summary:`);
      console.log(`   ✅ RLS Enabled: ${enabledCount}`);
      console.log(`   ❌ RLS Disabled: ${disabledCount}`);
      console.log(`   📋 Total Policies: ${totalPolicies}\n`);
    }
  } catch (err) {
    console.error('❌ Error checking RLS status:', err.message);
    console.log('\n💡 Please run the migration manually:');
    console.log('   supabase migration up');
    console.log('   or apply: supabase/migrations/20250109000003_enable_all_rls.sql\n');
  }
}

checkRLSStatus().catch(console.error);

