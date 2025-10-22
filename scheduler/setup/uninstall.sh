#!/bin/bash

set -e

echo "===================================="
echo "Claude Scheduler - Uninstall"
echo "===================================="

PLIST_NAME="com.claude.scheduler.plist"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME"

if [ ! -f "$PLIST_PATH" ]; then
    echo "⚠️  Service not found. Already uninstalled?"
    exit 0
fi

echo "Unloading service..."
launchctl unload "$PLIST_PATH" 2>/dev/null || true

echo "Removing plist file..."
rm -f "$PLIST_PATH"

echo ""
echo "✅ Uninstall complete!"
echo "The scheduler will no longer start automatically."
