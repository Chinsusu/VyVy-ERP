---
description: How to push commits to GitHub
---

# Push to GitHub

## Steps

// turbo
1. Start ssh-agent and add key:
```bash
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519
```

// turbo
2. Push to GitHub:
```bash
cd /opt/VyVy-ERP && git push origin main
```
