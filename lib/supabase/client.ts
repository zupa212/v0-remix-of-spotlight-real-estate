import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time, allow missing env vars (they'll be set in Vercel)
  // This prevents build errors when env vars aren't available
  if (!url || !key) {
    // Only throw at runtime in browser, not during build
    if (typeof window === 'undefined') {
      // Server-side during build - return mock
      console.warn('Supabase env vars missing during build. This is expected if not set in Vercel.')
      return {
        from: () => ({ 
          select: () => Promise.resolve({ data: null, error: null }),
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => Promise.resolve({ data: null, error: null }),
          delete: () => Promise.resolve({ data: null, error: null }),
        }),
        auth: { 
          getUser: async () => ({ data: { user: null }, error: null }),
          signOut: async () => ({ error: null }),
        },
        removeChannel: () => {},
        channel: () => ({ 
          on: () => ({ subscribe: () => ({}) }),
        }),
        storage: {
          from: () => ({
            upload: () => Promise.resolve({ data: null, error: null }),
            remove: () => Promise.resolve({ data: null, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          }),
        },
      } as any
    }
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables."
    )
  }

  return createBrowserClientSSR(url, key)
}

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Same logic as createClient - safe during build
  if (!url || !key) {
    if (typeof window === 'undefined') {
      console.warn('Supabase env vars missing during build.')
      return {
        from: () => ({ 
          select: () => Promise.resolve({ data: null, error: null }),
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => Promise.resolve({ data: null, error: null }),
          delete: () => Promise.resolve({ data: null, error: null }),
        }),
        auth: { 
          getUser: async () => ({ data: { user: null }, error: null }),
          signOut: async () => ({ error: null }),
        },
        removeChannel: () => {},
        channel: () => ({ 
          on: () => ({ subscribe: () => ({}) }),
        }),
        storage: {
          from: () => ({
            upload: () => Promise.resolve({ data: null, error: null }),
            remove: () => Promise.resolve({ data: null, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          }),
        },
      } as any
    }
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables."
    )
  }

  return createBrowserClientSSR(url, key)
}
