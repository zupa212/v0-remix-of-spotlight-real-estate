#!/usr/bin/env node

/**
 * Automatic Supabase Data Writer
 * 
 * This script allows automatic writing to Supabase backend
 * using the Supabase JS client.
 * 
 * Usage:
 *   node scripts/write-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Try to load .env.local manually (simple version without dotenv package)
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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Example: Insert sample data
async function insertSampleData() {
  console.log('🚀 Starting automatic data insertion...\n')

  // Example 1: Insert a region
  console.log('📝 Inserting sample region...')
  const { data: region, error: regionError } = await supabase
    .from('regions')
    .insert({
      name_en: 'Athens',
      name_gr: 'Αθήνα',
      slug: 'athens',
      description_en: 'The capital of Greece',
      description_gr: 'Η πρωτεύουσα της Ελλάδας',
      featured: true
    })
    .select()
    .single()

  if (regionError) {
    console.error('❌ Error inserting region:', regionError.message)
  } else {
    console.log('✅ Region inserted:', region.id)
  }

  // Example 2: Insert an agent
  console.log('\n📝 Inserting sample agent...')
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .insert({
      name_en: 'John Doe',
      name_gr: 'Γιάννης Παπαδόπουλος',
      email: 'john@example.com',
      phone: '+30 210 1234567',
      bio_en: 'Experienced real estate agent',
      bio_gr: 'Έμπειρος μεσίτης',
      featured: true,
      display_order: 1
    })
    .select()
    .single()

  if (agentError) {
    console.error('❌ Error inserting agent:', agentError.message)
  } else {
    console.log('✅ Agent inserted:', agent.id)
  }

  // Example 3: Insert a property (if region and agent exist)
  if (region && agent) {
    console.log('\n📝 Inserting sample property...')
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        property_code: 'PROP-001',
        title_en: 'Luxury Villa in Athens',
        title_gr: 'Πολυτελής Βίλα στην Αθήνα',
        description_en: 'Beautiful modern villa with sea view',
        description_gr: 'Όμορφη μοντέρνα βίλα με θέα στη θάλασσα',
        city_en: 'Athens',
        city_gr: 'Αθήνα',
        region_id: region.id,
        agent_id: agent.id,
        listing_type: 'sale',
        property_type: 'villa',
        status: 'available',
        price_sale: 500000,
        currency: 'EUR',
        bedrooms: 4,
        bathrooms: 3,
        area_sqm: 250,
        published: true,
        featured: true
      })
      .select()
      .single()

    if (propertyError) {
      console.error('❌ Error inserting property:', propertyError.message)
    } else {
      console.log('✅ Property inserted:', property.id)
    }
  }

  console.log('\n✅ Data insertion complete!')
}

// Example: Update data
async function updateData() {
  console.log('🔄 Updating data...\n')

  // Update all properties to be published
  const { data, error } = await supabase
    .from('properties')
    .update({ published: true })
    .eq('published', false)
    .select()

  if (error) {
    console.error('❌ Error updating properties:', error.message)
  } else {
    console.log(`✅ Updated ${data.length} properties`)
  }
}

// Example: Delete test data
async function deleteTestData() {
  console.log('🗑️  Deleting test data...\n')

  // Delete properties with test codes
  const { error } = await supabase
    .from('properties')
    .delete()
    .like('property_code', 'TEST-%')

  if (error) {
    console.error('❌ Error deleting test data:', error.message)
  } else {
    console.log('✅ Test data deleted')
  }
}

// Example: Run SQL from file
async function runSQLFromFile(filePath) {
  console.log(`📄 Running SQL from file: ${filePath}\n`)

  const sql = fs.readFileSync(filePath, 'utf8')
  
  // Split by semicolons and execute each statement
  const statements = sql.split(';').filter(s => s.trim().length > 0)

  for (const statement of statements) {
    const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
    
    if (error) {
      console.error('❌ Error executing SQL:', error.message)
      console.error('Statement:', statement.substring(0, 100))
    } else {
      console.log('✅ SQL executed successfully')
    }
  }
}

// Main function
async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'insert':
      await insertSampleData()
      break
    case 'update':
      await updateData()
      break
    case 'delete':
      await deleteTestData()
      break
    case 'sql':
      const filePath = process.argv[3]
      if (!filePath) {
        console.error('❌ Please provide a SQL file path')
        process.exit(1)
      }
      await runSQLFromFile(filePath)
      break
    default:
      console.log('📖 Usage:')
      console.log('  node scripts/write-to-supabase.js insert  - Insert sample data')
      console.log('  node scripts/write-to-supabase.js update  - Update data')
      console.log('  node scripts/write-to-supabase.js delete - Delete test data')
      console.log('  node scripts/write-to-supabase.js sql <file> - Run SQL from file')
  }
}

main().catch(console.error)

