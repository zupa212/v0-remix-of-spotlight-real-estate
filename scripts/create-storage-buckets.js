/**
 * Create Storage Buckets in Supabase
 * This script creates the storage buckets if they don't exist
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket(id, name, publicAccess, fileSizeLimit, allowedMimeTypes) {
  try {
    // Check if bucket exists
    const { data: existing, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`❌ Error listing buckets:`, listError);
      return false;
    }

    const bucketExists = existing?.some(b => b.id === id);
    
    if (bucketExists) {
      console.log(`✅ Bucket "${id}" already exists`);
      return true;
    }

    // Create bucket via API
    const { data, error } = await supabase.storage.createBucket(id, {
      public: publicAccess,
      fileSizeLimit: fileSizeLimit,
      allowedMimeTypes: allowedMimeTypes,
    });

    if (error) {
      // If bucket creation fails, try SQL method
      console.log(`⚠️  API method failed, trying SQL method...`);
      
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING;
        `,
        params: [id, name, publicAccess, fileSizeLimit, allowedMimeTypes]
      });

      if (sqlError) {
        console.error(`❌ Failed to create bucket "${id}":`, sqlError.message);
        console.log(`\n💡 Please create the bucket manually in Supabase Dashboard:`);
        console.log(`   1. Go to Storage`);
        console.log(`   2. Create new bucket: ${id}`);
        console.log(`   3. Set public: ${publicAccess}`);
        console.log(`   4. Set file size limit: ${fileSizeLimit} bytes`);
        return false;
      } else {
        console.log(`✅ Bucket "${id}" created via SQL`);
        return true;
      }
    } else {
      console.log(`✅ Bucket "${id}" created successfully`);
      return true;
    }
  } catch (err) {
    console.error(`❌ Error creating bucket "${id}":`, err.message);
    return false;
  }
}

async function createAllBuckets() {
  console.log('🚀 Creating storage buckets...\n');

  const buckets = [
    {
      id: 'property-images',
      name: 'property-images',
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    {
      id: 'agent-avatars',
      name: 'agent-avatars',
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    {
      id: 'property-documents',
      name: 'property-documents',
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const bucket of buckets) {
    const success = await createBucket(
      bucket.id,
      bucket.name,
      bucket.public,
      bucket.fileSizeLimit,
      bucket.allowedMimeTypes
    );
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Created/Verified: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  if (failCount > 0) {
    console.log(`\n💡 For failed buckets, create them manually in Supabase Dashboard:`);
    console.log(`   Storage → Create Bucket`);
    process.exit(1);
  } else {
    console.log(`\n✅ All buckets are ready!`);
    process.exit(0);
  }
}

createAllBuckets().catch(console.error);

