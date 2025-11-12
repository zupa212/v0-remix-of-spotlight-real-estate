import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, skip auth checks and continue
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing in middleware. Skipping auth checks.')
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect admin routes (but allow /admin/login)
    if (request.nextUrl.pathname.startsWith("/admin") && 
        !request.nextUrl.pathname.startsWith("/admin/login") && 
        !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }

    // Redirect to dashboard if already logged in and trying to access login page
    if (request.nextUrl.pathname === "/admin/login" && user) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    // If there's an error with Supabase, log it and continue
    console.error('Middleware error:', error)
    // Don't block the request if middleware fails
  }

  return supabaseResponse
}
