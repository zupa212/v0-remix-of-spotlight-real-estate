#!/usr/bin/env node

/**
 * Safe Database Reset Script
 * 
 * This script prevents accidental database resets on production.
 * It checks the linked project ref and aborts if it matches production.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Production project ref (NEVER reset this!)
const PRODUCTION_PROJECT_REF = 'katlwauxbsbrbegpsawk';

// Check environment variable
const SB_ENV = process.env.SB_ENV || 'development';

function main() {
  log('\n🛡️  SAFE DATABASE RESET', 'bright');
  log('═'.repeat(50), 'bright');

  // Check if Supabase is linked
  let projectRef;
  try {
    const output = execSync('supabase projects list', { encoding: 'utf-8' });
    const lines = output.split('\n');
    const linkedLine = lines.find(line => line.includes('*') || line.includes('LINKED'));
    
    if (linkedLine) {
      // Extract project ref from the line
      const parts = linkedLine.trim().split(/\s+/);
      projectRef = parts[2]; // Assuming format: LINKED | ORG_ID | PROJECT_REF | ...
    }
  } catch (error) {
    log('⚠️  Could not determine linked project', 'yellow');
    log('Make sure you are linked to a Supabase project', 'yellow');
    process.exit(1);
  }

  // Safety check 1: Production project ref
  if (projectRef === PRODUCTION_PROJECT_REF) {
    log('\n❌ DANGER: You are linked to PRODUCTION!', 'red');
    log('═'.repeat(50), 'red');
    log(`Project Ref: ${projectRef}`, 'red');
    log('\n🚨 ABORTING: Cannot reset production database!', 'red');
    log('If you really need to reset production:', 'yellow');
    log('1. Backup your data first', 'yellow');
    log('2. Run: supabase db reset --linked (at your own risk!)', 'yellow');
    log('\n', 'reset');
    process.exit(1);
  }

  // Safety check 2: Environment variable
  if (SB_ENV === 'production' || SB_ENV === 'prod') {
    log('\n❌ DANGER: SB_ENV is set to production!', 'red');
    log('═'.repeat(50), 'red');
    log(`SB_ENV: ${SB_ENV}`, 'red');
    log('\n🚨 ABORTING: Cannot reset production database!', 'red');
    log('\n', 'reset');
    process.exit(1);
  }

  // All checks passed
  log('\n✅ Safety checks passed', 'green');
  log(`Project Ref: ${projectRef || 'local'}`, 'green');
  log(`Environment: ${SB_ENV}`, 'green');
  log('\n⚠️  This will DELETE ALL DATA in your local database!', 'yellow');
  log('Press Ctrl+C to cancel, or Enter to continue...', 'yellow');

  // Wait for user confirmation
  process.stdin.once('data', () => {
    log('\n🔄 Resetting database...', 'bright');
    
    try {
      execSync('supabase db reset', { stdio: 'inherit' });
      log('\n✅ Database reset complete!', 'green');
    } catch (error) {
      log('\n❌ Error resetting database', 'red');
      console.error(error);
      process.exit(1);
    }
  });
}

main();

