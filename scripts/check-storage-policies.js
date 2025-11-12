/**
 * Script to check current storage RLS policies status
 * 
 * Usage:
 *   node scripts/check-storage-policies.js
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkPolicies() {
  console.log('🔍 Checking storage RLS policies...\n');

  // Query to get all storage policies
  const query = `
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    ORDER BY policyname;
  `;

  try {
    // Use RPC to execute query
    const { data, error } = await supabase.rpc('exec_sql', { sql: query });

    if (error) {
      // Try alternative method - direct query via REST API
      console.log('⚠️  RPC not available, trying alternative method...\n');
      
      // Check policies by attempting to query storage metadata
      const buckets = ['property-images', 'agent-avatars', 'property-documents'];
      
      for (const bucket of buckets) {
        console.log(`📦 Checking bucket: ${bucket}`);
        
        // Try to list files (this will fail if no SELECT policy)
        const { data: files, error: listError } = await supabase.storage
          .from(bucket)
          .list('', { limit: 1 });

        if (listError) {
          console.log(`   ❌ Error accessing bucket: ${listError.message}`);
        } else {
          console.log(`   ✅ Bucket accessible`);
        }
      }

      console.log('\n⚠️  Cannot check policies directly. Please verify manually:');
      console.log('   1. Go to Supabase Dashboard → Storage → Policies');
      console.log('   2. Check that policies exist for all 3 buckets');
      console.log('   3. Verify policies use auth.uid() IS NOT NULL');
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ No storage policies found!');
      console.log('\n📋 You need to apply the migration:');
      console.log('   Run: npm run storage:fix-rls:show');
      console.log('   Then apply the SQL in Supabase Dashboard → SQL Editor');
      return;
    }

    console.log(`✅ Found ${data.length} storage policies\n`);

    // Group by bucket
    const policiesByBucket = {
      'property-images': [],
      'agent-avatars': [],
      'property-documents': [],
    };

    data.forEach(policy => {
      const policyDef = policy.qual || policy.with_check || '';
      
      if (policyDef.includes('property-images')) {
        policiesByBucket['property-images'].push(policy);
      } else if (policyDef.includes('agent-avatars')) {
        policiesByBucket['agent-avatars'].push(policy);
      } else if (policyDef.includes('property-documents')) {
        policiesByBucket['property-documents'].push(policy);
      }
    });

    // Check each bucket
    let allGood = true;

    for (const [bucket, policies] of Object.entries(policiesByBucket)) {
      console.log(`📦 ${bucket}:`);
      
      if (policies.length === 0) {
        console.log(`   ❌ No policies found!`);
        allGood = false;
        continue;
      }

      const hasSelect = policies.some(p => p.cmd === 'SELECT' || p.cmd === '*');
      const hasInsert = policies.some(p => p.cmd === 'INSERT' || p.cmd === '*');
      const hasUpdate = policies.some(p => p.cmd === 'UPDATE' || p.cmd === '*');
      const hasDelete = policies.some(p => p.cmd === 'DELETE' || p.cmd === '*');

      console.log(`   Policies: ${policies.length}`);
      console.log(`   SELECT: ${hasSelect ? '✅' : '❌'}`);
      console.log(`   INSERT: ${hasInsert ? '✅' : '❌'}`);
      console.log(`   UPDATE: ${hasUpdate ? '✅' : '❌'}`);
      console.log(`   DELETE: ${hasDelete ? '✅' : '❌'}`);

      // Check if using auth.uid() or auth.role()
      const usesAuthUid = policies.some(p => {
        const def = (p.qual || p.with_check || '').toLowerCase();
        return def.includes('auth.uid()');
      });

      const usesAuthRole = policies.some(p => {
        const def = (p.qual || p.with_check || '').toLowerCase();
        return def.includes('auth.role()');
      });

      if (usesAuthRole) {
        console.log(`   ⚠️  Uses auth.role() - NEEDS FIX!`);
        allGood = false;
      } else if (usesAuthUid) {
        console.log(`   ✅ Uses auth.uid() - Correct!`);
      }

      if (!hasInsert) {
        console.log(`   ❌ Missing INSERT policy - uploads will fail!`);
        allGood = false;
      }
    }

    console.log('\n' + '='.repeat(60));
    if (allGood) {
      console.log('✅ All policies look good!');
    } else {
      console.log('❌ Issues found! Please apply the migration:');
      console.log('   Run: npm run storage:fix-rls:show');
      console.log('   Then apply the SQL in Supabase Dashboard → SQL Editor');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error checking policies:', error.message);
    console.log('\n📋 Please verify manually:');
    console.log('   1. Go to Supabase Dashboard → Storage → Policies');
    console.log('   2. Check that policies exist for all 3 buckets');
    console.log('   3. Verify policies use auth.uid() IS NOT NULL');
    console.log('   4. If missing, apply migration: npm run storage:fix-rls:show');
  }
}

checkPolicies().catch(console.error);

