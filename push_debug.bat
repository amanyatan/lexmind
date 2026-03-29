@echo off
git remote -v > git_remote_out.txt 2>&1
git status >> git_remote_out.txt 2>&1
git push -u origin main >> git_remote_out.txt 2>&1
