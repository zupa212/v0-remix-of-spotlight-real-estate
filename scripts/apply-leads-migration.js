#!/usr/bin/env node

/**
 * Script to apply the leads table migration to Supabase
 * 
 * Usage:
 *   node scripts/apply-leads-migration.js
 * 
 * Or with environment variables:
 *   SUPABASE_URL=your-url SUPABASE_SERVICE_KEY=your-key node scripts/apply-leads-migration.js
 */

const fs = require('fs');
const path = require('path');

// Read migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/20250118000001_fix_leads_columns.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📋 Leads Table Migration Script');
console.log('================================\n');

console.log('Migration SQL to apply:');
console.log('─'.repeat(50));
console.log(migrationSQL);
console.log('─'.repeat(50));
console.log('\n');

// Check if Supabase CLI is available
const { execSync } = require('child_process');

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function applyViaCLI() {
  console.log('✅ Supabase CLI detected\n');
  console.log('To apply this migration, run one of the following:\n');
  console.log('Option 1 - Link to remote project and push:');
  console.log('  supabase link --project-ref YOUR_PROJECT_REF');
  console.log('  supabase db push\n');
  console.log('Option 2 - Apply directly via SQL:');
  console.log('  supabase db execute --file supabase/migrations/20250118000001_fix_leads_columns.sql\n');
}

function applyViaDashboard() {
  console.log('📝 Manual Application Steps:\n');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy the migration SQL above');
  console.log('4. Paste it into the SQL Editor');
  console.log('5. Click "Run" to execute\n');
}

function applyViaAPI() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('⚠️  API method requires environment variables:');
    console.log('   SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
    console.log('   SUPABASE_SERVICE_ROLE_KEY\n');
    return false;
  }

  console.log('🌐 Applying via Supabase API...\n');
  
  // Note: Supabase REST API doesn't directly support SQL execution
  // This would need to be done via the Management API or pgREST
  console.log('⚠️  Direct API execution not supported.');
  console.log('   Please use Supabase CLI or Dashboard method.\n');
  return false;
}

// Main execution
console.log('Choose an application method:\n');

if (checkSupabaseCLI()) {
  applyViaCLI();
} else {
  console.log('ℹ️  Supabase CLI not found. Using manual method.\n');
}

applyViaDashboard();

console.log('✅ Migration ready to apply!');
console.log('\nAfter applying, verify the columns exist:');
console.log('   SELECT column_name FROM information_schema.columns');
console.log('   WHERE table_name = \'leads\'');
console.log('   AND column_name IN (\'full_name\', \'lead_source\', \'status\');\n');

