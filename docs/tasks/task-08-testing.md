# Task 08: 테스트 및 문서화

## 🎯 목표
전체 시스템 통합 테스트 수행 및 사용자 문서(README.md) 작성

## 📋 체크리스트

### 1. 단위 테스트
- [ ] time-calculator.js 테스트
- [ ] cli-runner.js 테스트
- [ ] 다양한 출근 시간 시나리오 테스트

### 2. 통합 테스트
- [ ] 전체 스케줄러 동작 테스트
- [ ] config.json 변경 후 재시작 테스트
- [ ] 에러 처리 시나리오 테스트

### 3. 플랫폼별 테스트
- [ ] macOS 자동 시작 테스트
- [ ] Windows 자동 시작 테스트
- [ ] 재부팅 후 동작 확인

### 4. 문서 작성
- [ ] README.md 작성
- [ ] 설치 가이드
- [ ] 설정 가이드
- [ ] 트러블슈팅 섹션

## 📝 테스트 시나리오

### 시나리오 1: 기본 동작 테스트
```bash
# 1. 설정 파일 생성
cp config.example.json config.json
vi config.json  # workStart: "08:00"

# 2. 스케줄러 시작
node scheduler.js

# 3. 출력 확인
# Expected:
# First Message Time: 05:00
# Schedule: 05:00, 10:00, 15:00, 20:00, 01:00
```

### 시나리오 2: 다양한 출근 시간
| 출근 시간 | 첫 메시지 | 스케줄 |
|----------|---------|-------|
| 07:00 | 04:00 | 04:00, 09:00, 14:00, 19:00, 00:00 |
| 09:00 | 06:00 | 06:00, 11:00, 16:00, 21:00, 02:00 |
| 10:30 | 07:30 | 07:30, 12:30, 17:30, 22:30, 03:30 |
| 02:00 | 23:00 | 23:00, 04:00, 09:00, 14:00, 19:00 |

### 시나리오 3: 에러 처리
```bash
# config.json 없는 경우
rm config.json
node scheduler.js
# Expected: ERROR: config.json not found

# 잘못된 형식
echo '{"workStart": "25:00"}' > config.json
node scheduler.js
# Expected: ERROR: Invalid workStart format

# CLI 실행 실패
# claudeCodePath를 존재하지 않는 경로로 설정
# Expected: 로그에 에러 기록, 스케줄러는 계속 실행
```

### 시나리오 4: 자동 시작
```bash
# macOS
npm run setup:macos
# 로그아웃 후 재로그인
launchctl list | grep claude
# Expected: 프로세스 실행 중

# Windows
npm run setup:windows
# 재시작 후 확인
Get-ScheduledTask -TaskName ClaudeScheduler
# Expected: Running 상태
```

## 📄 README.md 구조

### scheduler/README.md
```markdown
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

```bash
cd scheduler
npm install
```

### 2. 설정

```bash
# 설정 파일 생성
cp config.example.json config.json

# 출근 시간 설정
vi config.json
```

```json
{
  "workStart": "08:00"
}
```

### 3. 테스트 실행

```bash
npm start
```

### 4. 자동 시작 등록

**macOS:**
```bash
npm run setup:macos
```

**Windows:**
```powershell
npm run setup:windows
```

## ⚙️ 설정

### config.json

| 항목 | 필수 | 설명 | 예시 |
|-----|------|------|------|
| workStart | ✅ | 출근 시간 (HH:mm) | "08:00" |
| claudeCodePath | ❌ | Claude CLI 경로 | "claude-code" |

## 📊 로그

### 로그 파일
- `logs/scheduler.log` - 메인 로그
- `logs/stdout.log` - 표준 출력 (macOS launchd)
- `logs/stderr.log` - 에러 출력 (macOS launchd)

### 로그 확인
```bash
# 실시간 로그
tail -f logs/scheduler.log

# 최근 20줄
tail -20 logs/scheduler.log
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

## 🗑️ 제거

```bash
npm run uninstall
```

## 📝 라이선스

MIT
```

## ✅ 완료 기준

### 테스트
- [ ] 모든 단위 테스트 통과
- [ ] 통합 테스트 시나리오 완료
- [ ] macOS/Windows 모두 자동 시작 확인
- [ ] 에러 처리 정상 동작

### 문서
- [ ] README.md 작성 완료
- [ ] 모든 섹션 포함
- [ ] 명확한 설치/사용 가이드
- [ ] 트러블슈팅 섹션 포함

### 최종 확인
- [ ] 신규 사용자 관점에서 전체 플로우 테스트
- [ ] 문서만으로 설치 및 사용 가능한지 확인
- [ ] 로그 파일 정상 생성 및 기록
- [ ] Git에 불필요한 파일 제외 (.gitignore)

## 📌 완료!

모든 체크리스트 완료 시, 프로젝트 구현이 완료됩니다.
