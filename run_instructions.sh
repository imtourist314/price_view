#!/bin/bash

set -e


#!/bin/bash
REPO_URL="git@github.com:imtourist314/price_view.git"
WORK_DIR="./"
REPO_NAME=$(basename "$REPO_URL" .git)
REPO_DIR="$WORK_DIR/$REPO_NAME"

BRANCH="aider-$(date +%Y%m%d-%H%M%S)"

aider \
  --env-file /Users/bik/dev/ai/aider/.env \
  --yes \
  --no-auto-commits \
  --message-file ./instructions.md

if git diff --quiet; then
    echo "No changes detected"
    exit 0
fi

git add .

git commit -m "LLM automated changes"

git push -u origin "$BRANCH"

gh pr create \
  --title "LLM Automated Changes" \
  --body-file "generated_pr.md"

