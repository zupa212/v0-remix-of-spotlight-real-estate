#!/bin/bash

# Supabase CLI Setup Script for Spotlight Real Estate
# This script automates the Supabase CLI setup process

set -e  # Exit on error

echo "🚀 Spotlight Real Estate - Supabase CLI Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Check if Supabase CLI is installed
echo "🔧 Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
    echo -e "${GREEN}✓ Supabase CLI installed${NC}"
else
    echo -e "${GREEN}✓ Supabase CLI is installed ($(supabase --version))${NC}"
fi
echo ""

# Initialize Supabase if not already initialized
if [ ! -d "supabase" ]; then
    echo "🎯 Initializing Supabase..."
    supabase init
    echo -e "${GREEN}✓ Supabase initialized${NC}"
else
    echo -e "${GREEN}✓ Supabase already initialized${NC}"
fi
echo ""

# Create migrations directory if it doesn't exist
mkdir -p supabase/migrations

# Copy and rename migration files
echo "📋 Setting up migrations..."
if [ -d "scripts" ]; then
    counter=1
    for file in scripts/*.sql; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            new_name=$(printf "20240101%06d_%s" $counter "$filename")
            cp "$file" "supabase/migrations/$new_name"
            echo "  ✓ Copied $filename → $new_name"
            ((counter++))
        fi
    done
    echo -e "${GREEN}✓ All migrations copied${NC}"
else
    echo -e "${YELLOW}⚠️  scripts/ directory not found. Skipping migration copy.${NC}"
fi
echo ""

# Start Supabase
echo "🚀 Starting Supabase (this may take 2-5 minutes on first run)..."
supabase start

echo ""
echo -e "${GREEN}✓ Supabase is running!${NC}"
echo ""

# Get the credentials
echo "📝 Your Supabase credentials:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
supabase status | grep -E "API URL|anon key|Studio URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📄 Creating .env.local file..."
    
    API_URL=$(supabase status | grep "API URL" | awk '{print $3}')
    ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')
    
    cat > .env.local << EOF
# Supabase Local Configuration
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY

# Production Supabase (uncomment when deploying)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
EOF
    
    echo -e "${GREEN}✓ .env.local created${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local already exists. Please update it manually if needed.${NC}"
fi
echo ""

# Apply migrations
echo "🗄️  Applying database migrations..."
supabase db reset
echo -e "${GREEN}✓ Migrations applied${NC}"
echo ""

# Create admin user
echo "👤 Creating admin user..."
ADMIN_EMAIL="admin@spotlight.gr"
ADMIN_PASSWORD="Admin123!Spotlight"

supabase db shell << EOF
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
  '$ADMIN_EMAIL',
  crypt('$ADMIN_PASSWORD', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;
EOF

echo -e "${GREEN}✓ Admin user created${NC}"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 Next Steps:"
echo ""
echo "1. Start your development server:"
echo "   ${YELLOW}pnpm dev${NC}"
echo ""
echo "2. Open Supabase Studio:"
echo "   ${YELLOW}http://localhost:54323${NC}"
echo ""
echo "3. Login to admin panel:"
echo "   URL: ${YELLOW}http://localhost:3000/admin/login${NC}"
echo "   Email: ${YELLOW}$ADMIN_EMAIL${NC}"
echo "   Password: ${YELLOW}$ADMIN_PASSWORD${NC}"
echo ""
echo "4. View your app:"
echo "   ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Useful Commands:"
echo "   ${YELLOW}supabase status${NC}      - Check Supabase status"
echo "   ${YELLOW}supabase stop${NC}        - Stop Supabase"
echo "   ${YELLOW}supabase start${NC}       - Start Supabase"
echo "   ${YELLOW}supabase db reset${NC}    - Reset database"
echo ""
echo "📚 Documentation:"
echo "   See SUPABASE_CLI_SETUP.md for detailed instructions"
echo ""

