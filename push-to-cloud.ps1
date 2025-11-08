# Push Migrations to Supabase Cloud
# Run this after you've created your cloud project and linked it

Write-Host "🌐 Pushing Migrations to Supabase Cloud" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "📝 Step 1: Login to Supabase..." -ForegroundColor Yellow
Write-Host "   Running: supabase login" -ForegroundColor Gray
Write-Host ""
supabase login

Write-Host ""
Write-Host "🔗 Step 2: Link to your cloud project..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   You'll need your Project Reference ID" -ForegroundColor Gray
Write-Host "   Find it in: Supabase Dashboard → Settings → General → Reference ID" -ForegroundColor Gray
Write-Host ""
$projectRef = Read-Host "   Enter your Project Reference ID"

Write-Host ""
Write-Host "   Linking to project: $projectRef" -ForegroundColor Gray
supabase link --project-ref $projectRef

Write-Host ""
Write-Host "🗄️  Step 3: Pushing migrations..." -ForegroundColor Yellow
Write-Host "   This will create all 17 tables in your cloud database" -ForegroundColor Gray
Write-Host ""
supabase db push

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Migrations Pushed to Cloud!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verify tables in Supabase Dashboard:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/$projectRef/editor" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Create admin user:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/$projectRef/auth/users" -ForegroundColor Yellow
Write-Host "   Email: admin@spotlight.gr" -ForegroundColor Gray
Write-Host "   Password: Admin123!Spotlight" -ForegroundColor Gray
Write-Host "   Auto Confirm: ✅ YES" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Create .env.local with your credentials" -ForegroundColor White
Write-Host ""
Write-Host "4. Start development:" -ForegroundColor White
Write-Host "   pnpm dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

