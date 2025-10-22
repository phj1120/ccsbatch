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
function runClaudeCLI(claudeCodePath = 'claude') {
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
  // 로그 파일 경로: 홈 디렉토리 우선, 없으면 패키지 디렉토리
  const homeDir = require('os').homedir();
  const homeLogs = path.join(homeDir, '.ccsbatch', 'logs');
  const packageLogs = path.join(__dirname, 'logs');

  // 홈 디렉토리에 .ccsbatch가 있으면 거기에 로그 저장
  const logsDir = fs.existsSync(path.join(homeDir, '.ccsbatch')) ? homeLogs : packageLogs;
  const logFile = path.join(logsDir, 'scheduler.log');

  // logs 디렉토리 생성 (없으면)
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  fs.appendFileSync(logFile, logEntry, 'utf8');
}

module.exports = {
  runClaudeCLI,
  getCurrentTimestamp
};
