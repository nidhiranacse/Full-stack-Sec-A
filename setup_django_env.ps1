# Windows PowerShell version of setup_django_env.sh
param([string]$Project = "mysite")
python --version
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install "Django>=4.2,<5.3" flake8 autopep8 python-dotenv
pip freeze | Out-File -Encoding utf8 requirements.txt
if (-not (Test-Path $Project)) { django-admin startproject $Project . }
Write-Host "Done. Run: python manage.py runserver"
