# Claude 5시간 할당량 최적화 스케줄러 - 구현 체크리스트

## 📊 전체 진행 상황

- [x] Task 01: 프로젝트 초기 설정 ✅
- [x] Task 02: 설정 파일 구현 ✅
- [x] Task 03: 시간 계산 로직 구현 ✅
- [x] Task 04: CLI 실행 모듈 ✅
- [x] Task 05: 메인 스케줄러 구현 ✅
- [x] Task 06: macOS 자동 시작 설정 ✅
- [x] Task 07: Windows 자동 시작 설정 ✅
- [x] Task 08: 테스트 및 문서화 ✅

---

## Task 01: 프로젝트 초기 설정
📄 [상세 문서](tasks/task-01-setup.md)

### 체크리스트
- [x] `scheduler/` 루트 디렉토리 생성
- [x] `scheduler/setup/` 디렉토리 생성
- [x] `scheduler/templates/` 디렉토리 생성
- [x] `scheduler/logs/` 디렉토리 생성
- [x] package.json 생성 및 메타데이터 설정
- [x] scripts 섹션 추가 (start, setup:macos, setup:windows, uninstall, postinstall)
- [x] `node-cron` 의존성 설치
- [x] `cross-spawn` 의존성 설치
- [x] `scheduler/.gitignore` 파일 생성
- [x] .gitignore에 node_modules, config.json, logs/*.log 추가

### 완료 기준
- [x] `npm install` 명령어 정상 실행
- [x] 디렉토리 구조 완성

---

## Task 02: 설정 파일 구현
📄 [상세 문서](tasks/task-02-config.md)

### 체크리스트
- [x] `config.example.json` 템플릿 파일 생성
- [x] workStart, claudeCodePath 항목 정의
- [x] JSON 스키마 및 검증 규칙 정의
- [x] 설정 로딩 구현 (scheduler.js의 loadConfig/findConfigPath)
- [x] 설정 유효성 검증 함수
- [x] 에러 처리 로직

### 완료 기준
- [x] config.example.json 존재
- [x] 사용자가 인터랙티브하게 설정 가능 (ccsbatch init)
- [x] 최소한의 설정 항목 (workStart만 필수)

---

## Task 03: 시간 계산 로직 구현
📄 [상세 문서](tasks/task-03-time-calculator.md)

### 체크리스트
- [x] `time-calculator.js` 파일 생성
- [x] calculateSchedule() 함수 구현
- [x] 출근 시간 - 3시간 계산 로직
- [x] 5시간 간격 스케줄 생성
- [x] timeToCron() 함수 구현
- [x] generateCronExpression() 함수 구현
- [x] 24시간 경계 처리 (00:00 넘어가는 경우)
- [x] 단위 테스트 (08:00, 09:00, 02:00 등)

### 완료 기준
- [x] 모든 테스트 케이스 통과
- [x] cron 표현식 정상 생성

---

## Task 04: CLI 실행 모듈
📄 [상세 문서](tasks/task-04-cli-runner.md)

### 체크리스트
- [x] `cli-runner.js` 파일 생성
- [x] getCurrentTimestamp() 함수 구현 (YYYY-MM-DD HH:mm:ss)
- [x] runClaudeCLI() 함수 구현
- [x] cross-spawn으로 프로세스 실행
- [x] 타임아웃 설정 (30초)
- [x] 성공 로그 기록 함수 (logSuccess)
- [x] 에러 로그 기록 함수 (logError)
- [x] 로그 파일 생성 및 기록 (~/.ccsbatch/logs/scheduler.log)

### 완료 기준
- [x] Claude CLI 정상 실행
- [x] 로그 파일에 실행 기록 저장
- [x] Windows/macOS 모두 동작

---

## Task 05: 메인 스케줄러 구현
📄 [상세 문서](tasks/task-05-scheduler.md)

### 체크리스트
- [x] `scheduler.js` 파일 생성
- [x] loadConfig() 함수 구현
- [x] findConfigPath() 함수 구현 (우선순위 처리)
- [x] config.json 검증 로직
- [x] startScheduler() 함수 구현
- [x] time-calculator 통합
- [x] cli-runner 통합
- [x] node-cron 스케줄 등록
- [x] SIGINT, SIGTERM 시그널 처리
- [x] 우아한 종료 로직

### 완료 기준
- [x] `npm start` 또는 `ccsbatch start` 명령어로 실행 가능
- [x] 설정된 시간에 정확히 메시지 전송
- [x] Ctrl+C로 정상 종료

---

## Task 06: macOS 자동 시작 설정
📄 [상세 문서](tasks/task-06-macos-setup.md)

### 체크리스트
- [x] `templates/launchd.plist` 파일 생성
- [x] LaunchAgent 설정
- [x] ProgramArguments 설정
- [x] RunAtLoad, KeepAlive 설정
- [x] StandardOutPath, StandardErrorPath 설정
- [x] `setup/macos-setup.sh` 스크립트 작성
- [x] plist 파일 복사 및 경로 치환 로직
- [x] launchctl load 명령어 실행
- [x] `setup/uninstall.sh` 스크립트 작성
- [x] 실행 권한 부여 (chmod +x)

### 완료 기준
- [x] `npm run setup:macos` 또는 `ccsbatch setup` 실행 가능
- [x] 스크립트 정상 동작
- [x] launchctl 통합 완료

---

## Task 07: Windows 자동 시작 설정
📄 [상세 문서](tasks/task-07-windows-setup.md)

### 체크리스트
- [x] `templates/task.xml` 파일 생성
- [x] LogonTrigger 설정
- [x] Actions 섹션 설정 (Node.js 경로)
- [x] RestartOnFailure 설정
- [x] `setup/windows-setup.ps1` 스크립트 작성
- [x] Node.js 경로 자동 탐지
- [x] XML 경로 치환 로직
- [x] Register-ScheduledTask 명령어 실행
- [x] `setup/windows-uninstall.ps1` 스크립트 작성

### 완료 기준
- [x] `npm run setup:windows` 또는 `ccsbatch setup` 실행 가능
- [x] 스크립트 정상 동작
- [x] Task Scheduler 통합 완료

---

## Task 08: 테스트 및 문서화
📄 [상세 문서](tasks/task-08-testing.md)

### 체크리스트
- [x] time-calculator 단위 테스트
- [x] cli-runner 단위 테스트
- [x] 다양한 출근 시간 시나리오 테스트
- [x] 전체 스케줄러 통합 테스트
- [x] 에러 처리 시나리오 테스트
- [x] macOS 자동 시작 스크립트 검증
- [x] Windows 자동 시작 스크립트 검증
- [x] npm 배포 준비 완료
- [x] `scheduler/README.md` 작성
- [x] 설치 가이드 작성 (npm install, ccsbatch init)
- [x] 설정 가이드 작성 (ccsbatch config)
- [x] 트러블슈팅 섹션 작성
- [x] LICENSE 파일 작성 (MIT)

### 완료 기준
- [x] 모든 테스트 시나리오 통과
- [x] 문서만으로 설치 및 사용 가능
- [x] 인터랙티브 CLI로 신규 사용자도 쉽게 사용 가능

---

## 🎉 최종 완료 체크리스트

### 기능 검증
- [x] 설정된 시간에 정확히 메시지 전송
- [x] 5시간 간격으로 자동 반복
- [x] Windows/macOS 모두 정상 동작
- [x] 시스템 재부팅 후 자동 실행 (launchd/Task Scheduler)
- [x] 로그 파일에 모든 실행 기록 (~/.ccsbatch/logs/scheduler.log)

### 코드 품질
- [x] 모든 파일에 명확한 주석
- [x] 에러 처리 완료
- [x] 모듈화된 구조
- [x] 크로스 플랫폼 호환성 (cross-spawn 사용)

### 문서
- [x] README.md 완성 (npm 사용자 가이드 포함)
- [x] 모든 태스크 문서 작성 (tasks/ 디렉토리)
- [x] 요구사항 문서 작성 (requirements.md)
- [x] 체크리스트 작성 (checklist.md)

### Git 관리
- [x] .gitignore 설정 완료
- [x] config.json 제외
- [x] node_modules 제외
- [x] logs/*.log 제외

### npm 배포 준비 (추가)
- [x] package.json npm 메타데이터 완성
- [x] bin 명령어 설정 (ccsbatch)
- [x] postinstall 스크립트 작성
- [x] .npmignore 설정
- [x] LICENSE 파일 작성
- [x] 인터랙티브 CLI 구현 (ccsbatch init, config, log)
- [x] 홈 디렉토리 설정 파일 관리 (~/.ccsbatch/)
- [x] npm pack 테스트 완료

---

## 📚 문서 링크

- [요구사항 명세서](requirements.md)
- [Task 01: 프로젝트 초기 설정](tasks/task-01-setup.md)
- [Task 02: 설정 파일 구현](tasks/task-02-config.md)
- [Task 03: 시간 계산 로직 구현](tasks/task-03-time-calculator.md)
- [Task 04: CLI 실행 모듈](tasks/task-04-cli-runner.md)
- [Task 05: 메인 스케줄러 구현](tasks/task-05-scheduler.md)
- [Task 06: macOS 자동 시작 설정](tasks/task-06-macos-setup.md)
- [Task 07: Windows 자동 시작 설정](tasks/task-07-windows-setup.md)
- [Task 08: 테스트 및 문서화](tasks/task-08-testing.md)

---

## 💡 사용 방법

1. 각 Task를 순서대로 진행
2. 상세 문서 링크를 클릭하여 구현 가이드 확인
3. 체크리스트 항목을 완료하면 체크 표시
4. 모든 Task 완료 시 최종 검증 수행

**진행 상황 업데이트**: 이 파일의 체크박스를 업데이트하여 진행 상황 추적
