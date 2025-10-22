# Task 06: macOS 자동 시작 설정

## 🎯 목표
macOS launchd를 사용하여 시스템 부팅/로그인 시 스케줄러 자동 시작 설정

## 📋 체크리스트

### 1. launchd plist 템플릿 생성
- [ ] `templates/launchd.plist` 파일 생성
- [ ] LaunchAgent 설정
- [ ] 실행 경로 및 인자 설정
- [ ] 자동 재시작 설정

### 2. 설치 스크립트 작성
- [ ] `setup/macos-setup.sh` 생성
- [ ] plist 파일 복사 (~/Library/LaunchAgents/)
- [ ] 경로 동적 치환
- [ ] launchctl 명령어로 등록

### 3. 제거 스크립트 작성
- [ ] `setup/uninstall.sh` 생성
- [ ] launchctl unload
- [ ] plist 파일 삭제

### 4. 테스트
- [ ] 설치 스크립트 실행
- [ ] 재부팅 후 자동 시작 확인
- [ ] 제거 스크립트 실행

## 📝 상세 구현

### templates/launchd.plist
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude.scheduler</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>__SCHEDULER_PATH__/scheduler.js</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>

    <key>StandardOutPath</key>
    <string>__SCHEDULER_PATH__/logs/stdout.log</string>

    <key>StandardErrorPath</key>
    <string>__SCHEDULER_PATH__/logs/stderr.log</string>

    <key>WorkingDirectory</key>
    <string>__SCHEDULER_PATH__</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
```

### setup/macos-setup.sh
```bash
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
```

### setup/uninstall.sh
```bash
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
```

## 🧪 테스트

### 설치
```bash
cd scheduler
npm run setup:macos
# 또는
bash setup/macos-setup.sh
```

### 상태 확인
```bash
# 서비스 실행 중인지 확인
launchctl list | grep claude

# 로그 확인
tail -f scheduler/logs/stdout.log
tail -f scheduler/logs/stderr.log
```

### 제거
```bash
npm run uninstall
# 또는
bash setup/uninstall.sh
```

## 📊 launchd 개념

### LaunchAgent vs LaunchDaemon
- **LaunchAgent**: 사용자 로그인 시 실행 (우리가 사용)
- **LaunchDaemon**: 시스템 부팅 시 실행 (root 권한)

### 주요 설정 항목
- **Label**: 서비스 고유 식별자
- **ProgramArguments**: 실행할 명령어 및 인자
- **RunAtLoad**: 로드 시 즉시 실행
- **KeepAlive**: 프로세스 종료 시 자동 재시작
- **StandardOutPath/ErrorPath**: 로그 파일 경로

## 🔧 트러블슈팅

### 문제: 서비스가 시작되지 않음
```bash
# 로그 확인
cat ~/Library/LaunchAgents/com.claude.scheduler.plist
tail scheduler/logs/stderr.log

# 서비스 재시작
launchctl unload ~/Library/LaunchAgents/com.claude.scheduler.plist
launchctl load ~/Library/LaunchAgents/com.claude.scheduler.plist
```

### 문제: Node.js 경로 오류
```bash
# Node.js 경로 확인
which node

# plist에서 경로 수정 필요 시
vi ~/Library/LaunchAgents/com.claude.scheduler.plist
```

### 문제: 권한 문제
```bash
# plist 파일 권한 확인
ls -la ~/Library/LaunchAgents/com.claude.scheduler.plist

# 실행 권한 부여
chmod +x scheduler/scheduler.js
```

## ✅ 완료 기준
- [ ] launchd.plist 템플릿 생성
- [ ] macos-setup.sh 실행 성공
- [ ] 로그인 후 자동 시작 확인
- [ ] uninstall.sh 정상 동작
- [ ] 재부팅 후에도 자동 시작

## 📌 다음 단계
Task 07: Windows 자동 시작 설정
