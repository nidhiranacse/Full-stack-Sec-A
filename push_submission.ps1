# PowerShell script to push Rahul Raj's submission to GitHub
$env:PATH = "C:\Users\rahul\MinGit\cmd;" + $env:PATH
Set-Location -Path "C:\Users\rahul\.gemini\antigravity-ide\scratch\repo_fullstack"

Write-Host "Pushing main branch to origin..." -ForegroundColor Cyan
& "C:\Users\rahul\MinGit\cmd\git.exe" push -u origin main

Write-Host "Pushing rahul-raj branch to origin..." -ForegroundColor Cyan
& "C:\Users\rahul\MinGit\cmd\git.exe" push -u origin rahul-raj

Write-Host "`nSuccessfully pushed! Next step: Create a Pull Request to your teacher repository:" -ForegroundColor Green
Write-Host "Teacher Repository: https://github.com/nidhiranacse/Full-stack-Sec-A" -ForegroundColor Yellow
