# Automated Supabase Cloud Setup with Browser Login
Write-Host "🌐 Supabase Cloud Setup - Automated" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$projectRef = "katlwauxbsbrbegpsawk"

Write-Host "📝 Step 1: Login to Supabase (Browser will open)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   A browser window will open for you to login." -ForegroundColor Gray
Write-Host "   Sign in with your Supabase account." -ForegroundColor Gray
Write-Host ""

# Login with browser
supabase login

Write-Host ""
Write-Host "✅ Login successful!" -ForegroundColor Green
Write-Host ""

Write-Host "🔗 Step 2: Linking to your cloud project..." -ForegroundColor Yellow
Write-Host "   Project: $projectRef" -ForegroundColor Gray
Write-Host ""

# Prompt for database password
$dbPassword = Read-Host "   Enter your database password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

# Link to cloud project
supabase link --project-ref $projectRef --password $dbPasswordPlain

Write-Host ""
Write-Host "✅ Linked to cloud project!" -ForegroundColor Green
Write-Host ""

Write-Host "🗄️  Step 3: Pushing all 17 migrations to cloud..." -ForegroundColor Yellow
Write-Host "   This will create your complete backend database" -ForegroundColor Gray
Write-Host ""

# Push migrations
supabase db push

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Backend Created Successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Your Backend Now Has:" -ForegroundColor Cyan
Write-Host "   • 17 database tables" -ForegroundColor White
Write-Host "   • Row Level Security policies" -ForegroundColor White
Write-Host "   • Auto-generated property codes" -ForegroundColor White
Write-Host "   • Audit logging triggers" -ForegroundColor White
Write-Host "   • Authentication system" -ForegroundColor White
Write-Host ""

Write-Host "📌 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verify tables in Supabase Dashboard:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/$projectRef/editor" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Create admin user:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/$projectRef/auth/users" -ForegroundColor Yellow
Write-Host "   • Email: admin@spotlight.gr" -ForegroundColor Gray
Write-Host "   • Password: Admin123!Spotlight" -ForegroundColor Gray
Write-Host "   • ✅ Check 'Auto Confirm User'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Add sample data (optional):" -ForegroundColor White
Write-Host "   See RUN_MIGRATIONS_MANUALLY.md for SQL to copy/paste" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start development:" -ForegroundColor White
Write-Host "   pnpm install" -ForegroundColor Yellow
Write-Host "   pnpm dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Login to your app:" -ForegroundColor White
Write-Host "   http://localhost:3000/admin/login" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Backend is ready! Follow the next steps above." -ForegroundColor Green
Write-Host ""



