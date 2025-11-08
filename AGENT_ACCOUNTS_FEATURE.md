# 👥 AGENT ACCOUNTS & MULTI-TENANT FEATURE

## 🎯 What You Want:

1. ✅ When we enable an agent → create them a user account
2. ✅ Each agent can add their own properties
3. ✅ Each agent sees only their properties
4. ✅ Customers can see listings from specific agents
5. ✅ Featured agents at top level
6. ✅ Image upload to Supabase Storage

---

## 🔧 Implementation Plan:

### Feature 1: Agent User Accounts

**When creating/enabling an agent:**
1. Create auth user automatically
2. Link to agent record
3. Set role = 'agent'
4. Send welcome email with credentials

**Migration needed:**
```sql
-- Add user_id to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Function to create agent account
CREATE OR REPLACE FUNCTION create_agent_account(
  agent_id_param UUID,
  agent_email TEXT,
  agent_password TEXT
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create auth user (requires service_role)
  -- This would be called from Edge Function
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Feature 2: Agent Property Management

**RLS Policy Update:**
```sql
-- Agents see only their own properties
CREATE POLICY "agents_see_own_properties"
  ON properties FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM agents WHERE id = properties.agent_id
    )
  );

-- Agents can only edit their own properties
CREATE POLICY "agents_edit_own_properties"
  ON properties FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM agents WHERE id = properties.agent_id
    )
  );
```

### Feature 3: Agent-Specific Listings

**New Route:** `/agents/[id]/properties`

**Shows:**
- All properties by that agent
- Agent profile
- Contact info
- Featured badge

### Feature 4: Supabase Storage for Images

**Create Storage Buckets:**
```sql
-- In Supabase Dashboard → Storage → New Bucket
-- Bucket name: property-images
-- Public: YES
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
```

**Upload Function:**
```typescript
async function uploadPropertyImage(file: File, propertyId: string) {
  const supabase = createClient()
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${propertyId}/${Date.now()}.${fileExt}`
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('property-images')
    .upload(fileName, file)
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('property-images')
    .getPublicUrl(fileName)
  
  // Save to property_images table
  await supabase.from('property_images').insert({
    property_id: propertyId,
    image_url: publicUrl
  })
  
  return publicUrl
}
```

---

## 🚀 Quick Implementation:

I'll create:
1. Migration for agent accounts
2. Edge Function to create agent users
3. Updated RLS policies
4. Agent property management page
5. Public agent listings page
6. Image upload component with Supabase Storage
7. Storage bucket configuration

**Want me to implement all of this now?**

Say: "Implement agent accounts and storage" and I'll do it all! 🚀

