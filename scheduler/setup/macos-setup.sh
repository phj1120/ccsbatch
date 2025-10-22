#!/bin/bash

set -e

echo "================================"
echo "Claude Scheduler - macOS Setup"
echo "================================"

# 현재 디렉토리 (scheduler/)
SCHEDULER_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLIST_TEMPLATE="$SCHEDULER_DIR/templates/launchd.plist"
PLIST_NAME="com.claude.scheduler.plist"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_DEST="$LAUNCH_AGENTS_DIR/$PLIST_NAME"

echo "Scheduler directory: $SCHEDULER_DIR"

# LaunchAgents 디렉토리 생성
mkdir -p "$LAUNCH_AGENTS_DIR"

# plist 파일 복사 및 경로 치환
echo "Creating plist file..."
sed "s|__SCHEDULER_PATH__|$SCHEDULER_DIR|g" "$PLIST_TEMPLATE" > "$PLIST_DEST"

echo "Plist file created at: $PLIST_DEST"

# 기존 서비스 제거 (있다면)
if launchctl list | grep -q com.claude.scheduler; then
    echo "Removing existing service..."
    launchctl unload "$PLIST_DEST" 2>/dev/null || true
fi

# 서비스 등록
echo "Loading service..."
launchctl load "$PLIST_DEST"

echo ""
echo "✅ Setup complete!"
echo ""
echo "The scheduler will now start automatically on login."
echo "To check status: launchctl list | grep claude"
echo "To view logs: tail -f $SCHEDULER_DIR/logs/stdout.log"
echo ""
echo "To uninstall, run: npm run uninstall"
