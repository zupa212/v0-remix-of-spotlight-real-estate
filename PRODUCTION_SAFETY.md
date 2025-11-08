# ⚠️ PRODUCTION SAFETY GUARDS

## 🚨 CRITICAL: Do NOT Run These Commands on Production

### ❌ NEVER RUN:
```bash
# DANGER: Deletes all data!
npm run db:reset

# DANGER: Resets database to migrations only!
supabase db reset
```

---

## ✅ Safe Production Commands:

### Push Migrations (Safe):
```bash
npm run db:push
```
- Only applies new migrations
- Does not delete existing data
- Prompts for confirmation

### Pull Schema (Safe):
```bash
npm run db:pull
```
- Downloads current schema
- Does not modify database
- Creates local migration file

### Generate Types (Safe):
```bash
npm run db:types
```
- Only generates TypeScript types
- Does not modify database
- Safe to run anytime

### Seed Data (Safe if idempotent):
```bash
npm run db:seed
```
- Uses ON CONFLICT DO NOTHING
- Won't create duplicates
- Safe to run multiple times

---

## 🔒 Environment-Based Safety

### Check Current Environment:
```bash
# Check which project you're linked to
supabase projects list

# Verify project ref
cat supabase/config.toml | grep project_id
```

### Production Project Detection:
The project ref `katlwauxbsbrbegpsawk` is your PRODUCTION project.

**Before running ANY command:**
1. Check `supabase projects list`
2. Look for the `LINKED` column
3. Verify you're on the correct project

---

## 🛡️ Safety Scripts

### Safe Reset (Development Only):
```bash
# This script checks environment before resetting
npm run db:reset:safe
```

**Implementation in package.json:**
```json
"db:reset:safe": "node scripts/safe-reset.js"
```

---

## 📋 Pre-Deployment Checklist:

### Before Pushing Migrations:

- [ ] Tested migrations locally (if using Docker)
- [ ] Reviewed SQL for destructive operations
- [ ] Backed up production data (if applicable)
- [ ] Verified project ref is correct
- [ ] Migrations are idempotent (use IF NOT EXISTS)
- [ ] Team is notified of schema changes
- [ ] Downtime window scheduled (if needed)

### Red Flags (Don't Push):

- ❌ `DROP TABLE` without IF EXISTS
- ❌ `DELETE FROM` without WHERE clause
- ❌ `TRUNCATE` statements
- ❌ `ALTER TABLE DROP COLUMN` (data loss)
- ❌ Non-idempotent migrations
- ❌ Migrations that haven't been tested

---

## 🔐 GitHub Secrets Setup:

### Required Secrets:

1. **SB_ACCESS_TOKEN**
   - Go to: https://supabase.com/dashboard/account/tokens
   - Generate new token
   - Copy and add to GitHub Secrets

2. **SB_PROJECT_REF**
   - Value: `katlwauxbsbrbegpsawk`
   - Add to GitHub Secrets

### How to Add Secrets:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add both secrets above

---

## 🎯 Best Practices:

### 1. Use Branches:
```bash
# Never work directly on main
git checkout -b feature/new-migration
# Make changes
git push origin feature/new-migration
# Create PR for review
```

### 2. Review Before Merge:
- All migrations reviewed by team
- Test on staging first
- Use GitHub PR comments for discussion

### 3. Rollback Plan:
- Keep backup of schema before changes
- Document rollback steps in PR
- Test rollback procedure

### 4. Monitor After Deployment:
- Check Supabase logs
- Monitor application errors
- Verify data integrity

---

## 🚨 Emergency Rollback:

### If Something Goes Wrong:

1. **Stop the bleeding:**
   ```bash
   # Revert the migration commit
   git revert <commit-hash>
   git push origin main
   ```

2. **Restore from backup:**
   - Go to Supabase Dashboard
   - Database → Backups
   - Restore to point before migration

3. **Manual fix:**
   - Create a new migration to undo changes
   - Test thoroughly
   - Push to production

---

## 📊 Monitoring:

### Check Migration Status:
```bash
# List applied migrations
supabase migration list

# Check for pending migrations
supabase db push --dry-run
```

### View Database Logs:
- Supabase Dashboard → Logs
- Filter by "database"
- Look for errors or warnings

---

## ✅ Safety Checklist:

- [ ] Never run `db:reset` on production
- [ ] Always verify project ref before commands
- [ ] Use idempotent migrations (IF NOT EXISTS)
- [ ] Test migrations locally first
- [ ] Review all PRs with database changes
- [ ] Have rollback plan ready
- [ ] Monitor after deployment
- [ ] Keep team informed of schema changes

---

## 🔗 Additional Resources:

- **Supabase Migrations Docs:** https://supabase.com/docs/guides/cli/local-development
- **Database Backups:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/database/backups
- **Project Settings:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk/settings/general

---

**Remember: With great power comes great responsibility!** 🦸‍♂️

Always double-check before running database commands in production.

