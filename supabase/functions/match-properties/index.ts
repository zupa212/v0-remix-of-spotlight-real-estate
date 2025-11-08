// Edge Function: Match Properties to Saved Searches
// Triggered when a new property is inserted
// Finds matching saved searches and sends notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PropertyPayload {
  type: 'INSERT' | 'UPDATE'
  table: string
  record: any
  schema: string
  old_record: any
}

interface SavedSearch {
  id: string
  user_id: string
  name: string
  filters_json: any
  channels: string[]
  frequency: string
  is_active: boolean
}

interface UserProfile {
  id: string
  email: string
  full_name: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse the webhook payload
    const payload: PropertyPayload = await req.json()
    const property = payload.record

    console.log('New property:', property.id, property.title_en)

    // Only process published properties
    if (!property.published) {
      console.log('Property not published, skipping')
      return new Response(
        JSON.stringify({ message: 'Property not published' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all active saved searches
    const { data: savedSearches, error: searchError } = await supabaseClient
      .from('saved_searches')
      .select('*')
      .eq('is_active', true)

    if (searchError) {
      throw searchError
    }

    console.log(`Found ${savedSearches?.length || 0} active saved searches`)

    const matches: { search: SavedSearch; user: UserProfile }[] = []

    // Check each saved search for matches
    for (const search of savedSearches || []) {
      if (matchesFilters(property, search.filters_json)) {
        // Get user profile for notification
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', search.user_id)
          .single()

        if (profile) {
          matches.push({ search, user: profile })
          console.log(`Match found for user ${profile.email}`)
        }
      }
    }

    console.log(`Total matches: ${matches.length}`)

    // Send notifications for each match
    const notifications = []
    for (const match of matches) {
      // Log the alert
      const { error: logError } = await supabaseClient
        .from('alerts_log')
        .insert({
          saved_search_id: match.search.id,
          property_id: property.id,
          channel: match.search.channels[0] || 'email',
          status: 'pending'
        })

      if (logError) {
        console.error('Error logging alert:', logError)
      }

      // Send notifications based on channels
      for (const channel of match.search.channels) {
        if (channel === 'email') {
          notifications.push(
            sendEmailNotification(match.user, property, match.search)
          )
        } else if (channel === 'whatsapp') {
          notifications.push(
            sendWhatsAppNotification(match.user, property, match.search)
          )
        } else if (channel === 'telegram') {
          notifications.push(
            sendTelegramNotification(match.user, property, match.search)
          )
        }
      }
    }

    // Wait for all notifications to complete
    await Promise.allSettled(notifications)

    return new Response(
      JSON.stringify({
        success: true,
        property_id: property.id,
        matches: matches.length,
        notifications_sent: notifications.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Match property against saved search filters
function matchesFilters(property: any, filters: any): boolean {
  if (!filters || Object.keys(filters).length === 0) {
    return true // No filters means match all
  }

  // Property type filter
  if (filters.property_type && filters.property_type.length > 0) {
    if (!filters.property_type.includes(property.property_type)) {
      return false
    }
  }

  // Listing type filter
  if (filters.listing_type && filters.listing_type.length > 0) {
    if (!filters.listing_type.includes(property.listing_type)) {
      return false
    }
  }

  // Region filter
  if (filters.regions && filters.regions.length > 0) {
    if (!filters.regions.includes(property.region_id)) {
      return false
    }
  }

  // Price range filter (sale)
  if (property.listing_type === 'sale' && property.price_sale) {
    if (filters.price_min && property.price_sale < filters.price_min) {
      return false
    }
    if (filters.price_max && property.price_sale > filters.price_max) {
      return false
    }
  }

  // Price range filter (rent)
  if (property.listing_type === 'rent' && property.price_rent) {
    if (filters.price_min && property.price_rent < filters.price_min) {
      return false
    }
    if (filters.price_max && property.price_rent > filters.price_max) {
      return false
    }
  }

  // Bedrooms filter
  if (filters.bedrooms_min && property.bedrooms < filters.bedrooms_min) {
    return false
  }
  if (filters.bedrooms_max && property.bedrooms > filters.bedrooms_max) {
    return false
  }

  // Bathrooms filter
  if (filters.bathrooms_min && property.bathrooms < filters.bathrooms_min) {
    return false
  }

  // Area filter
  if (filters.area_min && property.area_sqm < filters.area_min) {
    return false
  }
  if (filters.area_max && property.area_sqm > filters.area_max) {
    return false
  }

  // Features filter
  if (filters.features && filters.features.length > 0) {
    const propertyFeatures = property.features || []
    const hasAllFeatures = filters.features.every((feature: string) =>
      propertyFeatures.includes(feature)
    )
    if (!hasAllFeatures) {
      return false
    }
  }

  return true // All filters passed
}

// Send email notification
async function sendEmailNotification(
  user: UserProfile,
  property: any,
  search: SavedSearch
): Promise<void> {
  console.log(`Sending email to ${user.email}`)

  // Use Resend or SendGrid API
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email')
    return
  }

  const propertyUrl = `${Deno.env.get('SITE_URL')}/properties/${property.id}`
  
  const emailHtml = `
    <h2>New Property Match: ${property.title_en}</h2>
    <p>Hi ${user.full_name || 'there'},</p>
    <p>A new property matching your saved search "${search.name}" is now available!</p>
    
    <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
      <h3>${property.title_en}</h3>
      <p><strong>Type:</strong> ${property.property_type}</p>
      <p><strong>Price:</strong> €${property.price_sale?.toLocaleString() || property.price_rent?.toLocaleString()}</p>
      <p><strong>Bedrooms:</strong> ${property.bedrooms} | <strong>Bathrooms:</strong> ${property.bathrooms}</p>
      <p><strong>Area:</strong> ${property.area_sqm} m²</p>
      <p><strong>Location:</strong> ${property.city_en}</p>
    </div>
    
    <p><a href="${propertyUrl}" style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Property</a></p>
    
    <p style="color: #666; font-size: 12px;">
      You're receiving this because you have an active saved search. 
      <a href="${Deno.env.get('SITE_URL')}/account/saved-searches">Manage your alerts</a>
    </p>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Spotlight Real Estate <alerts@spotlight.gr>',
        to: [user.email],
        subject: `New Property: ${property.title_en}`,
        html: emailHtml
      })
    })

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`)
    }

    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Send WhatsApp notification
async function sendWhatsAppNotification(
  user: UserProfile,
  property: any,
  search: SavedSearch
): Promise<void> {
  console.log(`Sending WhatsApp to user ${user.id}`)
  
  // Implement WhatsApp Business API integration
  // Using Twilio or similar service
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
  const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER')
  
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn('Twilio credentials not set, skipping WhatsApp')
    return
  }

  // Get user's phone number from profile
  // For now, we'll skip if not configured
  console.log('WhatsApp notification queued (implement Twilio integration)')
}

// Send Telegram notification
async function sendTelegramNotification(
  user: UserProfile,
  property: any,
  search: SavedSearch
): Promise<void> {
  console.log(`Sending Telegram to user ${user.id}`)
  
  const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
  
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not set, skipping Telegram')
    return
  }

  // Get user's Telegram chat ID from profile
  // For now, we'll skip if not configured
  console.log('Telegram notification queued (implement Telegram Bot API)')
}

