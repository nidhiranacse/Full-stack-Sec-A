#!/bin/bash

# Create virtual environment if it does not exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install project requirements
pip install -r requirements.txt

echo ""
echo "========================================"
echo "Django environment setup completed."
echo "========================================"
echo ""

python --version
django-admin --version