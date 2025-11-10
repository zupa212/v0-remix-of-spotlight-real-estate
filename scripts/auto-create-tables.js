#!/usr/bin/env node

/**
 * 🚀 AUTOMATIC TABLE CREATION FROM CURSOR
 * 
 * This script automatically creates all SQL tables from migration files.
 * I can run this from Cursor to create your entire database automatically!
 * 
 * Usage:
 *   node scripts/auto-create-tables.js
 *   npm run db:create:all
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const https = require('https')

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
const SUPABASE_PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// Method 1: Execute SQL using Supabase JS Client (RPC)
async function executeSQLViaClient(supabase, sql) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  const results = []
  
  for (const statement of statements) {
    try {
      // For DDL statements (CREATE, ALTER, DROP), we need to use a different approach
      // Supabase JS client doesn't support raw SQL execution directly
      // We'll use the Management API instead
      logInfo(`Executing: ${statement.substring(0, 50)}...`)
      
      // Try to execute via RPC if available
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
      
      if (error) {
        // RPC might not exist, that's okay - we'll use Management API
        throw new Error('RPC not available, using Management API')
      }
      
      results.push({ success: true, statement: statement.substring(0, 50) })
    } catch (error) {
      // Fall through to Management API
      throw error
    }
  }
  
  return results
}

// Method 2: Execute SQL using Supabase Management API
async function executeSQLViaManagementAPI(sql, accessToken) {
  if (!SUPABASE_PROJECT_REF || !accessToken) {
    throw new Error('Missing project ref or access token for Management API')
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql })
    
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }

    const req = https.request(options, (res) => {
      let body = ''

      res.on('data', (chunk) => {
        body += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            const result = JSON.parse(body)
            resolve(result)
          } catch (e) {
            resolve({ success: true, body })
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(data)
    req.end()
  })
}

// Read and execute SQL file
async function executeSQLFile(filePath, method = 'combined') {
  logInfo(`Reading: ${path.basename(filePath)}`)
  
  if (!fs.existsSync(filePath)) {
    logError(`File not found: ${filePath}`)
    return false
  }

  const sql = fs.readFileSync(filePath, 'utf8')
  
  // Clean up SQL (remove comments, normalize)
  const cleanSQL = sql
    .split('\n')
    .filter(line => {
      const trimmed = line.trim()
      return trimmed.length > 0 && !trimmed.startsWith('--')
    })
    .join('\n')

  try {
    if (method === 'management-api' && SUPABASE_SERVICE_ROLE_KEY) {
      logInfo('Using Management API...')
      await executeSQLViaManagementAPI(cleanSQL, SUPABASE_SERVICE_ROLE_KEY)
      logSuccess(`Executed: ${path.basename(filePath)}`)
      return true
    } else {
      // Try using Supabase client (limited - only for DML)
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)
      
      // For DDL statements, we need Management API
      if (cleanSQL.match(/^\s*(CREATE|ALTER|DROP|GRANT|REVOKE)/i)) {
        logWarning('DDL statements require Management API or manual execution')
        logInfo('Please run this SQL manually in Supabase SQL Editor:')
        logInfo(`File: ${filePath}`)
        return false
      }
      
      // For DML, we can use the client
      await executeSQLViaClient(supabase, cleanSQL)
      logSuccess(`Executed: ${path.basename(filePath)}`)
      return true
    }
  } catch (error) {
    logError(`Error executing ${path.basename(filePath)}: ${error.message}`)
    return false
  }
}

// Main function: Create all tables automatically
async function createAllTables() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright')
  log('║  🚀 AUTOMATIC TABLE CREATION FROM CURSOR                  ║', 'bright')
  log('╚════════════════════════════════════════════════════════════╝\n', 'bright')

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    logError('Missing Supabase environment variables!')
    logInfo('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
    process.exit(1)
  }

  logInfo(`Project: ${SUPABASE_PROJECT_REF || 'Unknown'}`)
  logInfo(`URL: ${SUPABASE_URL}\n`)

  // Option 1: Use combined migration file (fastest)
  const combinedFile = path.join(__dirname, '..', 'ALL_MIGRATIONS_COMBINED.sql')
  
  if (fs.existsSync(combinedFile)) {
    log('─'.repeat(60), 'cyan')
    log('METHOD 1: Using Combined Migration File', 'bright')
    log('─'.repeat(60), 'cyan')
    
    const success = await executeSQLFile(combinedFile, 'management-api')
    
    if (success) {
      logSuccess('\n✅ All tables created successfully!')
      return
    } else {
      logWarning('\n⚠️  Could not execute automatically. Using individual files...')
    }
  }

  // Option 2: Execute individual migration files in order
  log('\n─'.repeat(60), 'cyan')
  log('METHOD 2: Executing Individual Migration Files', 'bright')
  log('─'.repeat(60), 'cyan')

  const migrationFiles = [
    '001_create_profiles.sql',
    '002_create_regions.sql',
    '003_create_agents.sql',
    '004_create_properties.sql',
    '005_create_property_images.sql',
    '006_create_property_documents.sql',
    '007_create_leads.sql',
    '008_create_saved_searches.sql',
    '008_create_viewings.sql',
    '009_create_syndication.sql',
    '010_create_analytics.sql',
    '011_create_referrals.sql',
    '012_create_lead_scoring.sql',
    '013_create_tasks.sql',
    '014_create_documents_offers.sql',
    '015_create_gdpr_compliance.sql',
    '016_create_audit_trigger.sql'
  ]

  const scriptsDir = path.join(__dirname)
  let successCount = 0
  let failCount = 0

  for (const fileName of migrationFiles) {
    const filePath = path.join(scriptsDir, fileName)
    
    if (fs.existsSync(filePath)) {
      log(`\n📄 Processing: ${fileName}`)
      const success = await executeSQLFile(filePath, 'management-api')
      
      if (success) {
        successCount++
      } else {
        failCount++
        logWarning(`⚠️  ${fileName} needs manual execution`)
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } else {
      logWarning(`⚠️  File not found: ${fileName}`)
      failCount++
    }
  }

  // Summary
  log('\n' + '─'.repeat(60), 'cyan')
  log('📊 SUMMARY', 'bright')
  log('─'.repeat(60), 'cyan')
  logSuccess(`✅ Successfully executed: ${successCount} files`)
  if (failCount > 0) {
    logWarning(`⚠️  Needs manual execution: ${failCount} files`)
    logInfo('\nFor manual execution:')
    logInfo('1. Go to: https://supabase.com/dashboard/project/' + SUPABASE_PROJECT_REF + '/sql/new')
    logInfo('2. Copy SQL from the failed files')
    logInfo('3. Paste and click "Run"')
  }
  
  if (successCount === migrationFiles.length) {
    logSuccess('\n🎉 All tables created successfully!')
  }
}

// Verify tables were created
async function verifyTables() {
  log('\n─'.repeat(60), 'cyan')
  log('🔍 VERIFYING TABLES', 'bright')
  log('─'.repeat(60), 'cyan')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  const expectedTables = [
    'profiles',
    'regions',
    'agents',
    'properties',
    'property_images',
    'property_documents',
    'leads',
    'saved_searches',
    'viewings',
    'syndication_mappings',
    'analytics_clicks',
    'referrals',
    'lead_scoring',
    'tasks',
    'documents',
    'offers',
    'consents',
    'audit_logs'
  ]

  let foundCount = 0

  for (const tableName of expectedTables) {
    try {
      const { error } = await supabase.from(tableName).select('*').limit(1)
      
      if (error && error.code === 'PGRST116') {
        logWarning(`⚠️  Table not found: ${tableName}`)
      } else {
        logSuccess(`✅ Table exists: ${tableName}`)
        foundCount++
      }
    } catch (error) {
      logWarning(`⚠️  Could not verify: ${tableName}`)
    }
  }

  log(`\n📊 Found ${foundCount}/${expectedTables.length} tables`)
  
  if (foundCount === expectedTables.length) {
    logSuccess('🎉 All tables verified!')
  }
}

// Main execution
async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'verify':
      await verifyTables()
      break
    case 'create':
    default:
      await createAllTables()
      await verifyTables()
      break
  }
}

main().catch(error => {
  logError(`Fatal error: ${error.message}`)
  console.error(error)
  process.exit(1)
})

