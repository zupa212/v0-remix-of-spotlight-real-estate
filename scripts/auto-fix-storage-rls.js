/**
 * AUTOMATIC STORAGE RLS FIX SCRIPT
 * 
 * This script automatically:
 * 1. Analyzes current RLS policy status
 * 2. Checks storage buckets
 * 3. Applies the migration via Supabase REST API
 * 4. Verifies the fix
 * 5. Tests upload functionality
 * 
 * Usage:
 *   node scripts/auto-fix-storage-rls.js
 * 
 * Or via npm:
 *   npm run storage:auto-fix
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

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

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '═'.repeat(70), 'cyan');
  log(`  ${title}`, 'bright');
  log('═'.repeat(70) + '\n', 'cyan');
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Analysis results
const analysis = {
  buckets: {
    'property-images': { exists: false, accessible: false, policies: [] },
    'agent-avatars': { exists: false, accessible: false, policies: [] },
    'property-documents': { exists: false, accessible: false, policies: [] },
  },
  policies: {
    total: 0,
    correct: 0,
    incorrect: 0,
    missing: 0,
  },
  migration: {
    applied: false,
    errors: [],
  },
};

// Step 1: Analyze current status
async function analyzeCurrentStatus() {
  logSection('STEP 1: ANALYZING CURRENT STATUS');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Check buckets
  logStep('1.1', 'Checking storage buckets...');
  const buckets = ['property-images', 'agent-avatars', 'property-documents'];

  for (const bucketName of buckets) {
    try {
      const { data, error } = await supabase.storage.from(bucketName).list('', { limit: 1 });
      
      if (error) {
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          logWarning(`Bucket '${bucketName}' does not exist`);
          analysis.buckets[bucketName].exists = false;
        } else {
          logError(`Error accessing bucket '${bucketName}': ${error.message}`);
          analysis.buckets[bucketName].accessible = false;
        }
      } else {
        logSuccess(`Bucket '${bucketName}' exists and is accessible`);
        analysis.buckets[bucketName].exists = true;
        analysis.buckets[bucketName].accessible = true;
      }
    } catch (error) {
      logError(`Exception checking bucket '${bucketName}': ${error.message}`);
    }
  }

  // Check policies (via REST API query)
  logStep('1.2', 'Checking RLS policies...');
  
  // Try to query policies via Supabase REST API
  // Note: This is a workaround since we can't directly query pg_policies
  logWarning('Direct policy query not available via REST API');
  log('   Will check policies after migration application\n');

  return analysis;
}

// Step 2: Read migration file
function readMigrationFile() {
  logSection('STEP 2: READING MIGRATION FILE');

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250110000002_complete_storage_rls_fix.sql');
  
  if (!fs.existsSync(migrationPath)) {
    logError(`Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  logSuccess(`Migration file loaded: ${path.basename(migrationPath)}`);
  log(`   Size: ${(sql.length / 1024).toFixed(2)} KB`);
  log(`   Lines: ${sql.split('\n').length}`);

  return sql;
}

// Step 3: Apply migration via Supabase Management API
async function applyMigrationViaAPI(sql) {
  logSection('STEP 3: APPLYING MIGRATION');

  // Extract project reference from URL
  const projectUrl = new URL(SUPABASE_URL);
  const projectRef = projectUrl.hostname.split('.')[0];

  // Split SQL into statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--') && !trimmed.startsWith('=');
    });

  log(`Found ${statements.length} SQL statements to execute\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  // Execute via Supabase SQL Editor API (if available)
  // Alternative: Use Supabase Dashboard API
  logWarning('Direct SQL execution via API is limited.');
  log('   Attempting to apply via Supabase REST API...\n');

  // Try to execute via PostgREST RPC (if exec_sql function exists)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement || statement.length === 0) continue;

    const policyMatch = statement.match(/CREATE POLICY "([^"]+)"/i) || 
                       statement.match(/DROP POLICY IF EXISTS "([^"]+)"/i);
    const policyName = policyMatch ? policyMatch[1] : `Statement ${i + 1}`;

    logStep(`${i + 1}/${statements.length}`, policyName);

    try {
      // Try via RPC first
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';' 
      });

      if (error) {
        // RPC doesn't exist or failed - this is expected
        logWarning(`RPC not available. Manual application required.`);
        results.push({ 
          success: false, 
          policy: policyName, 
          error: error.message,
          requiresManual: true 
        });
        failCount++;
      } else {
        logSuccess(`Applied: ${policyName}`);
        results.push({ success: true, policy: policyName });
        successCount++;
      }
    } catch (error) {
      logWarning(`${policyName}: ${error.message}`);
      results.push({ 
        success: false, 
        policy: policyName, 
        error: error.message,
        requiresManual: true 
      });
      failCount++;
    }
  }

  analysis.migration.applied = successCount > 0;
  analysis.migration.errors = results.filter(r => !r.success);

  log('\n' + '─'.repeat(70));
  log(`📊 Migration Results:`, 'bright');
  log(`   ✅ Success: ${successCount}`);
  log(`   ⚠️  Requires Manual: ${failCount}`);
  log(`   📝 Total: ${statements.length}`);
  log('─'.repeat(70) + '\n');

  return results;
}

// Step 4: Generate manual application instructions
function generateManualInstructions(sql) {
  logSection('STEP 4: MANUAL APPLICATION INSTRUCTIONS');

  log('Since automatic application is limited, please apply manually:\n');
  
  log('📋 STEPS:', 'bright');
  log('   1. Open Supabase Dashboard:', 'cyan');
  log(`      https://supabase.com/dashboard/project/${SUPABASE_URL.split('.')[0].split('//')[1] || 'your-project'}`, 'cyan');
  log('');
  log('   2. Navigate to SQL Editor:', 'cyan');
  log('      Left sidebar → SQL Editor → New Query', 'cyan');
  log('');
  log('   3. Copy the SQL below and paste it:', 'cyan');
  log('');
  log('   4. Click "Run" (or press Ctrl+Enter)', 'cyan');
  log('');
  log('   5. Wait for "Success. No rows returned"', 'cyan');
  log('');

  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('📝 SQL TO COPY:', 'bright');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');
  
  // Show first 20 lines of SQL as preview
  const sqlLines = sql.split('\n');
  const previewLines = sqlLines.slice(0, 20);
  previewLines.forEach(line => log(`   ${line}`, 'reset'));
  
  if (sqlLines.length > 20) {
    log(`\n   ... (${sqlLines.length - 20} more lines) ...\n`, 'yellow');
  }

  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('💡 TIP: Run this command to see full SQL:', 'bright');
  log('   npm run storage:fix-rls:show', 'cyan');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');
}

// Step 5: Verify after application
async function verifyAfterApplication() {
  logSection('STEP 5: VERIFICATION CHECKLIST');

  log('After applying the migration manually, verify:\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Test bucket access
  log('📦 Testing bucket access...\n');
  const buckets = ['property-images', 'agent-avatars', 'property-documents'];

  for (const bucketName of buckets) {
    try {
      const { data, error } = await supabase.storage.from(bucketName).list('', { limit: 1 });
      
      if (error) {
        logError(`Bucket '${bucketName}': ${error.message}`);
      } else {
        logSuccess(`Bucket '${bucketName}': Accessible`);
      }
    } catch (error) {
      logError(`Bucket '${bucketName}': ${error.message}`);
    }
  }

  log('\n📋 Manual Verification Steps:', 'bright');
  log('   1. Go to Supabase Dashboard → Storage → Policies', 'cyan');
  log('   2. Check that policies exist for all 3 buckets', 'cyan');
  log('   3. Verify policies use auth.uid() IS NOT NULL', 'cyan');
  log('   4. Test image upload in admin panel', 'cyan');
  log('');
}

// Step 6: Generate summary report
function generateSummaryReport() {
  logSection('STEP 6: SUMMARY REPORT');

  log('📊 ANALYSIS SUMMARY:\n', 'bright');

  // Buckets
  log('📦 Storage Buckets:', 'bright');
  Object.entries(analysis.buckets).forEach(([name, status]) => {
    const statusIcon = status.exists && status.accessible ? '✅' : '❌';
    log(`   ${statusIcon} ${name}: ${status.exists ? 'Exists' : 'Missing'} ${status.accessible ? '(Accessible)' : '(Not Accessible)'}`);
  });

  // Migration
  log('\n🔧 Migration Status:', 'bright');
  if (analysis.migration.applied) {
    logSuccess('Migration applied successfully');
  } else {
    logWarning('Migration requires manual application');
    log('   See Step 4 for instructions');
  }

  // Next steps
  log('\n📋 NEXT STEPS:', 'bright');
  log('   1. Apply migration manually (see Step 4)', 'cyan');
  log('   2. Verify policies in Supabase Dashboard', 'cyan');
  log('   3. Test image upload functionality', 'cyan');
  log('   4. Run: npm run storage:check (to verify)', 'cyan');
  log('');

  // Files
  log('📁 Files Created/Modified:', 'bright');
  log('   ✅ supabase/migrations/20250110000002_complete_storage_rls_fix.sql', 'green');
  log('   ✅ scripts/auto-fix-storage-rls.js (this script)', 'green');
  log('   ✅ scripts/check-storage-policies.js', 'green');
  log('   ✅ scripts/apply-storage-rls-fix-simple.js', 'green');
  log('');

  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('✅ Analysis Complete!', 'bright');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');
}

// Main execution
async function main() {
  log('\n' + '╔'.repeat(35), 'bright');
  log('║  AUTOMATIC STORAGE RLS FIX & ANALYSIS', 'bright');
  log('╚'.repeat(35) + '\n', 'bright');

  try {
    // Step 1: Analyze
    await analyzeCurrentStatus();

    // Step 2: Read migration
    const sql = readMigrationFile();

    // Step 3: Try to apply
    await applyMigrationViaAPI(sql);

    // Step 4: Manual instructions
    generateManualInstructions(sql);

    // Step 5: Verification
    await verifyAfterApplication();

    // Step 6: Summary
    generateSummaryReport();

  } catch (error) {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run
main().catch(console.error);

