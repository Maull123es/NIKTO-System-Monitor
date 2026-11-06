#!/usr/bin/env bash
# run.sh — convenience launcher for NIKTO System Monitor
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"

# Create venv on first run
if [ ! -d "$VENV_DIR" ]; then
  echo "[nikto] Creating virtual environment..."
  python3 -m venv "$VENV_DIR"
fi

# Activate venv
source "$VENV_DIR/bin/activate"

# Install / upgrade dependencies
echo "[nikto] Checking dependencies..."
pip install -q --upgrade pip
pip install -q -r "$SCRIPT_DIR/requirements.txt"

# Start the server
echo "[nikto] Starting server..."
cd "$SCRIPT_DIR"
exec python app.py "$@"
