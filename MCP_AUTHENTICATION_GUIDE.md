# 🔐 MCP Authentication Guide

The MCP server is configured but needs authentication. Here's how to activate it:

---

## 🎯 Method 1: One-Click Install (Easiest)

**Click this link in your browser:**

**https://mcp.supabase.com/install?project_ref=katlwauxbsbrbegpsawk**

This will:
1. Open authentication page
2. Ask you to login to Supabase
3. Grant access to Cursor
4. Automatically configure MCP

After clicking, come back to Cursor and the MCP server should be active.

---

## 🎯 Method 2: Manual Token Authentication

If the above doesn't work, use a Personal Access Token:

### Step 1: Create Personal Access Token

1. Go to: **https://supabase.com/dashboard/account/tokens**
2. Click **"Generate new token"**
3. Name it: `Cursor MCP Token`
4. Select scopes:
   - ✅ All (for full access)
   - Or select specific scopes you need
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Update MCP Config

Update `.cursor/mcp.json` with your token:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=katlwauxbsbrbegpsawk",
      "headers": {
        "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
      }
    }
  }
}
```

### Step 3: Reload Cursor

- Press `Ctrl+Shift+P`
- Type "Developer: Reload Window"
- Press Enter

---

## 🎯 Method 3: Environment Variable

Set the token as an environment variable:

```powershell
# In PowerShell
$env:SUPABASE_ACCESS_TOKEN = "your-token-here"

# Then restart Cursor from that PowerShell window
cursor .
```

Update `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=katlwauxbsbrbegpsawk",
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

---

## ✅ Verify MCP is Working

After authentication, I should be able to:
- List your Supabase tables
- Run queries
- Create tables
- Insert data

**Test by asking me:** "List all tables in my Supabase database"

If I can respond with table names, MCP is working!

---

## 🚨 If MCP Still Doesn't Work:

**No problem!** We can proceed without MCP using the manual method:

### Quick Alternative: I'll Create a Combined SQL File

I can create ONE big SQL file with all migrations combined, so you only need to:
1. Copy once
2. Paste once
3. Run once
4. Done!

**Want me to create the combined SQL file?** Just say "create combined SQL file" and I'll make it for you.

---

## 🎯 Current Options:

### Option A: MCP (Automated)
1. Click: https://mcp.supabase.com/install?project_ref=katlwauxbsbrbegpsawk
2. Authenticate
3. Reload Cursor
4. Tell me: "Create all tables with MCP"

### Option B: Combined SQL (Fast)
1. I create one big SQL file
2. You copy/paste once in SQL Editor
3. Click Run once
4. Done!

### Option C: Individual Files (Most Control)
1. Run each of 17 files separately
2. See COMPLETE_NOW.md

---

**Which method do you prefer?** 

Or just say **"create combined SQL"** and I'll make it right now! 🚀


