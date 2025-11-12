#!/usr/bin/env node

/**
 * Create or Update Admin User Script
 * 
 * This script creates or updates the admin user in Supabase.
 * If the user exists, it updates the password.
 * If the user doesn't exist, it creates a new one.
 * 
 * Usage: node scripts/create-admin-user.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin user credentials
const ADMIN_EMAIL = 'admin@spotlight.gr';
const ADMIN_PASSWORD = 'lalos834';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
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
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     Create/Update Admin User Script                       ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  log('');

  // Check environment variables
  if (!SUPABASE_URL) {
    logError('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
    logInfo('Please add NEXT_PUBLIC_SUPABASE_URL to your .env.local file');
    process.exit(1);
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    logError('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
    logWarning('Service role key is required to create/update admin users');
    logInfo('You can find it in: Supabase Dashboard → Settings → API → service_role key');
    logInfo('');
    logInfo('Alternative: Create user manually in Supabase Dashboard:');
    logInfo('1. Go to: Authentication → Users');
    logInfo('2. Click "Add user" → "Create new user"');
    logInfo(`3. Email: ${ADMIN_EMAIL}`);
    logInfo(`4. Password: ${ADMIN_PASSWORD}`);
    logInfo('5. Check "Auto Confirm User"');
    logInfo('6. Click "Create user"');
    process.exit(1);
  }

  // Create Supabase admin client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  logInfo(`Connecting to Supabase: ${SUPABASE_URL}`);
  log('');

  try {
    // Check if user exists
    logInfo(`Checking if user exists: ${ADMIN_EMAIL}`);
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      logError(`Error listing users: ${listError.message}`);
      process.exit(1);
    }

    const existingUser = existingUsers.users.find(user => user.email === ADMIN_EMAIL);

    if (existingUser) {
      // User exists - update password
      logWarning(`User ${ADMIN_EMAIL} already exists. Updating password...`);
      
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: ADMIN_PASSWORD,
          email_confirm: true
        }
      );

      if (updateError) {
        logError(`Error updating user: ${updateError.message}`);
        process.exit(1);
      }

      logSuccess('Admin user password updated successfully!');
      log('');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
      log('Admin User Credentials:', 'bright');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
      log(`Email: ${ADMIN_EMAIL}`, 'green');
      log(`Password: ${ADMIN_PASSWORD}`, 'green');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
      log('');
      logInfo('You can now login at: /admin/login');
    } else {
      // User doesn't exist - create new user
      logInfo(`User ${ADMIN_EMAIL} does not exist. Creating new user...`);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: 'Admin User',
          role: 'admin'
        }
      });

      if (createError) {
        logError(`Error creating user: ${createError.message}`);
        process.exit(1);
      }

      logSuccess('Admin user created successfully!');
      log('');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
      log('Admin User Credentials:', 'bright');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
      log(`Email: ${ADMIN_EMAIL}`, 'green');
      log(`Password: ${ADMIN_PASSWORD}`, 'green');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
      log('');
      logInfo('You can now login at: /admin/login');
    }

    // Also ensure profile exists
    log('');
    logInfo('Checking if profile exists...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      logWarning(`Error checking profile: ${profileError.message}`);
    } else if (!profile) {
      // Get the user ID
      const userId = existingUser?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === ADMIN_EMAIL)?.id;
      
      if (userId) {
        logInfo('Creating profile...');
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: ADMIN_EMAIL,
            full_name: 'Admin User',
            role: 'admin'
          });

        if (insertProfileError) {
          logWarning(`Error creating profile: ${insertProfileError.message}`);
        } else {
          logSuccess('Profile created successfully!');
        }
      }
    } else {
      logSuccess('Profile already exists');
    }

    log('');
    logSuccess('Setup complete!');
    log('');

  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();

