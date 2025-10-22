# Claude 5-Hour Quota Optimizer

자동으로 메시지를 전송하여 Claude의 5시간 사용량 제한을 업무 시간에 최적화하는 스케줄러

## 📋 개요

Claude 구독 서비스는 첫 메시지 전송 시점부터 5시간 사용량 제한이 시작됩니다.
이 스케줄러는 출근 시간 3시간 전에 자동으로 메시지를 보내,
업무 시간 내내 최대 3개의 5시간 슬롯을 활용할 수 있게 합니다.

### 동작 원리

**예시: 출근 8시**
```
05:00 자동 메시지 → 10:00 초기화 (슬롯 1)
10:00 자동 메시지 → 15:00 초기화 (슬롯 2)
15:00 자동 메시지 → 20:00 초기화 (슬롯 3)

업무시간 08:00-18:00 완전 커버 ✅
```

## 🚀 빠른 시작

### 1. 설치

**글로벌 설치 (권장):**
```bash
npm install -g ccsbatch
```

**또는 npx 사용 (설치 없이):**
```bash
npx ccsbatch
```

### 2. 초기 설정 (인터랙티브)

```bash
ccsbatch init
```

이 명령어는 대화형으로 설정을 진행합니다:
- 출근 시간 입력 (예: 09:00)
- 자동 시작 설정 여부 선택

```
==================================================
ccsbatch - Initial Setup
==================================================

Enter your work start time (HH:mm, e.g., 09:00): 09:00
Setup auto-start on system boot? (Y/n): y

✅ Configuration saved!
   Location: /Users/username/.ccsbatch/config.json
   Work Start: 09:00

Setting up auto-start...
✅ Setup complete!
```

**📁 파일 위치:**
- 설정 파일: `~/.ccsbatch/config.json`
- 로그 파일: `~/.ccsbatch/logs/scheduler.log`

### 3. 설정 완료!

초기 설정이 완료되면 **스케줄러가 자동으로 시작**됩니다.
별도로 `ccsbatch start` 명령어를 실행할 필요가 없습니다!

예상 출력:
```
==================================================
Claude 5-Hour Quota Optimizer - Starting...
==================================================
Work Start Time: 08:00
First Message Time: 05:00 (08:00 - 3 hours)
Schedule: 05:00, 10:00, 15:00, 20:00, 01:00
Interval: 300 minutes (5 hours)
Cron Expression: 0 5,10,15,20,1 * * *

✅ Scheduler started successfully
Press Ctrl+C to stop
```

### 4. 자동 시작 등록

시스템 부팅/로그인 시 자동으로 스케줄러를 시작하려면:

```bash
ccsbatch setup
```

이 명령어는 자동으로 OS를 감지하여 설정합니다:
- **macOS**: launchd 등록
- **Windows**: Task Scheduler 등록

## 🎮 CLI 명령어

```bash
# 초기 설정 (인터랙티브)
ccsbatch init

# 출근 시간 변경
ccsbatch config

# 로그 확인
ccsbatch log

# 스케줄러 수동 시작 (보통 필요 없음)
ccsbatch start

# 자동 시작 설정 (init에서 설정하지 않은 경우)
ccsbatch setup

# 자동 시작 제거
ccsbatch uninstall

# 도움말
ccsbatch help
```

### 명령어 상세

#### `ccsbatch init`
대화형으로 초기 설정을 진행합니다.
- 출근 시간 입력
- 자동 시작 설정 여부 선택
- 설정 완료 후 자동으로 스케줄러 시작

#### `ccsbatch config`
출근 시간을 변경합니다.
```bash
$ ccsbatch config

Current work start time: 09:00
Enter new work start time (HH:mm, or press Enter to keep current): 08:30

✅ Configuration updated!
   Work Start: 08:30
```

#### `ccsbatch log`
스케줄러 로그를 확인합니다 (최근 20줄).
```bash
$ ccsbatch log

============================================================
Scheduler Logs (/Users/username/.ccsbatch/logs/scheduler.log)
============================================================

[2025-10-22T05:00:00.000Z] SUCCESS: Sent "2025-10-22 05:00:00"
[2025-10-22T10:00:00.000Z] SUCCESS: Sent "2025-10-22 10:00:00"
...
```

## ⚙️ 설정

### config.json

| 항목 | 필수 | 설명 | 예시 |
|-----|------|------|------|
| workStart | ✅ | 출근 시간 (HH:mm) | "08:00" |
| claudeCodePath | ❌ | Claude CLI 경로 | "claude-code" |

### 다양한 출근 시간 예시

| 출근 시간 | 첫 메시지 | 스케줄 |
|----------|---------|-------|
| 07:00 | 04:00 | 04:00, 09:00, 14:00, 19:00, 00:00 |
| 08:00 | 05:00 | 05:00, 10:00, 15:00, 20:00, 01:00 |
| 09:00 | 06:00 | 06:00, 11:00, 16:00, 21:00, 02:00 |
| 10:30 | 07:30 | 07:30, 12:30, 17:30, 22:30, 03:30 |

## 📊 로그

### 로그 파일 위치
- `~/.ccsbatch/logs/scheduler.log` - 메인 로그 (글로벌 설치 시)
- `./logs/scheduler.log` - 메인 로그 (로컬 실행 시)

### 로그 확인
```bash
# 실시간 로그
tail -f ~/.ccsbatch/logs/scheduler.log

# 최근 20줄
tail -20 ~/.ccsbatch/logs/scheduler.log
```

## 🔧 문제 해결

### macOS

**문제: 자동 시작이 안됨**
```bash
# 서비스 상태 확인
launchctl list | grep claude

# 로그 확인
tail logs/stderr.log

# 재등록
npm run uninstall
npm run setup:macos
```

**문제: Node.js 경로 오류**
```bash
# Node.js 경로 확인
which node

# plist 파일에서 경로 수정
vi ~/Library/LaunchAgents/com.claude.scheduler.plist
```

### Windows

**문제: 작업이 실행되지 않음**
```powershell
# 작업 상태 확인
Get-ScheduledTask -TaskName ClaudeScheduler

# 수동 실행 테스트
Start-ScheduledTask -TaskName ClaudeScheduler

# 로그 확인
Get-Content logs\scheduler.log -Tail 20
```

**문제: PowerShell 실행 정책 오류**
```powershell
# 임시로 우회하여 실행
powershell -ExecutionPolicy Bypass -File setup\windows-setup.ps1
```

### 공통

**문제: config.json not found**
```bash
# 설정 파일 생성 확인
ls config.json

# 없다면 템플릿 복사
cp config.example.json config.json
```

**문제: Claude CLI 실행 실패**
```bash
# Claude Code CLI 경로 확인
which claude-code

# config.json에서 경로 설정
{
  "workStart": "08:00",
  "claudeCodePath": "/full/path/to/claude-code"
}
```

## 🗑️ 제거

### 1. 자동 시작 제거 (먼저)
자동 시작 설정을 해두었다면, 먼저 제거하세요:
```bash
ccsbatch uninstall
```

### 2. 패키지 제거
```bash
npm uninstall -g ccsbatch
```

### 3. 설정 파일 제거 (선택)
개인 설정과 로그를 완전히 삭제하려면:
```bash
rm -rf ~/.ccsbatch
```

**⚠️ 주의:** 위 명령어는 모든 설정과 로그를 삭제합니다.

## 📁 프로젝트 구조

```
ccsbatch/
├── package.json            # 프로젝트 설정
├── bin/
│   └── claude-scheduler.js # CLI 진입점
├── config.example.json     # 설정 템플릿
├── scheduler.js           # 메인 스케줄러
├── time-calculator.js     # 시간 계산 로직
├── cli-runner.js          # CLI 실행 모듈
├── setup/
│   ├── macos-setup.sh     # macOS 자동 시작 설정
│   ├── windows-setup.ps1  # Windows 자동 시작 설정
│   └── uninstall.sh       # 제거 스크립트
├── templates/
│   ├── launchd.plist      # macOS launchd 템플릿
│   └── task.xml           # Windows Task 템플릿
└── logs/
    └── scheduler.log      # 실행 로그
```

## 📦 npm 배포 (개발자용)

이 패키지를 npm에 배포하려면:

```bash
# 1. npm 로그인
npm login

# 2. package.json의 name, repository, homepage 수정
vi package.json

# 3. 버전 업데이트
npm version patch  # 또는 minor, major

# 4. 배포
npm publish
```

## 🤝 기여

이슈와 개선 제안을 환영합니다!

## 📝 라이선스

MIT
