#!/usr/bin/env bash
# setup.sh -- rebuild the Django venv cluster from requirements.txt

set -e

echo ">>> Creating virtual environment (django_env)"
python3 -m venv django_env

source django_env/bin/activate

echo ">>> Upgrading pip"
pip install --upgrade pip

echo ">>> Piping requirement definitions into the environment"
pip install -r requirements.txt

echo ">>> Verifying Django installation"
python -m django --version

echo ">>> Environment ready: django_env"