# 🔄 Database Sync Guide

## ✅ Auto-Sync Watcher Configured!

Your project now has automatic database synchronization with Supabase Cloud.

---

## 📋 Available Commands:

### `npm run db:push`
Push new migrations to the remote database.

```bash
npm run db:push
```

- Pushes all new migrations in `supabase/migrations/`
- Prompts for confirmation before applying
- Shows which migrations will be applied

### `npm run db:watch` ⭐
**Auto-push migrations on every save!**

```bash
npm run db:watch
```

- Watches `supabase/**/*.sql` for changes
- Automatically runs `db:push` when you save a SQL file
- Perfect for development workflow
- Keep this running in a separate terminal

**Output:**
```
Watching migrations… Cloud is in sync on every save.
```

### `npm run db:pull`
Pull schema changes from the remote database.

```bash
npm run db:pull
```

- Downloads current schema from cloud
- Creates a new migration file
- Useful when changes are made via Supabase Dashboard

### `npm run db:types`
Generate TypeScript types from your database schema.

```bash
npm run db:types
```

- Creates `lib/database.types.ts`
- Provides full type safety for Supabase queries
- Run after schema changes

### `npm run db:reset` ⚠️
Reset local database to current migrations.

```bash
npm run db:reset
```

- **WARNING:** Deletes all local data!
- Only affects local Docker database
- Does NOT affect cloud database
- See safety guards below

---

## 🚀 Recommended Workflow:

### Development Mode:

1. **Terminal 1:** Run the dev server
   ```bash
   npm run dev
   ```

2. **Terminal 2:** Run the DB watcher
   ```bash
   npm run db:watch
   ```

3. **Edit SQL files** in `supabase/migrations/`
   - Save the file
   - Watcher automatically pushes to cloud
   - Changes are live immediately!

4. **Generate types** after schema changes
   ```bash
   npm run db:types
   ```

---

## 📁 Migration Workflow:

### Creating a New Migration:

1. **Create the file:**
   ```bash
   # Format: YYYYMMDDHHMMSS_description.sql
   supabase/migrations/20250108120000_add_new_feature.sql
   ```

2. **Write your SQL:**
   ```sql
   -- Add a new column
   ALTER TABLE properties ADD COLUMN IF NOT EXISTS new_field TEXT;
   
   -- Create an index
   CREATE INDEX IF NOT EXISTS idx_properties_new_field 
   ON properties(new_field);
   ```

3. **Save the file**
   - If watcher is running: ✅ Auto-pushed!
   - If not: Run `npm run db:push`

4. **Generate types:**
   ```bash
   npm run db:types
   ```

---

## 🎯 Best Practices:

### ✅ DO:
- Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
- Test migrations locally first (if using Docker)
- Keep migrations small and focused
- Use descriptive migration names
- Run `db:types` after schema changes
- Use the watcher during active development

### ❌ DON'T:
- Don't edit old migrations (create new ones)
- Don't run `db:reset` on production
- Don't commit sensitive data in migrations
- Don't skip migration testing
- Don't push breaking changes without coordination

---

## 🔍 Troubleshooting:

### Watcher not working?
```bash
# Check if chokidar-cli is installed
npm list chokidar-cli

# Reinstall if needed
npm install --save-dev chokidar-cli --legacy-peer-deps
```

### Migration conflicts?
```bash
# Pull latest schema from cloud
npm run db:pull

# Review the generated migration
# Resolve conflicts manually
# Push again
npm run db:push
```

### Types out of sync?
```bash
# Regenerate types
npm run db:types

# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

## 📊 Monitoring:

### Check Migration Status:
```bash
# List applied migrations
supabase migration list

# Check remote database
supabase db remote list
```

### View Logs:
```bash
# Enable debug mode
supabase db push --debug
```

---

## 🔗 Related Commands:

```bash
# Link to project
supabase link --project-ref katlwauxbsbrbegpsawk

# Check link status
supabase projects list

# View config
cat supabase/config.toml

# Generate migration from diff
supabase db diff --schema public
```

---

## ✅ Setup Checklist:

- [x] Supabase CLI installed
- [x] Project linked to cloud
- [x] chokidar-cli installed
- [x] Scripts added to package.json
- [x] Migrations folder exists
- [ ] Watcher running (`npm run db:watch`)
- [ ] Types generated (`npm run db:types`)

---

**Start the watcher now and enjoy automatic sync!** 🚀

```bash
npm run db:watch
```

