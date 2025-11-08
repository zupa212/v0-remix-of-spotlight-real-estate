# Connect to Supabase Cloud and Push Migrations
Write-Host "Connecting to Supabase Cloud..." -ForegroundColor Cyan

$projectRef = "katlwauxbsbrbegpsawk"

Write-Host "`nStep 1: Browser login (window will open)..." -ForegroundColor Yellow
supabase login

Write-Host "`nStep 2: Enter your database password when prompted..." -ForegroundColor Yellow
supabase link --project-ref $projectRef

Write-Host "`nStep 3: Pushing migrations..." -ForegroundColor Yellow
supabase db push

Write-Host "`nDone! Check your Supabase dashboard to verify tables." -ForegroundColor Green
Write-Host "Next: Create admin user at https://supabase.com/dashboard/project/$projectRef/auth/users" -ForegroundColor Cyan



