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

    console.log(`[DEBUG] Executing: ${claudeCodePath} "${message}"`);

    // Claude Code CLI 실행
    const child = spawn(claudeCodePath, [message], {
      stdio: 'inherit', // 출력을 부모 프로세스와 공유
      shell: true, // Windows에서 .bat, .cmd 파일 실행을 위해 필요
      windowsHide: true // Windows에서 콘솔 창 숨기기
    });

    let isResolved = false;
    let timeoutId = null;

    // 30초 타임아웃 설정
    timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        child.kill();
        const error = new Error('Claude CLI timeout after 30 seconds');
        logError('Claude CLI timeout', error);
        reject(error);
      }
    }, 30000);

    child.on('error', (error) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        logError('Failed to start Claude CLI', error);
        reject(error);
      }
    });

    child.on('exit', (code, signal) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);

        console.log(`[DEBUG] Claude CLI exited with code: ${code}, signal: ${signal}`);

        // Windows에서 shell:true로 실행 시 code가 null일 수 있음
        // signal이 null이고 정상 종료된 경우 성공으로 간주
        if (code === 0 || (code === null && signal === null)) {
          logSuccess(message);
          resolve();
        } else {
          const error = new Error(`Claude CLI exited with code ${code}, signal ${signal}`);
          logError('Claude CLI failed', error);
          reject(error);
        }
      }
    });

    child.on('close', (code, signal) => {
      // close 이벤트는 exit 이후에 발생하므로 이미 처리되었을 수 있음
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);

        console.log(`[DEBUG] Claude CLI closed with code: ${code}, signal: ${signal}`);

        if (code === 0 || (code === null && signal === null)) {
          logSuccess(message);
          resolve();
        } else {
          const error = new Error(`Claude CLI closed with code ${code}, signal ${signal}`);
          logError('Claude CLI failed', error);
          reject(error);
        }
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
