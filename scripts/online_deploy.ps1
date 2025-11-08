# ============================================================================
# SPOTLIGHT REAL ESTATE - ONE-CLICK ONLINE DEPLOYMENT (PowerShell)
# ============================================================================

$ErrorActionPreference = "Stop"

# Check environment variables
$SB_PROJECT_REF = $env:SB_PROJECT_REF
$SUPABASE_ACCESS_TOKEN = $env:SUPABASE_ACCESS_TOKEN

if (-not $SB_PROJECT_REF) {
    Write-Host "Error: SB_PROJECT_REF not set" -ForegroundColor Red
    Write-Host "Run: `$env:SB_PROJECT_REF = 'katlwauxbsbrbegpsawk'" -ForegroundColor Yellow
    exit 1
}

if (-not $SUPABASE_ACCESS_TOKEN) {
    Write-Host "Error: SUPABASE_ACCESS_TOKEN not set" -ForegroundColor Red
    Write-Host "Run: `$env:SUPABASE_ACCESS_TOKEN = 'your-token'" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "SPOTLIGHT REAL ESTATE - ONE-CLICK DEPLOYMENT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Link
Write-Host "Step 1: Linking to Supabase..." -ForegroundColor Cyan
supabase link --project-ref $SB_PROJECT_REF
Write-Host "Done!`n" -ForegroundColor Green

# Step 2: Push migrations
Write-Host "Step 2: Pushing migrations..." -ForegroundColor Cyan
supabase db push
Write-Host "Done!`n" -ForegroundColor Green

# Step 3: Enable Realtime
Write-Host "Step 3: Enabling Realtime..." -ForegroundColor Cyan
if (Test-Path "supabase\migrations\20250108000001_enable_realtime.sql") {
    Get-Content "supabase\migrations\20250108000001_enable_realtime.sql" | supabase db execute
    Write-Host "Done!`n" -ForegroundColor Green
} else {
    Write-Host "Realtime migration not found, skipping`n" -ForegroundColor Yellow
}

# Step 4: Enable Alerts
Write-Host "Step 4: Enabling Alerts..." -ForegroundColor Cyan
if (Test-Path "supabase\migrations\20250108000002_saved_search_alerts.sql") {
    Get-Content "supabase\migrations\20250108000002_saved_search_alerts.sql" | supabase db execute
    Write-Host "Done!`n" -ForegroundColor Green
} else {
    Write-Host "Alerts migration not found, skipping`n" -ForegroundColor Yellow
}

# Step 5: Seed data
Write-Host "Step 5: Seeding data..." -ForegroundColor Cyan
if (Test-Path "supabase\seed.sql") {
    Get-Content "supabase\seed.sql" | supabase db execute
    Write-Host "Done!`n" -ForegroundColor Green
} else {
    Write-Host "Seed file not found, skipping`n" -ForegroundColor Yellow
}

# Step 6: Deploy functions
Write-Host "Step 6: Deploying Edge Functions..." -ForegroundColor Cyan
if (Test-Path "supabase\functions\match-properties") {
    supabase functions deploy match-properties --no-verify-jwt
    Write-Host "Done!`n" -ForegroundColor Green
} else {
    Write-Host "Function not found, skipping`n" -ForegroundColor Yellow
}

# Step 7: Verify
Write-Host "Step 7: Verifying..." -ForegroundColor Cyan
$verifyContent = @"
SELECT 'regions' as t, count(*) as c FROM public.regions
UNION ALL SELECT 'agents', count(*) FROM public.agents
UNION ALL SELECT 'properties', count(*) FROM public.properties;
"@
$verifyContent | Out-File -FilePath "supabase\verify.sql" -Encoding UTF8
Get-Content "supabase\verify.sql" | supabase db execute
Remove-Item "supabase\verify.sql" -ErrorAction SilentlyContinue
Write-Host ""

# Summary
Write-Host "============================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Green

Write-Host "What was deployed:" -ForegroundColor Cyan
Write-Host "  - All database migrations" -ForegroundColor White
Write-Host "  - Realtime on all tables" -ForegroundColor White
Write-Host "  - Sample data" -ForegroundColor White
Write-Host "  - Edge Functions`n" -ForegroundColor White

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Create admin user" -ForegroundColor White
Write-Host "  2. Configure secrets (RESEND_API_KEY)" -ForegroundColor White
Write-Host "  3. Enable pg_net extension" -ForegroundColor White
Write-Host "  4. Run: npm run dev`n" -ForegroundColor White

Write-Host "Dashboard: https://supabase.com/dashboard/project/$SB_PROJECT_REF`n" -ForegroundColor Cyan
Write-Host "Your Supabase is ready!" -ForegroundColor Green
Write-Host ""
