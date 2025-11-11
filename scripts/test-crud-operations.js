/**
 * Test CRUD Operations for All Entities
 * This script verifies that all database CRUD operations work correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test results
const results = {
  properties: { create: false, read: false, update: false, delete: false },
  agents: { create: false, read: false, update: false, delete: false },
  leads: { create: false, read: false, update: false, delete: false },
  viewings: { create: false, read: false, update: false, delete: false },
  regions: { create: false, read: false, update: false, delete: false },
};

async function testPropertiesCRUD() {
  console.log('\n🏠 Testing Properties CRUD...');
  
  try {
    // CREATE
    const testProperty = {
      property_code: `TEST-${Date.now()}`,
      title_en: 'Test Property',
      title_gr: 'Δοκιμαστική Ιδιοκτησία',
      property_type: 'apartment',
      listing_type: 'sale',
      price_sale: 100000,
      currency: 'EUR',
      published: false,
    };
    
    const { data: created, error: createError } = await supabase
      .from('properties')
      .insert(testProperty)
      .select()
      .single();
    
    if (createError) throw createError;
    results.properties.create = true;
    console.log('  ✅ CREATE: Success');
    
    // READ
    const { data: read, error: readError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', created.id)
      .single();
    
    if (readError || !read) throw readError || new Error('Property not found');
    results.properties.read = true;
    console.log('  ✅ READ: Success');
    
    // UPDATE
    const { error: updateError } = await supabase
      .from('properties')
      .update({ title_en: 'Updated Test Property' })
      .eq('id', created.id);
    
    if (updateError) throw updateError;
    results.properties.update = true;
    console.log('  ✅ UPDATE: Success');
    
    // DELETE
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', created.id);
    
    if (deleteError) throw deleteError;
    results.properties.delete = true;
    console.log('  ✅ DELETE: Success');
    
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
}

async function testAgentsCRUD() {
  console.log('\n👤 Testing Agents CRUD...');
  
  try {
    // CREATE
    const testAgent = {
      name_en: 'Test Agent',
      name_gr: 'Δοκιμαστικός Πράκτορας',
      email: `test-${Date.now()}@example.com`,
      phone: '+306900000000',
      bio_en: 'Test bio',
      bio_gr: 'Δοκιμαστική βιογραφία',
    };
    
    const { data: created, error: createError } = await supabase
      .from('agents')
      .insert(testAgent)
      .select()
      .single();
    
    if (createError) throw createError;
    results.agents.create = true;
    console.log('  ✅ CREATE: Success');
    
    // READ
    const { data: read, error: readError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', created.id)
      .single();
    
    if (readError || !read) throw readError || new Error('Agent not found');
    results.agents.read = true;
    console.log('  ✅ READ: Success');
    
    // UPDATE
    const { error: updateError } = await supabase
      .from('agents')
      .update({ name_en: 'Updated Test Agent' })
      .eq('id', created.id);
    
    if (updateError) throw updateError;
    results.agents.update = true;
    console.log('  ✅ UPDATE: Success');
    
    // DELETE
    const { error: deleteError } = await supabase
      .from('agents')
      .delete()
      .eq('id', created.id);
    
    if (deleteError) throw deleteError;
    results.agents.delete = true;
    console.log('  ✅ DELETE: Success');
    
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
}

async function testLeadsCRUD() {
  console.log('\n📧 Testing Leads CRUD...');
  
  try {
    // CREATE
    const testLead = {
      full_name: 'Test Lead',
      email: `test-${Date.now()}@example.com`,
      phone: '+306900000000',
      message: 'Test inquiry',
      lead_type: 'property_inquiry',
      lead_source: 'website',
    };
    
    const { data: created, error: createError } = await supabase
      .from('leads')
      .insert(testLead)
      .select()
      .single();
    
    if (createError) throw createError;
    results.leads.create = true;
    console.log('  ✅ CREATE: Success');
    
    // READ
    const { data: read, error: readError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', created.id)
      .single();
    
    if (readError || !read) throw readError || new Error('Lead not found');
    results.leads.read = true;
    console.log('  ✅ READ: Success');
    
    // UPDATE
    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'contacted' })
      .eq('id', created.id);
    
    if (updateError) throw updateError;
    results.leads.update = true;
    console.log('  ✅ UPDATE: Success');
    
    // DELETE
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('id', created.id);
    
    if (deleteError) throw deleteError;
    results.leads.delete = true;
    console.log('  ✅ DELETE: Success');
    
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
}

async function testViewingsCRUD() {
  console.log('\n📅 Testing Viewings CRUD...');
  
  try {
    // Get a property and agent for the viewing
    const { data: properties } = await supabase.from('properties').select('id').limit(1);
    const { data: agents } = await supabase.from('agents').select('id').limit(1);
    
    if (!properties || properties.length === 0) {
      console.log('  ⚠️  Skipping: No properties found');
      return;
    }
    
    // CREATE
    const testViewing = {
      property_id: properties[0].id,
      agent_id: agents?.[0]?.id || null,
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      notes: 'Test viewing',
    };
    
    const { data: created, error: createError } = await supabase
      .from('viewings')
      .insert(testViewing)
      .select()
      .single();
    
    if (createError) throw createError;
    results.viewings.create = true;
    console.log('  ✅ CREATE: Success');
    
    // READ
    const { data: read, error: readError } = await supabase
      .from('viewings')
      .select('*')
      .eq('id', created.id)
      .single();
    
    if (readError || !read) throw readError || new Error('Viewing not found');
    results.viewings.read = true;
    console.log('  ✅ READ: Success');
    
    // UPDATE
    const { error: updateError } = await supabase
      .from('viewings')
      .update({ status: 'completed' })
      .eq('id', created.id);
    
    if (updateError) throw updateError;
    results.viewings.update = true;
    console.log('  ✅ UPDATE: Success');
    
    // DELETE
    const { error: deleteError } = await supabase
      .from('viewings')
      .delete()
      .eq('id', created.id);
    
    if (deleteError) throw deleteError;
    results.viewings.delete = true;
    console.log('  ✅ DELETE: Success');
    
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
}

async function testRegionsCRUD() {
  console.log('\n🌍 Testing Regions CRUD...');
  
  try {
    // CREATE
    const testRegion = {
      name_en: 'Test Region',
      name_gr: 'Δοκιμαστική Περιοχή',
      slug: `test-region-${Date.now()}`,
      description_en: 'Test region description',
      description_gr: 'Δοκιμαστική περιγραφή περιοχής',
    };
    
    const { data: created, error: createError } = await supabase
      .from('regions')
      .insert(testRegion)
      .select()
      .single();
    
    if (createError) throw createError;
    results.regions.create = true;
    console.log('  ✅ CREATE: Success');
    
    // READ
    const { data: read, error: readError } = await supabase
      .from('regions')
      .select('*')
      .eq('id', created.id)
      .single();
    
    if (readError || !read) throw readError || new Error('Region not found');
    results.regions.read = true;
    console.log('  ✅ READ: Success');
    
    // UPDATE
    const { error: updateError } = await supabase
      .from('regions')
      .update({ name_en: 'Updated Test Region' })
      .eq('id', created.id);
    
    if (updateError) throw updateError;
    results.regions.update = true;
    console.log('  ✅ UPDATE: Success');
    
    // DELETE
    const { error: deleteError } = await supabase
      .from('regions')
      .delete()
      .eq('id', created.id);
    
    if (deleteError) throw deleteError;
    results.regions.delete = true;
    console.log('  ✅ DELETE: Success');
    
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Starting CRUD Operations Test Suite\n');
  console.log('='.repeat(60));
  
  await testPropertiesCRUD();
  await testAgentsCRUD();
  await testLeadsCRUD();
  await testViewingsCRUD();
  await testRegionsCRUD();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary\n');
  
  const entities = Object.keys(results);
  let totalTests = 0;
  let passedTests = 0;
  
  entities.forEach(entity => {
    const ops = Object.keys(results[entity]);
    ops.forEach(op => {
      totalTests++;
      if (results[entity][op]) passedTests++;
    });
  });
  
  entities.forEach(entity => {
    const ops = Object.keys(results[entity]);
    const passed = ops.filter(op => results[entity][op]).length;
    const total = ops.length;
    const status = passed === total ? '✅' : '⚠️';
    console.log(`${status} ${entity.toUpperCase()}: ${passed}/${total} operations passed`);
  });
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n✅ All CRUD operations are working correctly!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some operations failed. Please check the errors above.');
    process.exit(1);
  }
}

runAllTests().catch(console.error);

