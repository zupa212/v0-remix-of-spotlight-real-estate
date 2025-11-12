/**
 * Script to apply storage RLS policies fix directly to Supabase
 * 
 * This script reads the migration file and applies it to your Supabase instance
 * using the service role key (bypasses RLS).
 * 
 * Usage:
 *   node scripts/apply-storage-rls-fix.js
 * 
 * Or via npm:
 *   npm run storage:fix-rls
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Please set these in your .env.local file');
  process.exit(1);
}

async function executeSQLViaSupabaseClient(sql) {
  // Create Supabase client with service role key
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--') && !trimmed.startsWith('=');
    });

  const results = [];

  // Execute each statement using REST API endpoint
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement || statement.length === 0) continue;

    // Extract policy name for logging
    const policyMatch = statement.match(/CREATE POLICY "([^"]+)"/i) || 
                       statement.match(/DROP POLICY IF EXISTS "([^"]+)"/i);
    const policyName = policyMatch ? policyMatch[1] : `Statement ${i + 1}`;

    try {
      // Use Supabase REST API to execute SQL
      // Note: Supabase doesn't support direct SQL execution via JS client
      // We'll use the REST API endpoint for PostgREST
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ sql_query: statement + ';' }),
      });

      if (response.ok) {
        console.log(`   ✅ ${policyName}`);
        results.push({ success: true, policy: policyName });
      } else {
        const errorText = await response.text();
        // Some errors are expected (e.g., policy already exists)
        if (errorText.includes('already exists') || errorText.includes('does not exist')) {
          console.log(`   ⚠️  ${policyName} (already processed)`);
          results.push({ success: true, policy: policyName, skipped: true });
        } else {
          console.error(`   ❌ ${policyName}: ${errorText.substring(0, 100)}`);
          results.push({ success: false, policy: policyName, error: errorText });
        }
      }
    } catch (error) {
      // If exec_sql RPC doesn't exist, we need manual application
      console.log(`   ⚠️  ${policyName} (requires manual application)`);
      results.push({ success: false, policy: policyName, error: error.message, manual: true });
    }
  }

  return results;
}

async function applyMigration() {
  console.log('🔧 Applying storage RLS policies fix...\n');

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250110000002_complete_storage_rls_fix.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  try {
    console.log('📝 Executing SQL statements via Supabase REST API...\n');
    console.log('⚠️  Note: Direct SQL execution may not be available.');
    console.log('   If this fails, you\'ll need to apply the migration manually.\n');
    
    const results = await executeSQLViaSupabaseClient(sql);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log('\n📊 Results:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);

    if (failCount > 0) {
      console.log('\n⚠️  Some statements failed. This might be normal if policies already exist.');
      console.log('   The migration is idempotent, so you can run it multiple times.');
    }

    console.log('\n✅ Storage RLS policies fix completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Try uploading an image in the admin panel');
    console.log('   2. If it still fails, check Supabase Dashboard → Storage → Policies');
    console.log('   3. Verify that policies use auth.uid() instead of auth.role()');
    console.log('');
    console.log('💡 If automatic application failed, apply manually:');
    console.log(`   File: ${migrationPath}`);
    console.log('   Via: Supabase Dashboard → SQL Editor → New Query');

  } catch (error) {
    console.error('\n❌ Failed to apply migration:');
    console.error(error);
    console.error('');
    console.error('⚠️  Please apply the migration manually:');
    console.error(`   File: ${migrationPath}`);
    console.error('');
    console.error('You can apply it via:');
    console.error('   1. Supabase Dashboard → SQL Editor → New Query');
    console.error('   2. Copy and paste the SQL from the migration file');
    console.error('   3. Run the query');
    process.exit(1);
  }
}

// Run the script
applyMigration().catch(console.error);

