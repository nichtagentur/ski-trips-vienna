#!/bin/bash
# Publish new articles to the ski blog
cd "$(dirname "$0")/.."

echo "Adding new content..."
git add src/posts/ src/images/
git add -A

echo "Committing..."
git commit -m "Add blog content $(date +%Y-%m-%d)"

echo "Pushing to GitHub..."
git push origin main

echo ""
echo "Published! GitHub Actions will deploy in ~2 minutes."
echo "Check: https://nichtagentur.github.io/ski-trips-vienna/"
