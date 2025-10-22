#!/bin/bash

# 로컬 테스트 스크립트
# Usage: bash test-local.sh

set -e

echo "============================================"
echo "ccsbatch - Local Testing Script"
echo "============================================"
echo ""

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Package directory: $SCRIPT_DIR"
echo ""

# 1. 패키지 빌드
echo "Step 1: Building package..."
echo "-------------------------------------------"
npm pack
echo ""

# 2. 기본 명령어 테스트
echo "Step 2: Testing basic commands..."
echo "-------------------------------------------"

echo "Testing: help"
node bin/claude-scheduler.js help
echo ""

echo "Testing: explain (may fail if not configured)"
node bin/claude-scheduler.js explain || echo "⚠️  Config not found (expected)"
echo ""

# 3. npm link 안내
echo "Step 3: Testing with npm link"
echo "-------------------------------------------"
echo "To test globally, run:"
echo "  npm link"
echo "  ccsbatch help"
echo "  ccsbatch explain"
echo ""
echo "To unlink after testing:"
echo "  npm unlink -g ccsbatch"
echo ""

# 4. 로컬 설치 테스트 안내
echo "Step 4: Testing with local install"
echo "-------------------------------------------"
TGZ_FILE=$(ls -t ccsbatch-*.tgz | head -1)
echo "Package file: $TGZ_FILE"
echo ""
echo "To test in a separate directory:"
echo "  mkdir -p ~/test-ccsbatch"
echo "  cd ~/test-ccsbatch"
echo "  npm install $SCRIPT_DIR/$TGZ_FILE"
echo "  npx ccsbatch help"
echo "  npx ccsbatch explain"
echo ""

# 5. 체크리스트
echo "============================================"
echo "Pre-publish Checklist"
echo "============================================"
echo ""
echo "Basic Commands:"
echo "  [ ] ccsbatch help"
echo "  [ ] ccsbatch init"
echo "  [ ] ccsbatch config"
echo "  [ ] ccsbatch explain"
echo "  [ ] ccsbatch setup"
echo "  [ ] ccsbatch stop"
echo "  [ ] ccsbatch log"
echo "  [ ] ccsbatch uninstall"
echo ""
echo "Functionality:"
echo "  [ ] Config file creation (~/.ccsbatch/config.json)"
echo "  [ ] LaunchAgent setup (~/Library/LaunchAgents/)"
echo "  [ ] Scheduler starts and runs"
echo "  [ ] Auto-restart on config change"
echo "  [ ] Logs are created"
echo ""
echo "Edge Cases:"
echo "  [ ] Error handling for missing config"
echo "  [ ] Invalid time format validation"
echo "  [ ] Stop when not running"
echo "  [ ] Uninstall removes everything"
echo ""

# 6. 다음 단계
echo "============================================"
echo "Next Steps"
echo "============================================"
echo ""
echo "1. Run: npm link"
echo "2. Test all commands manually"
echo "3. Review: package.json, README.md"
echo "4. Publish: npm publish"
echo ""
echo "For detailed testing guide, see:"
echo "  docs/local-testing.md"
echo ""
