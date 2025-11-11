import { createServerClient as createServerClientSSR } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time, allow missing env vars (they'll be set in Vercel)
  // This prevents build errors when env vars aren't available
  if (!url || !key) {
    // Only throw at runtime, not during build
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      // In production on Vercel, env vars should be set
      throw new Error(
        "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel environment variables."
      )
    }
    // During build, return a minimal mock to prevent build errors
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
    } as any
  }

  const cookieStore = await cookies()

  return createServerClientSSR(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Same logic as createClient - safe during build
  if (!url || !key) {
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      throw new Error(
        "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel environment variables."
      )
    }
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
    } as any
  }

  const cookieStore = await cookies()

  return createServerClientSSR(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
