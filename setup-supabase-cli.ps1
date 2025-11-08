# Supabase CLI Setup Script for Spotlight Real Estate (Windows PowerShell)
# This script automates the Supabase CLI setup process

$ErrorActionPreference = "Stop"

Write-Host "🚀 Spotlight Real Estate - Supabase CLI Setup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "📦 Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "🔧 Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "✓ Supabase CLI is installed ($supabaseVersion)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Supabase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g supabase
    Write-Host "✓ Supabase CLI installed" -ForegroundColor Green
}
Write-Host ""

# Initialize Supabase if not already initialized
if (-not (Test-Path "supabase")) {
    Write-Host "🎯 Initializing Supabase..." -ForegroundColor Yellow
    supabase init
    Write-Host "✓ Supabase initialized" -ForegroundColor Green
} else {
    Write-Host "✓ Supabase already initialized" -ForegroundColor Green
}
Write-Host ""

# Create migrations directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "supabase\migrations" | Out-Null

# Copy and rename migration files
Write-Host "📋 Setting up migrations..." -ForegroundColor Yellow
if (Test-Path "scripts") {
    $counter = 1
    Get-ChildItem "scripts\*.sql" | ForEach-Object {
        $newName = "20240101{0:D6}_{1}" -f $counter, $_.Name
        Copy-Item $_.FullName "supabase\migrations\$newName"
        Write-Host "  ✓ Copied $($_.Name) → $newName" -ForegroundColor Gray
        $counter++
    }
    Write-Host "✓ All migrations copied" -ForegroundColor Green
} else {
    Write-Host "⚠️  scripts\ directory not found. Skipping migration copy." -ForegroundColor Yellow
}
Write-Host ""

# Start Supabase
Write-Host "🚀 Starting Supabase (this may take 2-5 minutes on first run)..." -ForegroundColor Yellow
supabase start

Write-Host ""
Write-Host "✓ Supabase is running!" -ForegroundColor Green
Write-Host ""

# Get the credentials
Write-Host "📝 Your Supabase credentials:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
$status = supabase status
$status | Select-String "API URL|anon key|Studio URL"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "📄 Creating .env.local file..." -ForegroundColor Yellow
    
    $apiUrl = ($status | Select-String "API URL").ToString().Split()[-1]
    $anonKey = ($status | Select-String "anon key").ToString().Split()[-1]
    
    $envContent = @"
# Supabase Local Configuration
NEXT_PUBLIC_SUPABASE_URL=$apiUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey

# Production Supabase (uncomment when deploying)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✓ .env.local created" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local already exists. Please update it manually if needed." -ForegroundColor Yellow
}
Write-Host ""

# Apply migrations
Write-Host "🗄️  Applying database migrations..." -ForegroundColor Yellow
supabase db reset
Write-Host "✓ Migrations applied" -ForegroundColor Green
Write-Host ""

# Create admin user
Write-Host "👤 Creating admin user..." -ForegroundColor Yellow
$adminEmail = "admin@spotlight.gr"
$adminPassword = "Admin123!Spotlight"

$sqlCommand = @"
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  '$adminEmail',
  crypt('$adminPassword', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;
"@

$sqlCommand | supabase db shell

Write-Host "✓ Admin user created" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start your development server:"
Write-Host "   pnpm dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Open Supabase Studio:"
Write-Host "   http://localhost:54323" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Login to admin panel:"
Write-Host "   URL: http://localhost:3000/admin/login" -ForegroundColor Yellow
Write-Host "   Email: $adminEmail" -ForegroundColor Yellow
Write-Host "   Password: $adminPassword" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. View your app:"
Write-Host "   http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Useful Commands:" -ForegroundColor Cyan
Write-Host "   supabase status      - Check Supabase status" -ForegroundColor Yellow
Write-Host "   supabase stop        - Stop Supabase" -ForegroundColor Yellow
Write-Host "   supabase start       - Start Supabase" -ForegroundColor Yellow
Write-Host "   supabase db reset    - Reset database" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   See SUPABASE_CLI_SETUP.md for detailed instructions"
Write-Host ""

