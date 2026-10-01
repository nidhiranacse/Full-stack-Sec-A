#!/usr/bin/env bash
# Task 6.2 - copy workspace settings into .vscode and user keybindings into the VS Code user dir
set -euo pipefail
mkdir -p .vscode
cp settings.json tasks.json extensions.json .vscode/
case "$(uname -s)" in
  Darwin) USER_DIR="$HOME/Library/Application Support/Code/User" ;;
  *)      USER_DIR="$HOME/.config/Code/User" ;;
esac
mkdir -p "$USER_DIR"
[ -f "$USER_DIR/keybindings.json" ] && cp "$USER_DIR/keybindings.json" "$USER_DIR/keybindings.json.bak"
cp keybindings.json "$USER_DIR/keybindings.json"
echo "Installed. Restart VS Code. (Windows: copy keybindings.json to %APPDATA%\\Code\\User)"
