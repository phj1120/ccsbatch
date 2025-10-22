# Task 02: 설정 파일 구현

## 🎯 목표
사용자 설정을 관리하는 config.json 파일 및 설정 로더 모듈 구현

## 📋 체크리스트

### 1. config.json 템플릿 생성
- [ ] `scheduler/config.example.json` 템플릿 파일 생성
- [ ] 최소한의 설정 항목만 포함
  - workStart (출근 시간)
  - claudeCodePath (Claude CLI 경로)

### 2. 설정 파일 구조 설계
- [ ] JSON 스키마 정의
- [ ] 기본값 설정
- [ ] 검증 규칙 정의

### 3. 설정 로더 구현 (선택)
- [ ] config.json 읽기 함수
- [ ] 설정 유효성 검증
- [ ] 에러 처리

## 📝 상세 구현

### config.example.json
```json
{
  "workStart": "08:00",
  "claudeCodePath": "claude-code"
}
```

### config.json (사용자가 복사하여 사용)
```json
{
  "workStart": "09:00",
  "claudeCodePath": "/usr/local/bin/claude-code"
}
```

### 설정 항목 설명

#### workStart (필수)
- **타입**: String (HH:mm 형식)
- **설명**: 출근 시간
- **예시**: "08:00", "09:30"
- **검증**: 00:00 ~ 23:59 범위의 유효한 시간

#### claudeCodePath (선택)
- **타입**: String
- **설명**: Claude Code CLI 실행 경로
- **기본값**: "claude-code" (PATH에 있다고 가정)
- **예시**:
  - macOS: "/usr/local/bin/claude-code"
  - Windows: "C:\\Program Files\\Claude\\claude-code.exe"

### 설정 로더 (config-loader.js - 선택적)
```javascript
const fs = require('fs');
const path = require('path');

function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');

  if (!fs.existsSync(configPath)) {
    throw new Error('config.json not found. Please copy config.example.json to config.json');
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // 검증
  if (!config.workStart || !/^\d{2}:\d{2}$/.test(config.workStart)) {
    throw new Error('Invalid workStart format. Use HH:mm format (e.g., "09:00")');
  }

  // 기본값 설정
  if (!config.claudeCodePath) {
    config.claudeCodePath = 'claude-code';
  }

  return config;
}

module.exports = { loadConfig };
```

## ✅ 완료 기준
- [ ] config.example.json 파일 존재
- [ ] 설정 항목 최소화 (workStart만 필수)
- [ ] README에 설정 가이드 포함
- [ ] .gitignore에 config.json 제외 설정

## 📚 사용 예시

### 사용자 설정 과정
```bash
# 1. 템플릿 복사
cp config.example.json config.json

# 2. 설정 편집
vi config.json

# 3. 출근 시간 설정
{
  "workStart": "09:00"
}
```

## 📌 다음 단계
Task 03: 시간 계산 로직 구현
