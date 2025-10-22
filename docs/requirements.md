# Claude 5시간 할당량 최적화 스케줄러 - 요구사항 명세서

## 📌 프로젝트 개요

Claude 구독 서비스는 시간별(5시간) 사용량 제한이 있으며, 이 제한은 첫 채팅을 보낼 때부터 카운팅이 시작됩니다. 이 프로젝트는 업무 시간에 5시간 할당량을 최대한 효율적으로 사용할 수 있도록, 자동으로 메시지를 전송하는 스케줄러를 구현합니다.

## 🎯 핵심 개념

### 5시간 할당량 메커니즘
- 첫 메시지 전송 시점에 5시간 카운터 시작
- 5시간 후 자동으로 할당량 초기화
- 초기화 후 새로운 5시간 할당량 사용 가능

### 최적화 전략
**출근 시간 3시간 전에 첫 메시지 전송**

예시: 출근 시간이 8:00인 경우
```
05:00 자동 전송 → 10:00 초기화 (슬롯 1: 05:00-10:00)
10:00 자동 전송 → 15:00 초기화 (슬롯 2: 10:00-15:00)
15:00 자동 전송 → 20:00 초기화 (슬롯 3: 15:00-20:00)
```

**결과**: 업무 시간 08:00-18:00 동안 최대 3개의 5시간 슬롯 활용 가능

## ✅ 기능 요구사항

### 1. 자동 메시지 전송
- Claude Code CLI를 자동으로 실행
- 현재 날짜/시간을 메시지로 전송 (예: "2025-10-22 05:00:00")
- 5시간 간격으로 반복 전송

### 2. 사용자 설정
- **workStart**: 출근 시간 (필수)
- **claudeCodePath**: Claude Code CLI 경로 (선택)
- 매일 자동 실행 (요일 필터링 없음)

### 3. 크로스 플랫폼 지원
- Windows, macOS 모두 지원
- 각 OS의 스케줄러를 사용하여 자동 시작
  - macOS: launchd
  - Windows: Task Scheduler

### 4. 로깅
- 메시지 전송 시간 기록
- 성공/실패 상태 로깅
- 로그 파일: `scheduler/logs/scheduler.log`

## 🏗️ 시스템 아키텍처

```
scheduler/
├── config.json              # 사용자 설정
├── package.json            # 의존성 관리
├── scheduler.js            # 메인 스케줄러
├── time-calculator.js      # 시간 계산 로직
├── cli-runner.js           # Claude CLI 실행 모듈
├── setup/
│   ├── macos-setup.sh     # macOS 자동 시작 등록
│   └── windows-setup.ps1  # Windows 자동 시작 등록
├── templates/
│   ├── launchd.plist      # macOS launchd 템플릿
│   └── task.xml           # Windows Task 템플릿
└── logs/
    └── scheduler.log       # 실행 로그
```

## 🔧 기술 스택

- **Runtime**: Node.js
- **스케줄링**: node-cron
- **프로세스 실행**: cross-spawn (크로스 플랫폼)
- **자동 시작**:
  - macOS: launchd
  - Windows: Task Scheduler

## 📊 동작 흐름

1. **시스템 부팅/로그인 시**
   - OS 스케줄러가 scheduler.js 실행

2. **scheduler.js 시작**
   - config.json 읽기
   - 첫 전송 시간 계산 (workStart - 3시간)
   - node-cron으로 5시간 간격 스케줄 등록

3. **스케줄 실행 시**
   - cli-runner.js 호출
   - Claude Code CLI 실행 (현재 날짜/시간 전송)
   - 로그 기록

4. **5시간 후**
   - 다음 메시지 자동 전송
   - 반복

## 🎨 사용자 경험

### 설치
```bash
cd scheduler
npm install
```

### 설정
```json
{
  "workStart": "08:00",
  "claudeCodePath": "claude-code"
}
```

### 자동 시작 등록
```bash
# macOS
npm run setup:macos

# Windows
npm run setup:windows
```

### 제거
```bash
npm run uninstall
```

## 📈 성공 기준

- [x] 설정된 시간에 정확히 메시지 전송
- [x] 5시간 간격으로 자동 반복
- [x] Windows/macOS 모두 정상 동작
- [x] 시스템 재부팅 후에도 자동 실행
- [x] 로그 파일에 모든 실행 기록
- [x] 간단한 설정 (출근 시간만 입력)

## 📝 비기능 요구사항

### 안정성
- 네트워크 오류 시 재시도 로직
- CLI 실행 실패 시 로그 기록

### 유지보수성
- 명확한 코드 주석
- README 문서화
- 모듈화된 구조

### 보안
- 민감한 정보 config.json에만 저장
- Git에 config.json 제외 (.gitignore)

## 🚫 제외 사항 (현재 버전)

- 점심 시간 설정 (단순화를 위해 제외)
- 요일별 활성화/비활성화 (매일 실행)
- 사용량 추적 대시보드
- GUI 설정 인터페이스
