#!/usr/bin/env node

/**
 * 🚀 AUTOMATIC SAMPLE DATA CREATION
 * 
 * Creates sample data for testing: regions, agents, properties
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
  blue: '\x1b[34m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function createSampleRegions() {
  log('\n📝 Creating sample regions...', 'cyan')
  
  const regions = [
    {
      name_en: 'Athens',
      name_gr: 'Αθήνα',
      slug: 'athens',
      description_en: 'The capital of Greece, rich in history and culture',
      description_gr: 'Η πρωτεύουσα της Ελλάδας, πλούσια σε ιστορία και πολιτισμό',
      featured: true,
      display_order: 1
    },
    {
      name_en: 'Mykonos',
      name_gr: 'Μύκονος',
      slug: 'mykonos',
      description_en: 'Famous for its vibrant nightlife and beautiful beaches',
      description_gr: 'Διάσημη για τη ζωντανή νυχτερινή ζωή και τις όμορφες παραλίες',
      featured: true,
      display_order: 2
    },
    {
      name_en: 'Santorini',
      name_gr: 'Σαντορίνη',
      slug: 'santorini',
      description_en: 'Stunning sunsets and luxury properties',
      description_gr: 'Εντυπωσιακά ηλιοβασιλέματα και πολυτελή ακίνητα',
      featured: true,
      display_order: 3
    }
  ]

  const createdRegions = []
  
  for (const region of regions) {
    const { data, error } = await supabase
      .from('regions')
      .upsert(region, { onConflict: 'slug' })
      .select()
      .single()

    if (error) {
      log(`  ❌ Error creating ${region.name_en}: ${error.message}`, 'red')
    } else {
      log(`  ✅ Created region: ${region.name_en} (${data.id})`, 'green')
      createdRegions.push(data)
    }
  }

  return createdRegions
}

async function createSampleAgents() {
  log('\n📝 Creating sample agents...', 'cyan')
  
  const agents = [
    {
      name_en: 'Maria Papadopoulos',
      name_gr: 'Μαρία Παπαδοπούλου',
      email: 'maria@spotless.gr',
      phone: '+30 210 1234567',
      bio_en: 'Experienced real estate agent specializing in luxury properties',
      bio_gr: 'Έμπειρη μεσίτρια ειδικευμένη σε πολυτελή ακίνητα',
      featured: true,
      display_order: 1
    },
    {
      name_en: 'Dimitris Konstantinou',
      name_gr: 'Δημήτρης Κωνσταντίνου',
      email: 'dimitris@spotless.gr',
      phone: '+30 210 2345678',
      bio_en: 'Expert in commercial and residential properties',
      bio_gr: 'Ειδικός σε εμπορικά και κατοικίες',
      featured: true,
      display_order: 2
    },
    {
      name_en: 'Elena Georgiou',
      name_gr: 'Ελένη Γεωργίου',
      email: 'elena@spotless.gr',
      phone: '+30 210 3456789',
      bio_en: 'Specialized in vacation rentals and investment properties',
      bio_gr: 'Ειδικευμένη σε διακοπές και επενδυτικά ακίνητα',
      featured: true,
      display_order: 3
    }
  ]

  const createdAgents = []
  
  for (const agent of agents) {
    // Check if agent already exists
    const { data: existing } = await supabase
      .from('agents')
      .select('id')
      .eq('email', agent.email)
      .single()

    if (existing) {
      log(`  ⚠️  Agent already exists: ${agent.name_en}`, 'yellow')
      createdAgents.push(existing)
      continue
    }

    const { data, error } = await supabase
      .from('agents')
      .insert(agent)
      .select()
      .single()

    if (error) {
      log(`  ❌ Error creating ${agent.name_en}: ${error.message}`, 'red')
    } else {
      log(`  ✅ Created agent: ${agent.name_en} (${data.id})`, 'green')
      createdAgents.push(data)
    }
  }

  return createdAgents
}

async function createSampleProperties(regions, agents) {
  log('\n📝 Creating sample properties...', 'cyan')
  
  if (!regions.length || !agents.length) {
    log('  ⚠️  Need regions and agents first!', 'yellow')
    return []
  }

  const properties = [
    {
      property_code: 'PROP-001',
      title_en: 'Luxury Villa in Mykonos with Sea View',
      title_gr: 'Πολυτελής Βίλα στη Μύκονο με Θέα στη Θάλασσα',
      description_en: 'Stunning modern villa with infinity pool, 5 bedrooms, and breathtaking sea views. Perfect for luxury living or vacation rental.',
      description_gr: 'Εντυπωσιακή μοντέρνα βίλα με infinity pool, 5 υπνοδωμάτια και εκπληκτική θέα στη θάλασσα. Ιδανική για πολυτελή διαβίωση ή διακοπές.',
      city_en: 'Mykonos',
      city_gr: 'Μύκονος',
      region_id: regions.find(r => r.slug === 'mykonos')?.id,
      agent_id: agents[0].id,
      listing_type: 'sale',
      property_type: 'villa',
      status: 'available',
      price_sale: 2500000,
      currency: 'EUR',
      bedrooms: 5,
      bathrooms: 4,
      area_sqm: 350,
      plot_size_sqm: 800,
      year_built: 2020,
      features: ['pool', 'sea_view', 'modern', 'luxury'],
      amenities: ['parking', 'garden', 'terrace', 'fireplace'],
      published: true,
      featured: true
    },
    {
      property_code: 'PROP-002',
      title_en: 'Modern Apartment in Athens Center',
      title_gr: 'Μοντέρνο Διαμέρισμα στο Κέντρο της Αθήνας',
      description_en: 'Beautiful 3-bedroom apartment in the heart of Athens, close to all amenities and public transport.',
      description_gr: 'Όμορφο διαμέρισμα 3 υπνοδωματίων στην καρδιά της Αθήνας, κοντά σε όλες τις ανέσεις και τα μέσα μεταφοράς.',
      city_en: 'Athens',
      city_gr: 'Αθήνα',
      region_id: regions.find(r => r.slug === 'athens')?.id,
      agent_id: agents[1].id,
      listing_type: 'sale',
      property_type: 'apartment',
      status: 'available',
      price_sale: 450000,
      currency: 'EUR',
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 120,
      year_built: 2015,
      features: ['modern', 'central', 'elevator'],
      amenities: ['parking', 'balcony', 'storage'],
      published: true,
      featured: true
    },
    {
      property_code: 'PROP-003',
      title_en: 'Luxury Villa in Santorini with Sunset View',
      title_gr: 'Πολυτελής Βίλα στη Σαντορίνη με Θέα στο Ηλιοβασίλεμα',
      description_en: 'Exclusive villa with private pool, 4 bedrooms, and stunning sunset views over the caldera.',
      description_gr: 'Αποκλειστική βίλα με ιδιωτική πισίνα, 4 υπνοδωμάτια και εκπληκτική θέα στο ηλιοβασίλεμα πάνω από την καλντέρα.',
      city_en: 'Santorini',
      city_gr: 'Σαντορίνη',
      region_id: regions.find(r => r.slug === 'santorini')?.id,
      agent_id: agents[2].id,
      listing_type: 'sale',
      property_type: 'villa',
      status: 'available',
      price_sale: 3200000,
      currency: 'EUR',
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 280,
      plot_size_sqm: 600,
      year_built: 2018,
      features: ['pool', 'sunset_view', 'caldera_view', 'luxury'],
      amenities: ['parking', 'garden', 'terrace', 'jacuzzi'],
      published: true,
      featured: true
    },
    {
      property_code: 'PROP-004',
      title_en: 'Beachfront House in Mykonos',
      title_gr: 'Παραθαλάσσιο Σπίτι στη Μύκονο',
      description_en: 'Charming beachfront property with direct beach access, 3 bedrooms, perfect for vacation rental.',
      description_gr: 'Γοητευτική παραθαλάσσια κατοικία με άμεση πρόσβαση στην παραλία, 3 υπνοδωμάτια, ιδανική για διακοπές.',
      city_en: 'Mykonos',
      city_gr: 'Μύκονος',
      region_id: regions.find(r => r.slug === 'mykonos')?.id,
      agent_id: agents[0].id,
      listing_type: 'rent',
      property_type: 'house',
      status: 'available',
      price_rent: 5000,
      currency: 'EUR',
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 180,
      plot_size_sqm: 400,
      year_built: 2010,
      features: ['beachfront', 'sea_view', 'traditional'],
      amenities: ['parking', 'garden', 'terrace'],
      published: true,
      featured: false
    },
    {
      property_code: 'PROP-005',
      title_en: 'Penthouse in Athens with Panoramic Views',
      title_gr: 'Πεντάορο στην Αθήνα με Πανοραμική Θέα',
      description_en: 'Luxurious penthouse on the 10th floor with panoramic city views, 4 bedrooms, and private rooftop terrace.',
      description_gr: 'Πολυτελές πεντάορο στον 10ο όροφο με πανοραμική θέα στην πόλη, 4 υπνοδωμάτια και ιδιωτική ταράτσα.',
      city_en: 'Athens',
      city_gr: 'Αθήνα',
      region_id: regions.find(r => r.slug === 'athens')?.id,
      agent_id: agents[1].id,
      listing_type: 'sale',
      property_type: 'apartment',
      status: 'available',
      price_sale: 850000,
      currency: 'EUR',
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 200,
      year_built: 2022,
      features: ['penthouse', 'panoramic_view', 'luxury', 'modern'],
      amenities: ['parking', 'elevator', 'rooftop_terrace', 'storage'],
      published: true,
      featured: true
    }
  ]

  const createdProperties = []
  
  for (const property of properties) {
    const { data, error } = await supabase
      .from('properties')
      .upsert(property, { onConflict: 'property_code' })
      .select()
      .single()

    if (error) {
      log(`  ❌ Error creating ${property.property_code}: ${error.message}`, 'red')
    } else {
      log(`  ✅ Created property: ${property.property_code} - ${property.title_en}`, 'green')
      createdProperties.push(data)
    }
  }

  return createdProperties
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan')
  log('║  🚀 AUTOMATIC SAMPLE DATA CREATION                        ║', 'cyan')
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan')

  try {
    // Step 1: Create regions
    const regions = await createSampleRegions()
    
    // Step 2: Create agents
    const agents = await createSampleAgents()
    
    // Step 3: Create properties
    const properties = await createSampleProperties(regions, agents)

    // Summary
    log('\n' + '─'.repeat(60), 'cyan')
    log('📊 SUMMARY', 'cyan')
    log('─'.repeat(60), 'cyan')
    log(`✅ Created ${regions.length} regions`, 'green')
    log(`✅ Created ${agents.length} agents`, 'green')
    log(`✅ Created ${properties.length} properties`, 'green')
    log('\n🎉 Sample data creation complete!\n', 'green')

  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  }
}

main()

