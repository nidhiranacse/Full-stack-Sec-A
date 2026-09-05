@echo off
echo Setting up Django environment...

python -m venv venv
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo Django environment setup completed successfully.
pause