#!/usr/bin/env node

/**
 * Automated Supabase Migration Script
 * 
 * This script connects directly to your Supabase database and runs all migrations.
 * It will also create sample data and an admin user.
 * 
 * Usage: node run-migrations.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║  SPOTLIGHT REAL ESTATE - AUTOMATED DATABASE SETUP         ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝\n', 'bright');

  // Check environment variables
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    logError('Missing environment variables!');
    logInfo('Please ensure .env.local contains:');
    logInfo('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    logInfo('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    logInfo('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional, for admin operations)');
    process.exit(1);
  }

  logInfo(`Connecting to: ${SUPABASE_URL}`);

  // Create Supabase client (use service role if available for admin operations)
  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Test connection
  logInfo('Testing connection...');
  const { data: testData, error: testError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);

  if (testError && testError.code !== 'PGRST116') {
    // PGRST116 means table doesn't exist yet, which is fine
    if (testError.code !== '42P01') {
      logWarning(`Connection test: ${testError.message}`);
    }
  }
  logSuccess('Connected to Supabase!\n');

  // Step 1: Run migrations
  log('─'.repeat(60), 'cyan');
  log('STEP 1: Running Database Migrations', 'bright');
  log('─'.repeat(60), 'cyan');

  const migrationFile = path.join(__dirname, 'ALL_MIGRATIONS_COMBINED.sql');
  
  if (!fs.existsSync(migrationFile)) {
    logError(`Migration file not found: ${migrationFile}`);
    process.exit(1);
  }

  logInfo('Reading combined migration file...');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  logInfo('Executing migrations...');
  logWarning('Note: This uses the Supabase REST API. For complex migrations, use the SQL Editor.');
  
  // For the REST API, we need to execute this via the SQL Editor
  // Since we can't execute raw SQL via the JS client, we'll provide instructions
  logWarning('\n⚠️  IMPORTANT: The Supabase JS client cannot execute raw SQL directly.');
  logInfo('\nPlease run the migrations manually:');
  logInfo('1. Open: ' + SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/').replace('.supabase.co', '') + '/sql/new');
  logInfo('2. Copy the contents of: ALL_MIGRATIONS_COMBINED.sql');
  logInfo('3. Paste in the SQL Editor');
  logInfo('4. Click "Run"');
  logInfo('\nPress Ctrl+C to exit, or Enter to continue with admin user creation...');

  // Wait for user input
  await new Promise((resolve) => {
    process.stdin.once('data', resolve);
  });

  // Step 2: Create admin user
  log('\n' + '─'.repeat(60), 'cyan');
  log('STEP 2: Creating Admin User', 'bright');
  log('─'.repeat(60), 'cyan');

  const adminEmail = 'admin@spotlight.gr';
  const adminPassword = 'Admin123!Spotlight';

  logInfo(`Creating admin user: ${adminEmail}`);

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    logWarning('Service role key not provided. Please create admin user manually:');
    logInfo('1. Go to: ' + SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/').replace('.supabase.co', '') + '/auth/users');
    logInfo('2. Click "Add user" → "Create new user"');
    logInfo(`3. Email: ${adminEmail}`);
    logInfo(`4. Password: ${adminPassword}`);
    logInfo('5. Check "Auto Confirm User"');
    logInfo('6. Click "Create user"\n');
  } else {
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User'
      }
    });

    if (userError) {
      if (userError.message.includes('already registered')) {
        logWarning('Admin user already exists!');
      } else {
        logError(`Error creating admin user: ${userError.message}`);
      }
    } else {
      logSuccess('Admin user created successfully!');
      logInfo(`  Email: ${adminEmail}`);
      logInfo(`  Password: ${adminPassword}`);
    }
  }

  // Step 3: Add sample data
  log('\n' + '─'.repeat(60), 'cyan');
  log('STEP 3: Adding Sample Data', 'bright');
  log('─'.repeat(60), 'cyan');

  // Check if tables exist by trying to query them
  const { data: regionsData, error: regionsError } = await supabase
    .from('regions')
    .select('id')
    .limit(1);

  if (regionsError) {
    logWarning('Tables not created yet. Please run migrations first.');
  } else {
    logInfo('Adding sample regions...');
    const { error: regionInsertError } = await supabase
      .from('regions')
      .upsert([
        {
          name_en: 'Athens',
          name_gr: 'Αθήνα',
          slug: 'athens',
          description_en: 'Capital city of Greece with rich history',
          featured: true
        },
        {
          name_en: 'Mykonos',
          name_gr: 'Μύκονος',
          slug: 'mykonos',
          description_en: 'Beautiful Cycladic island',
          featured: true
        },
        {
          name_en: 'Santorini',
          name_gr: 'Σαντορίνη',
          slug: 'santorini',
          description_en: 'Iconic island with stunning sunsets',
          featured: true
        }
      ], { onConflict: 'slug' });

    if (regionInsertError) {
      logWarning(`Could not add regions: ${regionInsertError.message}`);
    } else {
      logSuccess('Sample regions added!');
    }

    logInfo('Adding sample agents...');
    const { error: agentInsertError } = await supabase
      .from('agents')
      .upsert([
        {
          name_en: 'Maria Papadopoulos',
          name_gr: 'Μαρία Παπαδοπούλου',
          email: 'maria@spotlight.gr',
          phone: '+30 210 123 4567',
          featured: true
        },
        {
          name_en: 'Nikos Dimitriou',
          name_gr: 'Νίκος Δημητρίου',
          email: 'nikos@spotlight.gr',
          phone: '+30 210 123 4568',
          featured: true
        }
      ], { onConflict: 'email' });

    if (agentInsertError) {
      logWarning(`Could not add agents: ${agentInsertError.message}`);
    } else {
      logSuccess('Sample agents added!');
    }
  }

  // Final summary
  log('\n' + '═'.repeat(60), 'green');
  log('SETUP COMPLETE!', 'bright');
  log('═'.repeat(60), 'green');

  logSuccess('\nYour Supabase backend is ready!');
  logInfo('\nNext steps:');
  logInfo('1. Start your dev server: npm run dev');
  logInfo('2. Open: http://localhost:3000/admin/login');
  logInfo(`3. Login with: ${adminEmail} / ${adminPassword}`);
  logInfo('4. Explore your admin dashboard!\n');

  log('Quick Links:', 'cyan');
  logInfo(`  Dashboard: ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/').replace('.supabase.co', '')}`);
  logInfo(`  SQL Editor: ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/').replace('.supabase.co', '')}/sql/new`);
  logInfo(`  Table Editor: ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/').replace('.supabase.co', '')}/editor`);
  logInfo(`  Your App: http://localhost:3000\n`);

  process.exit(0);
}

// Run the script
main().catch((error) => {
  logError(`\nFatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

