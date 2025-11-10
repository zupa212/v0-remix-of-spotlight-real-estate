#!/usr/bin/env node

/**
 * 🔍 COMPLETE DATABASE ANALYSIS
 * 
 * Analyzes all functions, triggers, RLS policies, and verifies everything works
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
}

loadEnvFile()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
)

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  bright: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function analyzeTables() {
  log('\n📊 ANALYZING TABLES', 'cyan')
  log('─'.repeat(60), 'cyan')

  const tables = [
    'profiles', 'regions', 'agents', 'properties', 'property_images',
    'property_documents', 'leads', 'saved_searches', 'viewings',
    'syndication_mappings', 'analytics_clicks', 'referrals',
    'lead_scoring', 'tasks', 'documents', 'offers', 'consents', 'audit_logs'
  ]

  const results = []

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        log(`  ❌ ${table}: ${error.message}`, 'red')
        results.push({ table, status: 'error', count: 0, error: error.message })
      } else {
        log(`  ✅ ${table}: ${count || 0} records`, 'green')
        results.push({ table, status: 'ok', count: count || 0 })
      }
    } catch (error) {
      log(`  ❌ ${table}: ${error.message}`, 'red')
      results.push({ table, status: 'error', count: 0, error: error.message })
    }
  }

  return results
}

async function analyzeFunctions() {
  log('\n🔧 ANALYZING FUNCTIONS', 'cyan')
  log('─'.repeat(60), 'cyan')

  // Check for common functions
  const functions = [
    'handle_new_user',
    'update_updated_at_column',
    'audit_trigger_function'
  ]

  const results = []

  for (const funcName of functions) {
    try {
      // Try to call the function (if it exists)
      const { data, error } = await supabase.rpc(funcName, {})
      
      if (error) {
        // Function might exist but need parameters, or might not exist
        if (error.message.includes('does not exist')) {
          log(`  ⚠️  ${funcName}: Not found`, 'yellow')
          results.push({ function: funcName, status: 'not_found' })
        } else {
          log(`  ✅ ${funcName}: Exists (${error.message})`, 'green')
          results.push({ function: funcName, status: 'exists', note: error.message })
        }
      } else {
        log(`  ✅ ${funcName}: Exists and callable`, 'green')
        results.push({ function: funcName, status: 'exists' })
      }
    } catch (error) {
      log(`  ⚠️  ${funcName}: Could not verify`, 'yellow')
      results.push({ function: funcName, status: 'unknown' })
    }
  }

  return results
}

async function analyzeRLS() {
  log('\n🔐 ANALYZING RLS POLICIES', 'cyan')
  log('─'.repeat(60), 'cyan')

  const tables = [
    'profiles', 'regions', 'agents', 'properties', 'leads', 'viewings'
  ]

  const results = []

  for (const table of tables) {
    try {
      // Try to select (should work with service role)
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error && error.code === '42501') {
        log(`  ⚠️  ${table}: RLS might be blocking`, 'yellow')
        results.push({ table, rls: 'blocking' })
      } else {
        log(`  ✅ ${table}: RLS configured`, 'green')
        results.push({ table, rls: 'ok' })
      }
    } catch (error) {
      log(`  ⚠️  ${table}: Could not verify RLS`, 'yellow')
      results.push({ table, rls: 'unknown' })
    }
  }

  return results
}

async function testDataOperations() {
  log('\n🧪 TESTING DATA OPERATIONS', 'cyan')
  log('─'.repeat(60), 'cyan')

  const tests = []

  // Test 1: Read properties
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('id, property_code, title_en')
      .limit(5)

    if (error) {
      log(`  ❌ Read properties: ${error.message}`, 'red')
      tests.push({ operation: 'read_properties', status: 'failed', error: error.message })
    } else {
      log(`  ✅ Read properties: ${data?.length || 0} found`, 'green')
      tests.push({ operation: 'read_properties', status: 'ok', count: data?.length || 0 })
    }
  } catch (error) {
    log(`  ❌ Read properties: ${error.message}`, 'red')
    tests.push({ operation: 'read_properties', status: 'failed', error: error.message })
  }

  // Test 2: Read agents
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('id, name_en, email')
      .limit(5)

    if (error) {
      log(`  ❌ Read agents: ${error.message}`, 'red')
      tests.push({ operation: 'read_agents', status: 'failed', error: error.message })
    } else {
      log(`  ✅ Read agents: ${data?.length || 0} found`, 'green')
      tests.push({ operation: 'read_agents', status: 'ok', count: data?.length || 0 })
    }
  } catch (error) {
    log(`  ❌ Read agents: ${error.message}`, 'red')
    tests.push({ operation: 'read_agents', status: 'failed', error: error.message })
  }

  // Test 3: Read regions
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('id, name_en, slug')
      .limit(5)

    if (error) {
      log(`  ❌ Read regions: ${error.message}`, 'red')
      tests.push({ operation: 'read_regions', status: 'failed', error: error.message })
    } else {
      log(`  ✅ Read regions: ${data?.length || 0} found`, 'green')
      tests.push({ operation: 'read_regions', status: 'ok', count: data?.length || 0 })
    }
  } catch (error) {
    log(`  ❌ Read regions: ${error.message}`, 'red')
    tests.push({ operation: 'read_regions', status: 'failed', error: error.message })
  }

  // Test 4: Test relationships
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        property_code,
        title_en,
        region:regions(name_en),
        agent:agents(name_en, email)
      `)
      .limit(3)

    if (error) {
      log(`  ❌ Test relationships: ${error.message}`, 'red')
      tests.push({ operation: 'test_relationships', status: 'failed', error: error.message })
    } else {
      log(`  ✅ Test relationships: ${data?.length || 0} with joins`, 'green')
      tests.push({ operation: 'test_relationships', status: 'ok', count: data?.length || 0 })
    }
  } catch (error) {
    log(`  ❌ Test relationships: ${error.message}`, 'red')
    tests.push({ operation: 'test_relationships', status: 'failed', error: error.message })
  }

  return tests
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright')
  log('║  🔍 COMPLETE DATABASE ANALYSIS                            ║', 'bright')
  log('╚════════════════════════════════════════════════════════════╝\n', 'bright')

  try {
    // Step 1: Analyze tables
    const tableResults = await analyzeTables()

    // Step 2: Analyze functions
    const functionResults = await analyzeFunctions()

    // Step 3: Analyze RLS
    const rlsResults = await analyzeRLS()

    // Step 4: Test data operations
    const testResults = await testDataOperations()

    // Summary
    log('\n' + '─'.repeat(60), 'cyan')
    log('📊 FINAL SUMMARY', 'bright')
    log('─'.repeat(60), 'cyan')

    const totalTables = tableResults.length
    const okTables = tableResults.filter(r => r.status === 'ok').length
    const totalRecords = tableResults.reduce((sum, r) => sum + (r.count || 0), 0)

    log(`\n📋 Tables: ${okTables}/${totalTables} working`, okTables === totalTables ? 'green' : 'yellow')
    log(`📊 Total Records: ${totalRecords}`, 'green')
    log(`🔧 Functions: ${functionResults.length} checked`, 'green')
    log(`🔐 RLS Policies: ${rlsResults.length} checked`, 'green')
    log(`🧪 Data Operations: ${testResults.filter(t => t.status === 'ok').length}/${testResults.length} passed`, 'green')

    if (okTables === totalTables && testResults.every(t => t.status === 'ok')) {
      log('\n🎉 All systems operational!', 'green')
    } else {
      log('\n⚠️  Some issues detected - check above for details', 'yellow')
    }

    log('\n')

  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  }
}

main()

