# Task 01: 프로젝트 초기 설정

## 🎯 목표
Node.js 프로젝트 초기화 및 디렉토리 구조 생성, 필요한 의존성 패키지 설치

## 📋 체크리스트

### 1. 디렉토리 구조 생성
- [ ] `scheduler/` 루트 디렉토리 생성
- [ ] `scheduler/setup/` 디렉토리 생성
- [ ] `scheduler/templates/` 디렉토리 생성
- [ ] `scheduler/logs/` 디렉토리 생성

### 2. package.json 생성
- [ ] npm init으로 package.json 생성
- [ ] 프로젝트 메타데이터 설정
  - name: "claude-scheduler"
  - version: "1.0.0"
  - description: "Claude 5-hour quota optimizer"
  - main: "scheduler.js"
- [ ] scripts 섹션 추가

### 3. 의존성 패키지 설치
- [ ] `node-cron` 설치 (스케줄링)
- [ ] `cross-spawn` 설치 (크로스 플랫폼 프로세스 실행)

### 4. .gitignore 설정
- [ ] `scheduler/.gitignore` 파일 생성
- [ ] 제외 항목 추가:
  - `node_modules/`
  - `config.json` (사용자별 설정)
  - `logs/*.log` (로그 파일)

## 📝 상세 구현

### 디렉토리 구조
```bash
mkdir -p scheduler/setup
mkdir -p scheduler/templates
mkdir -p scheduler/logs
cd scheduler
```

### package.json
```json
{
  "name": "claude-scheduler",
  "version": "1.0.0",
  "description": "Automated scheduler to optimize Claude 5-hour quota usage",
  "main": "scheduler.js",
  "scripts": {
    "start": "node scheduler.js",
    "setup:macos": "bash setup/macos-setup.sh",
    "setup:windows": "powershell -ExecutionPolicy Bypass -File setup/windows-setup.ps1",
    "uninstall": "bash setup/uninstall.sh"
  },
  "keywords": ["claude", "scheduler", "automation"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "node-cron": "^3.0.3",
    "cross-spawn": "^7.0.3"
  }
}
```

### 패키지 설치
```bash
npm install node-cron cross-spawn
```

### .gitignore
```
node_modules/
config.json
logs/*.log
!logs/.gitkeep
```

## ✅ 완료 기준
- [ ] `scheduler/` 디렉토리 구조 완성
- [ ] package.json 생성 및 의존성 설치 완료
- [ ] .gitignore 설정 완료
- [ ] `npm start` 명령어 실행 가능 (에러 발생해도 OK)

## 📌 다음 단계
Task 02: config.json 설정 파일 구현
