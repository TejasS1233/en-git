# 🚀 Auto-Update Your en-git Stats

Add this workflow to your repo and your stats update automatically on every push.

## Setup (2 minutes)

### 1. Get Your Token
Visit [en-git.vercel.app/settings](https://en-git.vercel.app/settings) and copy your webhook token.

### 2. Add to GitHub
- Go to your repo → **Settings** → **Secrets** → **Actions**
- Click **New repository secret**
- Name: `ENGIT_TOKEN`
- Value: *paste your token*
- Save

### 3. Create Workflow File
Create `.github/workflows/engit-stats.yml`:

```yaml
name: Update en-git Stats

on:
  push:
    branches: [main, master]

jobs:
  update-stats:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST https://en-git.vercel.app/api/v1/webhook/refresh-stats \
            -H "Content-Type: application/json" \
            -d '{"username":"${{ github.actor }}","token":"${{ secrets.ENGIT_TOKEN }}"}'
```

### 4. Push
```bash
git add .github/workflows/engit-stats.yml
git commit -m "Add en-git auto-update"
git push
```

Done! Your stats now update automatically. View them at `en-git.vercel.app/stats/YOUR_USERNAME`

---

**Need help?** [Open an issue](https://github.com/TejasS1233/en-git/issues)
