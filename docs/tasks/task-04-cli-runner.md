# Task 04: Claude CLI 실행 모듈

## 🎯 목표
Claude Code CLI를 실행하여 현재 날짜/시간을 메시지로 전송하는 모듈 구현

## 📋 체크리스트

### 1. CLI 실행 함수 구현
- [ ] `cli-runner.js` 파일 생성
- [ ] cross-spawn을 사용한 크로스 플랫폼 프로세스 실행
- [ ] 현재 날짜/시간 포맷팅 (YYYY-MM-DD HH:mm:ss)

### 2. 에러 처리
- [ ] CLI 실행 실패 시 에러 로깅
- [ ] 타임아웃 설정
- [ ] 재시도 로직 (선택)

### 3. 로깅
- [ ] 실행 시간 기록
- [ ] 성공/실패 상태 로깅
- [ ] 로그 파일에 저장

### 4. 테스트
- [ ] 수동 실행 테스트
- [ ] 다양한 에러 시나리오 테스트

## 📝 상세 구현

### cli-runner.js
```javascript
const spawn = require('cross-spawn');
const fs = require('fs');
const path = require('path');

/**
 * 현재 날짜/시간을 포맷팅
 * @returns {string} "YYYY-MM-DD HH:mm:ss" 형식
 */
function getCurrentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Claude Code CLI 실행
 * @param {string} claudeCodePath - Claude CLI 실행 경로
 * @returns {Promise<void>}
 */
function runClaudeCLI(claudeCodePath = 'claude-code') {
  return new Promise((resolve, reject) => {
    const message = getCurrentTimestamp();

    // Claude Code CLI 실행
    const child = spawn(claudeCodePath, [message], {
      stdio: 'inherit', // 출력을 부모 프로세스와 공유
      timeout: 30000 // 30초 타임아웃
    });

    child.on('error', (error) => {
      logError('Failed to start Claude CLI', error);
      reject(error);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        logSuccess(message);
        resolve();
      } else {
        const error = new Error(`Claude CLI exited with code ${code}`);
        logError('Claude CLI failed', error);
        reject(error);
      }
    });
  });
}

/**
 * 성공 로그 기록
 * @param {string} message - 전송한 메시지
 */
function logSuccess(message) {
  const logEntry = `[${new Date().toISOString()}] SUCCESS: Sent "${message}"\n`;
  appendLog(logEntry);
  console.log(logEntry.trim());
}

/**
 * 에러 로그 기록
 * @param {string} context - 에러 컨텍스트
 * @param {Error} error - 에러 객체
 */
function logError(context, error) {
  const logEntry = `[${new Date().toISOString()}] ERROR: ${context} - ${error.message}\n`;
  appendLog(logEntry);
  console.error(logEntry.trim());
}

/**
 * 로그 파일에 추가
 * @param {string} logEntry - 로그 내용
 */
function appendLog(logEntry) {
  const logFile = path.join(__dirname, 'logs', 'scheduler.log');

  // logs 디렉토리 생성 (없으면)
  const logsDir = path.dirname(logFile);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  fs.appendFileSync(logFile, logEntry, 'utf8');
}

module.exports = {
  runClaudeCLI,
  getCurrentTimestamp
};
```

## 🧪 테스트

### 수동 테스트
```bash
# cli-runner.js를 직접 실행하여 테스트
node -e "require('./cli-runner').runClaudeCLI().catch(console.error)"
```

### 예상 출력
```
[2025-10-22T09:00:00.000Z] SUCCESS: Sent "2025-10-22 09:00:00"
```

### 로그 파일 확인
```bash
cat logs/scheduler.log
```

## 📊 동작 흐름

```
scheduler.js
    ↓
runClaudeCLI()
    ↓
getCurrentTimestamp() → "2025-10-22 09:00:00"
    ↓
spawn('claude-code', ["2025-10-22 09:00:00"])
    ↓
┌─────────────────┐
│  Claude CLI     │
│  메시지 전송    │
└─────────────────┘
    ↓
성공/실패 로깅
```

## 🔧 크로스 플랫폼 고려사항

### macOS/Linux
```javascript
spawn('claude-code', [message])
// PATH에 claude-code가 있어야 함
```

### Windows
```javascript
spawn('claude-code.exe', [message])
// 또는 전체 경로 사용
spawn('C:\\Program Files\\Claude\\claude-code.exe', [message])
```

### cross-spawn 장점
- 플랫폼별 차이를 자동으로 처리
- .bat, .cmd 파일 실행 지원 (Windows)
- PATH 환경변수 자동 해석

## ✅ 완료 기준
- [ ] cli-runner.js 구현 완료
- [ ] getCurrentTimestamp() 정확한 포맷 반환
- [ ] runClaudeCLI() 정상 실행
- [ ] 로그 파일 생성 및 기록 확인
- [ ] Windows/macOS 모두 테스트

## 📌 다음 단계
Task 05: 메인 스케줄러 구현
