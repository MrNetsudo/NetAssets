#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "  Push FortiGate Inventory Dashboard to GitHub"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "First, create a new repository on GitHub:"
echo "  1. Go to: https://github.com/new"
echo "  2. Repository name: firemon (or your choice)"
echo "  3. Make it Public or Private"
echo "  4. Do NOT initialize with README, .gitignore, or license"
echo "  5. Click 'Create repository'"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Prompt for GitHub username
read -p "Enter your GitHub username: " github_user

# Prompt for repository name
read -p "Enter repository name (default: firemon): " repo_name
repo_name=${repo_name:-firemon}

# Construct the repository URL
repo_url="https://github.com/${github_user}/${repo_name}.git"

echo ""
echo "Repository URL: $repo_url"
echo ""
read -p "Is this correct? (y/n): " confirm

if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo "Aborted. Please run the script again."
    exit 1
fi

echo ""
echo "Setting up remote and pushing to GitHub..."
echo ""

# Add remote
git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"

# Rename branch to main
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "  SUCCESS! Your project is now on GitHub!"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "View your repository at:"
    echo "  https://github.com/${github_user}/${repo_name}"
    echo ""
    echo "Clone URL:"
    echo "  $repo_url"
    echo ""
else
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "  Push failed! Please check the error above."
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "Common issues:"
    echo "  - Repository doesn't exist on GitHub yet"
    echo "  - Incorrect username or repository name"
    echo "  - Need to authenticate (use personal access token)"
    echo ""
    exit 1
fi
