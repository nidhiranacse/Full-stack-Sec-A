@echo off
echo ========================================================
echo Pushing Rahul Raj Lab Submissions to GitHub
echo Repository: https://github.com/cu24250116-png/Full-stack-Sec-A
echo ========================================================
set PATH=C:\Users\rahul\MinGit\cmd;%PATH%
cd /d "C:\Users\rahul\.gemini\antigravity-ide\scratch\repo_fullstack"
git push -u origin main
git push -u origin rahul-raj
echo.
echo ========================================================
echo Done! Please visit https://github.com/cu24250116-png/Full-stack-Sec-A
echo to create a Pull Request to your mentor's repository:
echo https://github.com/nidhiranacse/Full-stack-Sec-A
echo ========================================================
pause
