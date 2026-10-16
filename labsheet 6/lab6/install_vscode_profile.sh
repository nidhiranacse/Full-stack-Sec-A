#!/usr/bin/env bash
# Task 6.2 - copy settings.json and keybindings.json into the VS Code
# user profile directory and install the recommended extensions.
set -euo pipefail

SRC=".vscode/user_profile"

case "$(uname -s)" in
    Linux*)               DEST="$HOME/.config/Code/User" ;;
    Darwin*)              DEST="$HOME/Library/Application Support/Code/User" ;;
    MINGW*|MSYS*|CYGWIN*) DEST="$APPDATA/Code/User" ;;
    *) echo "Unsupported OS" >&2; exit 1 ;;
esac

echo "==> VS Code user directory: $DEST"
mkdir -p "$DEST"

for f in settings.json keybindings.json; do
    if [ -f "$DEST/$f" ]; then
        cp "$DEST/$f" "$DEST/$f.bak"
        echo "    backed up existing $f -> $f.bak"
    fi
    cp "$SRC/$f" "$DEST/$f"
    echo "    installed $f"
done

if command -v code >/dev/null 2>&1; then
    for ext in ms-python.python ms-python.autopep8 ms-python.flake8; do
        code --install-extension "$ext"
    done
else
    echo "NOTE: 'code' command not found; install extensions from the"
    echo "      Extensions panel (see .vscode/extensions.json)."
fi
echo "Done. Restart VS Code."
