#!/bin/bash

# Lab Sheet 06 - Task 6.1: Automated Virtual Execution Ecosystem Setup
set -e

ENV_DIR="venv"

echo "=== Starting Django Execution Environment Setup ==="

# 1. System Python Check
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 is not installed on this system."
    exit 1
fi
echo "[OK] Python3 binary detected."

# 2. Virtual Environment Creation
if [ -d "$ENV_DIR" ]; then
    echo "[INFO] Existing virtual environment found. Removing old environment..."
    rm -rf "$ENV_DIR"
fi

echo "[INFO] Creating isolated virtual environment in './$ENV_DIR'..."
python3 -m venv "$ENV_DIR"

# 3. Activation & Core Package Upgrades
echo "[INFO] Activating environment and updating pip..."
source "$ENV_DIR/bin/activate"
pip install --upgrade pip setuptools wheel

# 4. Requirements Pipeline
if [ -f "requirements.txt" ]; then
    echo "[INFO] Installing requirements from requirements.txt..."
    pip install -r requirements.txt
else
    echo "[ERROR] requirements.txt not found! Aborting setup."
    exit 1
fi

echo "=== Environment Setup Completed Successfully ==="
echo "To activate manually run: source venv/bin/activate"