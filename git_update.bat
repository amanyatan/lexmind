@echo off
git add .
git commit -m "Fix black screen on production by preventing fatal crash on missing environment variables"
git push -f origin main
