/**
 * Test Supabase Storage Operations
 * This script verifies that storage upload, read, and delete operations work correctly
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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
  propertyImages: { upload: false, read: false, delete: false },
  agentAvatars: { upload: false, read: false, delete: false },
  propertyDocuments: { upload: false, read: false, delete: false },
};

/**
 * Create a test image file (1x1 PNG)
 */
function createTestImage() {
  // Base64 encoded 1x1 transparent PNG
  const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(base64Image, 'base64');
  return buffer;
}

async function testPropertyImagesStorage() {
  console.log('\n🏠 Testing Property Images Storage...');
  
  try {
    const testImage = createTestImage();
    const fileName = `test-${Date.now()}.png`;
    const testPath = `test-property/${fileName}`;
    
    // UPLOAD
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(testPath, testImage, {
        contentType: 'image/png',
        cacheControl: '3600',
      });
    
    if (uploadError) throw uploadError;
    results.propertyImages.upload = true;
    console.log('  ✅ UPLOAD: Success');
    
    // READ (Get Public URL)
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(testPath);
    
    if (!publicUrl) throw new Error('Failed to get public URL');
    results.propertyImages.read = true;
    console.log('  ✅ READ: Success');
    
    // DELETE
    const { error: deleteError } = await supabase.storage
      .from('property-images')
      .remove([testPath]);
    
    if (deleteError) throw deleteError;
    results.propertyImages.delete = true;
    console.log('  ✅ DELETE: Success');
    
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
}

async function testAgentAvatarsStorage() {
  console.log('\n👤 Testing Agent Avatars Storage...');
  
  try {
    const testImage = createTestImage();
    const fileName = `test-${Date.now()}.png`;
    const testPath = `test-agent/${fileName}`;
    
    // UPLOAD
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agent-avatars')
      .upload(testPath, testImage, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true,
      });
    
    if (uploadError) throw uploadError;
    results.agentAvatars.upload = true;
    console.log('  ✅ UPLOAD: Success');
    
    // READ (Get Public URL)
    const { data: { publicUrl } } = supabase.storage
      .from('agent-avatars')
      .getPublicUrl(testPath);
    
    if (!publicUrl) throw new Error('Failed to get public URL');
    results.agentAvatars.read = true;
    console.log('  ✅ READ: Success');
    
    // DELETE
    const { error: deleteError } = await supabase.storage
      .from('agent-avatars')
      .remove([testPath]);
    
    if (deleteError) throw deleteError;
    results.agentAvatars.delete = true;
    console.log('  ✅ DELETE: Success');
    
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
}

async function testPropertyDocumentsStorage() {
  console.log('\n📄 Testing Property Documents Storage...');
  
  try {
    // Create a test PDF content (minimal valid PDF)
    const testPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');
    const fileName = `test-${Date.now()}.pdf`;
    const testPath = `test-property/${fileName}`;
    
    // UPLOAD
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-documents')
      .upload(testPath, testPdf, {
        contentType: 'application/pdf',
        cacheControl: '3600',
      });
    
    if (uploadError) {
      // If bucket doesn't exist, that's okay - it's optional
      if (uploadError.message.includes('Bucket not found')) {
        console.log('  ⚠️  UPLOAD: Bucket not found (optional feature)');
        return;
      }
      throw uploadError;
    }
    results.propertyDocuments.upload = true;
    console.log('  ✅ UPLOAD: Success');
    
    // READ (Get Public URL)
    const { data: { publicUrl } } = supabase.storage
      .from('property-documents')
      .getPublicUrl(testPath);
    
    if (!publicUrl) throw new Error('Failed to get public URL');
    results.propertyDocuments.read = true;
    console.log('  ✅ READ: Success');
    
    // DELETE
    const { error: deleteError } = await supabase.storage
      .from('property-documents')
      .remove([testPath]);
    
    if (deleteError) throw deleteError;
    results.propertyDocuments.delete = true;
    console.log('  ✅ DELETE: Success');
    
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
}

async function testBucketAccess() {
  console.log('\n🔐 Testing Bucket Access...');
  
  const buckets = ['property-images', 'agent-avatars', 'property-documents'];
  
  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.from(bucket).list('', {
        limit: 1,
      });
      
      if (error) {
        if (error.message.includes('Bucket not found')) {
          console.log(`  ⚠️  ${bucket}: Bucket not found (may need to be created)`);
        } else {
          console.log(`  ❌ ${bucket}: ${error.message}`);
        }
      } else {
        console.log(`  ✅ ${bucket}: Accessible`);
      }
    } catch (error) {
      console.log(`  ❌ ${bucket}: ${error.message}`);
    }
  }
}

async function runAllTests() {
  console.log('🧪 Starting Storage Operations Test Suite\n');
  console.log('='.repeat(60));
  
  await testBucketAccess();
  await testPropertyImagesStorage();
  await testAgentAvatarsStorage();
  await testPropertyDocumentsStorage();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary\n');
  
  const buckets = Object.keys(results);
  let totalTests = 0;
  let passedTests = 0;
  
  buckets.forEach(bucket => {
    const ops = Object.keys(results[bucket]);
    ops.forEach(op => {
      totalTests++;
      if (results[bucket][op]) passedTests++;
    });
  });
  
  buckets.forEach(bucket => {
    const ops = Object.keys(results[bucket]);
    const passed = ops.filter(op => results[bucket][op]).length;
    const total = ops.length;
    const status = passed === total ? '✅' : '⚠️';
    console.log(`${status} ${bucket.toUpperCase()}: ${passed}/${total} operations passed`);
  });
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n✅ All storage operations are working correctly!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some operations failed. Please check the errors above.');
    console.log('💡 Make sure storage buckets are created: npm run db:push');
    process.exit(1);
  }
}

runAllTests().catch(console.error);

