#!/bin/bash

# ============================================================================
# Deploy Saved Search Alerts System
# ============================================================================
# This script deploys the complete alert system to Supabase
# ============================================================================

set -e  # Exit on error

echo "🔔 Deploying Saved Search Alerts System"
echo "========================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "   Run: scoop install supabase (Windows) or brew install supabase/tap/supabase (Mac)"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if linked to project
if ! supabase projects list | grep -q "katlwauxbsbrbegpsawk"; then
    echo "⚠️  Not linked to Supabase project. Linking now..."
    supabase link --project-ref katlwauxbsbrbegpsawk
fi

echo "✅ Linked to project: katlwauxbsbrbegpsawk"
echo ""

# Deploy Edge Function
echo "📦 Deploying Edge Function: match-properties"
echo "-------------------------------------------"
supabase functions deploy match-properties --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully"
else
    echo "❌ Edge Function deployment failed"
    exit 1
fi

echo ""

# Push database migration
echo "🗄️  Pushing database migration"
echo "----------------------------"
echo "Migration: 20250108000002_saved_search_alerts.sql"
echo ""

# Check if migration exists
if [ ! -f "supabase/migrations/20250108000002_saved_search_alerts.sql" ]; then
    echo "❌ Migration file not found!"
    exit 1
fi

echo "⚠️  This will modify your database. Continue? (y/n)"
read -r response
if [[ "$response" != "y" ]]; then
    echo "Deployment cancelled."
    exit 0
fi

supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Database migration applied successfully"
else
    echo "❌ Database migration failed"
    exit 1
fi

echo ""
echo "============================================"
echo "🎉 Deployment Complete!"
echo "============================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure environment variables:"
echo "   https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/settings/functions"
echo ""
echo "   Required:"
echo "   - RESEND_API_KEY (for email notifications)"
echo "   - SITE_URL (your website URL)"
echo ""
echo "   Optional:"
echo "   - TWILIO_ACCOUNT_SID (for WhatsApp)"
echo "   - TWILIO_AUTH_TOKEN"
echo "   - TWILIO_WHATSAPP_NUMBER"
echo "   - TELEGRAM_BOT_TOKEN (for Telegram)"
echo ""
echo "2. Enable pg_net extension:"
echo "   https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/database/extensions"
echo ""
echo "3. Test the system:"
echo "   - Insert a test property"
echo "   - Check alerts_log table"
echo "   - Verify email received"
echo ""
echo "📚 Full documentation: SAVED_SEARCH_ALERTS_SETUP.md"
echo ""
echo "✅ Your alert system is ready! 🔔"

