#!/usr/bin/env zsh
set -euo pipefail

# Determine repository name from package.json (fallback to directory name)
if command -v node >/dev/null 2>&1; then
  REPO_NAME=$(node -e "console.log(require('./package.json').name || '')" 2>/dev/null || echo "")
else
  REPO_NAME=""
fi
if [[ -z "$REPO_NAME" ]]; then
  REPO_NAME="${PWD:t}"
fi

# Ensure default branch is 'main'
git branch -M main

# If a remote named 'origin' already exists, just push
if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote 'origin' already configured."
  echo "Pushing current branch to GitHub..."
  git push -u origin main
  exit 0
fi

# If GitHub CLI is available, create the repo and push
if command -v gh >/dev/null 2>&1; then
  echo "Creating GitHub repo '$REPO_NAME' with GitHub CLI and pushing..."
  gh repo create "$REPO_NAME" --public --source . --remote origin --push
  exit 0
fi

# Fallback instructions if GitHub CLI isn't installed
echo "GitHub CLI (gh) not found and no 'origin' remote configured."
echo "1) Create a repository named '$REPO_NAME' at: https://github.com/new"
echo "2) Then run:"
echo "   git remote add origin https://github.com/<your-username>/$REPO_NAME.git"
echo "   git push -u origin main"
