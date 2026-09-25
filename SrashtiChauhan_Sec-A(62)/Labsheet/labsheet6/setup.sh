#!/bin/bash

echo "Starting Django environment setup..."

python3.10 -m venv .venv

source .venv/bin/activate

python -m pip install --upgrade pip

python -m pip install -r requirements.txt

echo "Django environment setup completed successfully."
