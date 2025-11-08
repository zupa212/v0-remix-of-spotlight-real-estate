# ============================================================================
# Deploy Saved Search Alerts System (PowerShell)
# ============================================================================
# This script deploys the complete alert system to Supabase
# ============================================================================

Write-Host "`n🔔 Deploying Saved Search Alerts System" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Supabase CLI is installed
try {
    $version = supabase --version
    Write-Host "✅ Supabase CLI found: $version`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "   Run: scoop install supabase" -ForegroundColor Yellow
    exit 1
}

# Check if linked to project
$projects = supabase projects list
if ($projects -notmatch "katlwauxbsbrbegpsawk") {
    Write-Host "⚠️  Not linked to Supabase project. Linking now..." -ForegroundColor Yellow
    supabase link --project-ref katlwauxbsbrbegpsawk
}

Write-Host "✅ Linked to project: katlwauxbsbrbegpsawk`n" -ForegroundColor Green

# Deploy Edge Function
Write-Host "📦 Deploying Edge Function: match-properties" -ForegroundColor Cyan
Write-Host "-------------------------------------------" -ForegroundColor Cyan

try {
    supabase functions deploy match-properties --no-verify-jwt
    Write-Host "✅ Edge Function deployed successfully`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Edge Function deployment failed" -ForegroundColor Red
    exit 1
}

# Push database migration
Write-Host "🗄️  Pushing database migration" -ForegroundColor Cyan
Write-Host "----------------------------" -ForegroundColor Cyan
Write-Host "Migration: 20250108000002_saved_search_alerts.sql`n"

# Check if migration exists
if (-not (Test-Path "supabase\migrations\20250108000002_saved_search_alerts.sql")) {
    Write-Host "❌ Migration file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "⚠️  This will modify your database. Continue? (y/n): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

try {
    supabase db push
    Write-Host "✅ Database migration applied successfully`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Database migration failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Green

Write-Host "📋 Next Steps:`n"
Write-Host "1. Configure environment variables:"
Write-Host "   https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/settings/functions`n"
Write-Host "   Required:" -ForegroundColor Yellow
Write-Host "   - RESEND_API_KEY (for email notifications)"
Write-Host "   - SITE_URL (your website URL)`n"
Write-Host "   Optional:" -ForegroundColor Yellow
Write-Host "   - TWILIO_ACCOUNT_SID (for WhatsApp)"
Write-Host "   - TWILIO_AUTH_TOKEN"
Write-Host "   - TWILIO_WHATSAPP_NUMBER"
Write-Host "   - TELEGRAM_BOT_TOKEN (for Telegram)`n"
Write-Host "2. Enable pg_net extension:"
Write-Host "   https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/database/extensions`n"
Write-Host "3. Test the system:"
Write-Host "   - Insert a test property"
Write-Host "   - Check alerts_log table"
Write-Host "   - Verify email received`n"
Write-Host "📚 Full documentation: SAVED_SEARCH_ALERTS_SETUP.md`n"
Write-Host "✅ Your alert system is ready! 🔔`n" -ForegroundColor Green

