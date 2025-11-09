# Vercel Environment Variables Setup

## Required Environment Variables

To fix the build error, you need to add the following environment variables in your Vercel project:

### 1. Go to Vercel Dashboard
- Navigate to: https://vercel.com/dashboard
- Select your project: `v0-remix-of-spotlight-real-estate`

### 2. Go to Settings → Environment Variables

### 3. Add the following variables:

#### For **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_SUPABASE_URL=https://katlwauxbsbrbegpsawk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdGx3YXV4YnNicmJlZ3BzYXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzI4MzMsImV4cCI6MjA3ODIwODgzM30.JbZMf_kqfOzkZ94cB0Q9D-8kTNx1yz2yZCl6ZWbCuWI
```

### 4. After adding the variables:
1. **Redeploy** your project (or wait for the next push to trigger a new build)
2. The build should now succeed

## Verification

After adding the environment variables, the build should complete successfully. The error:
```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

Should no longer appear.

## Notes

- These are **public** environment variables (they start with `NEXT_PUBLIC_`), so they're safe to expose in the client-side code
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anonymous key, which is safe for client-side use
- Make sure to add them to **all three environments** (Production, Preview, Development) for consistency

