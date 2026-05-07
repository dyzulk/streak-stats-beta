# GitHub Personal Access Token (PAT) Guide

## Overview

**GitHub Personal Access Token (PAT)** adalah cara aman untuk authenticate dengan GitHub API tanpa menggunakan password. Streak Forge menggunakannya untuk mengakses GitHub user data.

---

## 🔑 Scopes yang Diperlukan

### Minimum Required Scopes

| Scope | Purpose | Why Needed | Read/Write |
|-------|---------|-----------|-----------|
| `read:user` | Read user profile info | Get username, public profile | 🔒 Read |
| `public_repo` | Access public repos | Fetch public contribution data | 🔒 Read |

### Optional Scopes

| Scope | Purpose | Use Case |
|-------|---------|----------|
| `user:email` | Read email addresses | If needing user's primary email | 🔒 Read |

### ❌ NOT Needed Scopes

These scopes are **NOT** required:
- `repo` - Full repository control (way too permissive)
- `admin:repo_hook` - Manage webhooks (not needed)
- `gist` - Access gists (not needed)
- `delete_repo` - Delete repositories (security risk)
- Any write/delete permissions (we only read)

---

## ⚠️ Token Types: Which One to Use?

### Option 1: Classic Personal Access Token (RECOMMENDED) ✅

```
Good for: Streak Forge (our use case)
How to create: https://github.com/settings/tokens
```

**Pros**:
- ✅ Works everywhere
- ✅ Simple to use
- ✅ Better compatibility

**Cons**:
- ⚠️ Less granular permissions

### Option 2: Fine-grained Personal Access Token ❌

```
NOT recommended for Streak Forge
How to create: https://github.com/settings/personal-access-tokens/new
```

**Cons**:
- ❌ More complex setup
- ❌ GitHub API compatibility issues
- ❌ Repository-specific scoping (not needed here)

**Use Case**: Better for GitHub Actions, enterprise environments

---

## 📋 Step-by-Step: Creating a Token

### Step 1: Go to GitHub Settings
```
https://github.com/settings/tokens
```

### Step 2: Click "Generate new token"
![Generate Token](https://i.imgur.com/xxx.png)
- Choose: **"Generate new token (classic)"**

### Step 3: Token Settings

| Field | Value | Example |
|-------|-------|---------|
| **Token name** | Descriptive name | `Streak Forge API` |
| **Expiration** | 90-180 days | `90 days` |
| **Scopes** | See below | ✅ `read:user`, `public_repo` |

### Step 4: Select Scopes

**Check these boxes ONLY**:
- ✅ `read:user` (read public/private user info)
- ✅ `public_repo` (read public repos)

**Leave unchecked**:
- ❌ `repo` 
- ❌ `gist`
- ❌ `delete_repo`
- ❌ All write/admin scopes

### Step 5: Generate & Copy

1. Click **"Generate token"**
2. Copy the token (starts with `ghp_`)
3. Store securely (you can't see it again!)

### Step 6: Add to Your Project

**Development**:
```bash
# Create .env.local
echo "GITHUB_TOKEN=ghp_xxxxxxxxxxxxx" > .env.local
```

**Production (Cloudflare)**:
```bash
wrangler secret put GITHUB_TOKEN
# Paste token when prompted
```

---

## 📊 Rate Limits

### Without Token
```
60 requests/hour per IP address
```
❌ Too low for production use

### With Token
```
5000 requests/hour per authenticated user
```
✅ Sufficient for most use cases

### Rate Limit Header
```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1620000000
```

---

## 🔐 Security Best Practices

### DO ✅
- ✅ Use **Classic** Personal Access Token
- ✅ Set expiration (90-180 days recommended)
- ✅ Only request necessary scopes
- ✅ Request **READ** permissions only
- ✅ Store in `.env.local` (git-ignored)
- ✅ Use `wrangler secret` for production
- ✅ Rotate tokens regularly
- ✅ Name tokens descriptively

### DON'T ❌
- ❌ Use Fine-grained tokens (compatibility issues)
- ❌ Set no expiration
- ❌ Request `repo` scope (too permissive)
- ❌ Request write/delete permissions
- ❌ Commit `.env.local` to git
- ❌ Share token in public repos
- ❌ Use same token for multiple projects
- ❌ Keep expired tokens in project

---

## 🚨 If Token is Exposed

### Immediate Actions:

1. **Delete immediately**
   ```
   https://github.com/settings/tokens
   → Find token → Delete
   ```

2. **Create new token**
   ```
   Follow steps in "Creating a Token" section above
   ```

3. **Update your project**
   ```bash
   # Development
   echo "GITHUB_TOKEN=ghp_new_token" > .env.local
   
   # Production
   wrangler secret put GITHUB_TOKEN
   ```

4. **Review recent activity**
   ```
   GitHub Settings → Security → Sessions
   https://github.com/settings/security-log
   ```

---

## 🔗 API Endpoints Using Token

### Getting User Data
```bash
curl -H "Authorization: token ghp_xxxxx" \
  https://api.github.com/users/{username}
```

### Rate Limit Check
```bash
curl -H "Authorization: token ghp_xxxxx" \
  https://api.github.com/rate_limit
```

### Response Example
```json
{
  "rate": {
    "limit": 5000,
    "remaining": 4998,
    "reset": 1620000000
  }
}
```

---

## 🐛 Troubleshooting

### Problem: "Bad credentials"
```
❌ Solution: Token is invalid or expired
→ Create new token (follow "Creating a Token" section)
```

### Problem: "API rate limit exceeded"
```
❌ Solution: Not using token OR token is read-only
→ Verify GITHUB_TOKEN in .env.local
→ Check token has read:user scope
```

### Problem: "Repository access denied"
```
❌ Solution: Token is revoked or expired
→ Check token at https://github.com/settings/tokens
→ Regenerate if needed
```

### Problem: Token not being used in production
```
❌ Solution: Not set in Cloudflare secrets
→ Run: wrangler secret put GITHUB_TOKEN
→ Enter token when prompted
```

---

## 📚 References

- [GitHub Docs: Creating PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub REST API Authentication](https://docs.github.com/en/rest/authentication/authenticating-with-the-rest-api)
- [GitHub Scopes Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)
- [Rate Limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)

---

## ✅ Checklist: Token Setup

- [ ] Created GitHub Classic PAT
- [ ] Selected `read:user` scope
- [ ] Selected `public_repo` scope
- [ ] Set expiration (90-180 days)
- [ ] Copied token safely
- [ ] Added to `.env.local` (development)
- [ ] Added to `wrangler secret` (production)
- [ ] Verified `.env.local` is in `.gitignore`
- [ ] Tested API with token
- [ ] Documented token location securely

---

## 🎯 Summary

| Aspect | Value |
|--------|-------|
| **Token Type** | Classic Personal Access Token |
| **Scopes Needed** | `read:user`, `public_repo` |
| **Scopes to Avoid** | `repo`, write/delete permissions |
| **Rate Limit** | 5000 req/hour (with token) |
| **Expiration** | 90-180 days recommended |
| **Storage** | `.env.local` (development), secrets (production) |
| **Permissions** | Read-only (no writes/deletes) |

---

**Remember**: A token is only as secure as where you store it! 🔐
