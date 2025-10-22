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

# 출근 시간 변경 (자동 재시작)
ccsbatch config

# 현재 상태 확인 (간단)
ccsbatch status

# 현재 스케줄 확인 (상세)
ccsbatch explain

# 스케줄러 중지
ccsbatch stop

# 스케줄러 수동 시작 (보통 필요 없음)
ccsbatch start

# 자동 시작 설정 (init에서 설정하지 않은 경우)
ccsbatch setup

# 로그 확인
ccsbatch log

# 완전 제거 (설정 파일 삭제 옵션)
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
출근 시간을 변경합니다. **설정 변경 시 자동으로 스케줄러를 재시작**합니다.
```bash
$ ccsbatch config

Current work start time: 09:00
Enter new work start time (HH:mm, or press Enter to keep current): 08:30

✅ Configuration updated!
   Work Start: 08:30

Restarting scheduler with new configuration...
✅ Scheduler restarted successfully!

New schedule:
  First message: 05:30
  All times: 05:30, 10:30, 15:30, 20:30, 01:30
```

#### `ccsbatch status`
스케줄러의 현재 상태를 간단하게 확인합니다. **다음 실행 예정 시간**도 함께 표시됩니다.
```bash
$ ccsbatch status

==================================================
📊  ccsbatch - Status
==================================================

✅  Scheduler: Running
⚙️   Work Start: 09:00

🕐  Next Scheduled Times:
   →  16:00 in 2h 30m
      21:00 in 7h 30m
      02:00 (tomorrow) in 12h 30m

💡  Quick Actions:
   - View details: ccsbatch explain
   - View logs: ccsbatch log
   - Change time: ccsbatch config
   - Stop: ccsbatch stop
```

#### `ccsbatch explain`
현재 설정된 스케줄 정보를 확인합니다.
```bash
$ ccsbatch explain

============================================================
📅  Claude Scheduler - Current Configuration
============================================================

⚙️  Configuration:
   Work Start Time: 09:00
   First Message Time: 06:00 (09:00 - 3 hours)
   Interval: 300 minutes (5 hours)

🕐  Schedule (5 times per day):
   🕐  06:00
   🕘  11:00
   🕑  16:00
   🕖  21:00
   🕛  02:00

⚡️  Cron Expression:
   0 6,11,16,21,2 * * *

✅  Scheduler Status: Running

💡  Tips:
   - View logs: ccsbatch log
   - Change time: ccsbatch config
   - Stop scheduler: ccsbatch stop
```

#### `ccsbatch stop`
스케줄러를 중지합니다. 설정 파일은 유지됩니다.
```bash
$ ccsbatch stop

Stopping scheduler...

✅ Scheduler stopped successfully

To start again, run: ccsbatch setup
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

#### `ccsbatch uninstall`
스케줄러를 완전히 제거합니다. 설정 파일 삭제 여부를 선택할 수 있습니다.
```bash
$ ccsbatch uninstall

==================================================
Uninstall ccsbatch
==================================================

Step 1: Removing auto-start configuration...
✅ Uninstall complete!

Do you want to delete config files in ~/.ccsbatch? (y/N): y

Removing config files...
✅ Config directory removed: /Users/username/.ccsbatch

✅ Uninstall complete!
```

## ⚙️ 설정

### config.json

| 항목 | 필수 | 설명 | 예시 |
|-----|------|------|------|
| workStart | ✅ | 출근 시간 (HH:mm) | "08:00" |
| claudeCodePath | ❌ | Claude CLI 경로 (선택) | "claude" (기본값) |

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
# Claude CLI 경로 확인
which claude

# 필요시 config.json에서 경로 설정 (선택사항)
{
  "workStart": "08:00",
  "claudeCodePath": "/custom/path/to/claude"
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

## 🧪 로컬 테스트 (개발자용)

npm에 배포하기 전에 로컬에서 패키지를 테스트할 수 있습니다.

### 빠른 테스트

```bash
# 테스트 스크립트 실행
bash test-local.sh
```

### 방법 1: npm link (권장)

```bash
# 현재 패키지를 전역으로 링크
npm link

# 명령어 테스트
ccsbatch help
ccsbatch explain
ccsbatch init

# 테스트 완료 후 링크 제거
npm unlink -g ccsbatch
```

### 방법 2: .tgz 파일로 설치

```bash
# 1. 패키지 빌드
npm pack

# 2. 임시 디렉토리에 설치
mkdir -p ~/test-ccsbatch
cd ~/test-ccsbatch
npm install /path/to/ccsbatch-1.0.0.tgz

# 3. 테스트
npx ccsbatch help
npx ccsbatch explain

# 4. 정리
cd ~
rm -rf ~/test-ccsbatch
```

### 체크리스트

배포 전 다음 항목을 확인하세요:

**기본 명령어:**
- [ ] `ccsbatch help` - 도움말 표시
- [ ] `ccsbatch init` - 초기 설정
- [ ] `ccsbatch config` - 설정 변경 및 자동 재시작
- [ ] `ccsbatch status` - 현재 상태 확인
- [ ] `ccsbatch explain` - 스케줄 정보 표시
- [ ] `ccsbatch stop` - 스케줄러 중지
- [ ] `ccsbatch setup` - 자동 시작 설정
- [ ] `ccsbatch log` - 로그 확인
- [ ] `ccsbatch uninstall` - 완전 제거

**기능 테스트:**
- [ ] 설정 파일 생성 (`~/.ccsbatch/config.json`)
- [ ] LaunchAgent/Task 설정
- [ ] 스케줄러 정상 실행
- [ ] 로그 생성 확인

자세한 테스트 가이드는 [docs/local-testing.md](../docs/local-testing.md)를 참고하세요.

## 📦 npm 배포 (개발자용)

이 패키지를 npm에 배포하려면:

```bash
# 1. 로컬 테스트 완료
bash test-local.sh

# 2. npm 로그인
npm login

# 3. package.json의 name, repository, homepage 수정
vi package.json

# 4. 버전 업데이트
npm version patch  # 또는 minor, major

# 5. 배포 전 미리보기
npm pack --dry-run

# 6. 배포
npm publish
```

## 🤝 기여

이슈와 개선 제안을 환영합니다!

## 📝 라이선스

MIT
