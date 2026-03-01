#!/bin/bash

set -e


#!/bin/bash
REPO_URL="git@github.com:imtourist314/price_view.git"
WORK_DIR="./"
REPO_NAME=$(basename "$REPO_URL" .git)
REPO_DIR="$WORK_DIR/$REPO_NAME"

BRANCH="aider-$(date +%Y%m%d-%H%M%S)"

INSTRUCTIONS="./instructions.md"
if [[ "$1" ]];then
   INSTRUCTIONS=$1
fi

echo "Getting instructions from $INSTRUCTIONS file"

aider \
  --env-file /Users/bik/dev/ai/aider/.env \
  --yes \
  --no-auto-commits \
  --message-file "$INSTRUCTIONS"

