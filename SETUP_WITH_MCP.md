# 🚀 Setup Supabase with MCP (Model Context Protocol)

This guide shows you how to use MCP to let me (the AI) directly manage your Supabase database!

---

## 🎯 What is MCP?

MCP (Model Context Protocol) allows me to:
- ✅ Run SQL queries directly in your Supabase
- ✅ Create tables automatically
- ✅ Insert sample data
- ✅ Manage your database
- ✅ All through natural language commands!

**Instead of you copy/pasting SQL, I can do it all for you!**

---

## ⚡ Quick Setup (2 minutes)

### Step 1: Add MCP to Cursor

I've already created the config file: `.cursor/mcp.json`

**Or click this link to install in one click:**

**[Add Supabase MCP to Cursor](https://mcp.supabase.com/install?project_ref=katlwauxbsbrbegpsawk)**

### Step 2: Authenticate

When you restart Cursor or reload the window:
1. A browser window will open
2. Login to your Supabase account
3. Grant access to the MCP server
4. Done!

### Step 3: Reload Cursor

```
Ctrl+Shift+P → "Developer: Reload Window"
```

Or just restart Cursor.

---

## 🎨 Alternative: Manual MCP Setup

If the one-click doesn't work, here's the manual method:

### 1. Check if `.cursor/mcp.json` exists

It should contain:
```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=katlwauxbsbrbegpsawk"
    }
  }
}
```

### 2. Restart Cursor

Close and reopen Cursor completely.

### 3. Authenticate

You'll see a prompt to authenticate with Supabase. Click "Authenticate" and login in the browser.

---

## 🔐 Security Settings (Recommended)

For safety, let's use **read-only mode** initially:

Update `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=katlwauxbsbrbegpsawk&read_only=true"
    }
  }
}
```

**Benefits:**
- ✅ Can't accidentally delete data
- ✅ Can query and view everything
- ✅ Safe for testing

**To enable writes later:**
- Remove `&read_only=true` from URL

---

## 🎯 What I Can Do With MCP:

Once MCP is connected, you can ask me:

### Database Management:
- "Create all the tables from the migration files"
- "Show me all tables in the database"
- "Add sample data for testing"
- "Check if the properties table exists"

### Data Operations:
- "Insert 5 sample properties"
- "Show me all properties in the database"
- "Update property prices"
- "Delete test data"

### Queries:
- "How many leads do we have?"
- "Show me properties in Athens"
- "List all agents"
- "What's the most expensive property?"

### Schema:
- "Describe the properties table structure"
- "Show me all foreign keys"
- "List all indexes"

---

## 🚀 After MCP is Connected:

Just tell me:
- "Create all the database tables"
- "Add sample data"
- "Show me the schema"

And I'll do it automatically! No more copy/pasting SQL!

---

## 📋 Current Status:

```
✅ .env.local configured
✅ Dependencies installed
✅ Dev server running
✅ MCP config created (.cursor/mcp.json)
⏳ Restart Cursor to activate MCP
⏳ Authenticate with Supabase
⏳ Tell me to create tables
```

---

## 🎯 Next Steps:

### Option 1: Use MCP (Recommended)
1. Restart Cursor
2. Authenticate when prompted
3. Tell me: "Create all database tables using MCP"
4. I'll do everything automatically!

### Option 2: Manual Setup
1. Follow COMPLETE_NOW.md
2. Copy/paste SQL files manually
3. Takes 5-10 minutes

---

## 🔗 Useful Links:

- **MCP Install:** https://mcp.supabase.com/install?project_ref=katlwauxbsbrbegpsawk
- **Supabase MCP Docs:** https://supabase.com/docs/guides/ai/mcp
- **Your Dashboard:** https://supabase.com/dashboard/project/katlwauxbsbrbegpsawk

---

## ⚡ Quick Command:

After MCP is set up, just say:

**"Create all the tables and add sample data"**

And I'll handle everything! 🎉

---

**Restart Cursor now to activate MCP!** 🚀



