import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, return mock client to prevent crashes
  // This allows the app to work even if env vars aren't set (graceful degradation)
  if (!url || !key) {
    console.warn('Supabase env vars missing. Returning mock client. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.')
    
    // Create a chainable mock query builder
    const createMockQuery = () => {
      const query = {
        select: (columns?: string) => query,
        eq: (column: string, value: any) => query,
        neq: (column: string, value: any) => query,
        gt: (column: string, value: any) => query,
        gte: (column: string, value: any) => query,
        lt: (column: string, value: any) => query,
        lte: (column: string, value: any) => query,
        like: (column: string, pattern: string) => query,
        ilike: (column: string, pattern: string) => query,
        is: (column: string, value: any) => query,
        in: (column: string, values: any[]) => query,
        contains: (column: string, value: any) => query,
        order: (column: string, options?: { ascending?: boolean }) => query,
        limit: (count: number) => query,
        range: (from: number, to: number) => query,
        single: () => Promise.resolve({ data: null, error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        then: (onResolve?: (value: any) => any, onReject?: (error: any) => any) => {
          return Promise.resolve({ data: null, error: null }).then(onResolve, onReject)
        },
        catch: (onReject?: (error: any) => any) => {
          return Promise.resolve({ data: null, error: null }).catch(onReject)
        },
      }
      return query
    }
    
    return {
      from: (table: string) => createMockQuery(),
      insert: (data: any) => Promise.resolve({ data: null, error: null }),
      update: (data: any) => createMockQuery(),
      upsert: (data: any) => Promise.resolve({ data: null, error: null }),
      delete: () => createMockQuery(),
      auth: { 
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
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
          list: () => Promise.resolve({ data: null, error: null }),
        }),
      },
    } as any
  }

  return createBrowserClientSSR(url, key)
}

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Same logic as createClient - return mock if env vars missing
  if (!url || !key) {
    console.warn('Supabase env vars missing. Returning mock client.')
    
    // Create a chainable mock query builder
    const createMockQuery = () => {
      const query = {
        select: (columns?: string) => query,
        eq: (column: string, value: any) => query,
        neq: (column: string, value: any) => query,
        gt: (column: string, value: any) => query,
        gte: (column: string, value: any) => query,
        lt: (column: string, value: any) => query,
        lte: (column: string, value: any) => query,
        like: (column: string, pattern: string) => query,
        ilike: (column: string, pattern: string) => query,
        is: (column: string, value: any) => query,
        in: (column: string, values: any[]) => query,
        contains: (column: string, value: any) => query,
        order: (column: string, options?: { ascending?: boolean }) => query,
        limit: (count: number) => query,
        range: (from: number, to: number) => query,
        single: () => Promise.resolve({ data: null, error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        then: (onResolve?: (value: any) => any, onReject?: (error: any) => any) => {
          return Promise.resolve({ data: null, error: null }).then(onResolve, onReject)
        },
        catch: (onReject?: (error: any) => any) => {
          return Promise.resolve({ data: null, error: null }).catch(onReject)
        },
      }
      return query
    }
    
    return {
      from: (table: string) => createMockQuery(),
      insert: (data: any) => Promise.resolve({ data: null, error: null }),
      update: (data: any) => createMockQuery(),
      upsert: (data: any) => Promise.resolve({ data: null, error: null }),
      delete: () => createMockQuery(),
      auth: { 
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
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
          list: () => Promise.resolve({ data: null, error: null }),
        }),
      },
    } as any
  }

  return createBrowserClientSSR(url, key)
}
