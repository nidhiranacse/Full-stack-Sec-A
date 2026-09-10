#!/bin/bash
# ============================================================
# Task 6.1: Django Virtual Environment Setup Script
# Sets up an isolated venv, installs dependencies from
# requirements.txt, and creates a starter Django project.
# ============================================================

PROJECT_NAME="myproject"
VENV_DIR="venv"

echo "=========================================="
echo "  Django Virtual Environment Setup Script"
echo "=========================================="
echo ""

# Step 1: Check Python installation
echo "[1/5] Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "ERROR: Python is not installed or not in PATH."
    echo "Please install Python 3.8+ from https://www.python.org/downloads/"
    exit 1
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
echo "  Found: $PYTHON_VERSION"
echo ""

# Step 2: Create virtual environment
echo "[2/5] Creating virtual environment in './$VENV_DIR'..."
$PYTHON_CMD -m venv $VENV_DIR

if [ ! -d "$VENV_DIR" ]; then
    echo "ERROR: Failed to create virtual environment."
    exit 1
fi
echo "  Virtual environment created successfully."
echo ""

# Step 3: Activate virtual environment
echo "[3/5] Activating virtual environment..."
if [ -f "$VENV_DIR/bin/activate" ]; then
    source "$VENV_DIR/bin/activate"
elif [ -f "$VENV_DIR/Scripts/activate" ]; then
    source "$VENV_DIR/Scripts/activate"
else
    echo "ERROR: Could not find activation script."
    exit 1
fi
echo "  Activated: $(which python)"
echo ""

# Step 4: Install requirements
echo "[4/5] Installing project requirements from requirements.txt..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt
echo ""
echo "  Installed packages:"
pip list --format=columns
echo ""

# Step 5: Create starter Django project
echo "[5/5] Creating Django project '$PROJECT_NAME'..."
if [ ! -d "$PROJECT_NAME" ]; then
    django-admin startproject $PROJECT_NAME .
    echo "  Django project '$PROJECT_NAME' created."
else
    echo "  Project '$PROJECT_NAME' already exists, skipping."
fi

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "  To activate the environment later, run:"
echo "    source $VENV_DIR/bin/activate      (Linux/Mac)"
echo "    source $VENV_DIR/Scripts/activate   (Windows Git Bash)"
echo ""
echo "  To start the dev server, run:"
echo "    python manage.py runserver"
echo ""
