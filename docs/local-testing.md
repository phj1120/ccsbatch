# 로컬 테스트 가이드

npm에 패키지를 배포하기 전에 로컬에서 테스트하는 방법을 안내합니다.

## 방법 1: npm link 사용 (권장)

`npm link`를 사용하면 전역으로 설치하지 않고도 로컬 패키지를 테스트할 수 있습니다.

### 1단계: 패키지 링크 생성

```bash
cd /Users/parkh/Dev/git/Project/claudeSubBatch/scheduler
npm link
```

이 명령어는:
- 현재 패키지를 전역 npm 디렉토리에 심볼릭 링크로 연결합니다
- `ccsbatch` 명령어를 시스템 전역에서 사용할 수 있게 합니다

### 2단계: 명령어 테스트

```bash
# 어디서든 ccsbatch 명령어 사용 가능
ccsbatch help
ccsbatch explain
ccsbatch init
```

### 3단계: 테스트 완료 후 링크 제거

```bash
# 전역 링크 제거
npm unlink -g ccsbatch

# 또는 패키지 디렉토리에서
cd /Users/parkh/Dev/git/Project/claudeSubBatch/scheduler
npm unlink
```

## 방법 2: 로컬 .tgz 파일 설치

실제 배포 환경과 가장 유사한 테스트 방법입니다.

### 1단계: 패키지 빌드

```bash
cd /Users/parkh/Dev/git/Project/claudeSubBatch/scheduler
npm pack
```

출력 예시:
```
ccsbatch-1.0.0.tgz
```

### 2단계: 테스트 디렉토리 생성 및 설치

```bash
# 테스트용 임시 디렉토리 생성
mkdir -p ~/test-ccsbatch
cd ~/test-ccsbatch

# .tgz 파일로 설치
npm install /Users/parkh/Dev/git/Project/claudeSubBatch/scheduler/ccsbatch-1.0.0.tgz
```

### 3단계: 명령어 테스트

```bash
# npx를 사용하여 명령어 실행
npx ccsbatch help
npx ccsbatch explain
npx ccsbatch init
```

### 4단계: 테스트 완료 후 정리

```bash
# 테스트 디렉토리 삭제
rm -rf ~/test-ccsbatch
```

## 방법 3: 직접 실행 (개발 중)

개발 중에 빠르게 테스트하는 방법입니다.

```bash
cd /Users/parkh/Dev/git/Project/claudeSubBatch/scheduler

# 직접 실행
node bin/claude-scheduler.js help
node bin/claude-scheduler.js explain
node bin/claude-scheduler.js init
```

## 전체 워크플로우 테스트

실제 사용자 시나리오대로 전체 기능을 테스트합니다.

### 시나리오 1: 처음 설치하는 사용자

```bash
# 1. 패키지 링크
cd /Users/parkh/Dev/git/Project/claudeSubBatch/scheduler
npm link

# 2. 초기 설정
ccsbatch init
# - 출근 시간 입력 (예: 09:00)
# - 자동 시작 설정 (Y)

# 3. 현재 스케줄 확인
ccsbatch explain

# 4. 스케줄러 상태 확인
launchctl list | grep com.claude.scheduler

# 5. 로그 확인
ccsbatch log
# 또는
tail -f ~/.ccsbatch/logs/scheduler.log
```

### 시나리오 2: 설정 변경

```bash
# 1. 현재 설정 확인
ccsbatch explain

# 2. 출근 시간 변경
ccsbatch config
# - 새로운 시간 입력 (예: 08:00)
# - 자동 재시작 확인

# 3. 변경된 스케줄 확인
ccsbatch explain
```

### 시나리오 3: 스케줄러 중지/재시작

```bash
# 1. 스케줄러 중지
ccsbatch stop

# 2. 상태 확인 (실행 중이 아니어야 함)
ccsbatch explain

# 3. 스케줄러 재시작
ccsbatch setup

# 4. 상태 확인 (실행 중이어야 함)
ccsbatch explain
```

### 시나리오 4: 완전 제거

```bash
# 1. 언인스톨
ccsbatch uninstall
# - 설정 파일 삭제 여부 선택 (y/N)

# 2. 확인
launchctl list | grep com.claude.scheduler  # 아무것도 안 나와야 함
ls ~/.ccsbatch  # 설정 파일 확인 (삭제 선택 시 없어야 함)

# 3. npm link 제거
npm unlink -g ccsbatch
```

## 체크리스트

배포 전 다음 항목들을 확인하세요:

### 기본 명령어 테스트
- [ ] `ccsbatch help` - 도움말 표시
- [ ] `ccsbatch init` - 초기 설정 완료
- [ ] `ccsbatch config` - 설정 변경 및 자동 재시작
- [ ] `ccsbatch status` - 현재 상태 및 다음 실행 시간 표시
- [ ] `ccsbatch explain` - 스케줄 정보 표시
- [ ] `ccsbatch setup` - LaunchAgent 설정
- [ ] `ccsbatch stop` - 스케줄러 중지
- [ ] `ccsbatch log` - 로그 확인
- [ ] `ccsbatch uninstall` - 완전 제거

### 기능 테스트
- [ ] 설정 파일 생성 위치 확인 (`~/.ccsbatch/config.json`)
- [ ] LaunchAgent 생성 확인 (`~/Library/LaunchAgents/com.claude.scheduler.plist`)
- [ ] 스케줄러 실행 상태 확인 (`launchctl list`)
- [ ] 로그 파일 생성 확인 (`~/.ccsbatch/logs/`)
- [ ] 시간 변경 시 자동 재시작 확인
- [ ] 잘못된 시간 형식 입력 시 에러 처리

### 엣지 케이스
- [ ] 설정 파일 없이 명령어 실행 시 에러 메시지
- [ ] LaunchAgent 없이 stop 실행 시 처리
- [ ] 이미 실행 중인 상태에서 setup 재실행
- [ ] config.json 수동 편집 후 explain 실행

### 정리 작업
- [ ] 테스트 중 생성된 설정 파일 삭제 여부 확인
- [ ] LaunchAgent 제거 확인
- [ ] npm link 제거 확인

## 문제 해결

### 명령어를 찾을 수 없음

```bash
# npm link가 제대로 되었는지 확인
which ccsbatch

# 전역 npm bin 경로 확인
npm bin -g

# PATH에 npm bin 경로가 포함되어 있는지 확인
echo $PATH
```

### Permission denied 에러

```bash
# bin 파일에 실행 권한 부여
chmod +x /Users/parkh/Dev/git/Project/claudeSubBatch/scheduler/bin/claude-scheduler.js
```

### LaunchAgent가 작동하지 않음

```bash
# plist 파일 내용 확인
cat ~/Library/LaunchAgents/com.claude.scheduler.plist

# node 경로 확인
which node

# plist의 node 경로와 실제 경로가 일치하는지 확인
# 일치하지 않으면 templates/launchd.plist 수정 필요
```

### 스케줄러가 실행되지 않음

```bash
# 로그 확인
tail -f /Users/parkh/Dev/git/Project/claudeSubBatch/scheduler/logs/stderr.log

# LaunchAgent 상태 확인
launchctl list | grep com.claude.scheduler

# 수동으로 언로드/로드
launchctl unload ~/Library/LaunchAgents/com.claude.scheduler.plist
launchctl load ~/Library/LaunchAgents/com.claude.scheduler.plist
```

## 다음 단계

로컬 테스트가 완료되면:

1. **버전 확인**: `package.json`의 버전이 올바른지 확인
2. **README 업데이트**: 사용법, 예시 등 최신화
3. **CHANGELOG 작성**: 변경 사항 문서화
4. **npm 배포**: `npm publish` 실행

```bash
# 배포 전 최종 확인
npm pack --dry-run

# 실제 배포
npm publish
```
