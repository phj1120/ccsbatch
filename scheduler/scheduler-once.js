#!/usr/bin/env node

/**
 * One-time scheduler - 한 번만 실행하고 종료
 * Task Scheduler가 정확한 시간에 이 스크립트를 실행함
 */

const { runClaudeCLI } = require('./cli-runner');
const fs = require('fs');
const path = require('path');

/**
 * 설정 파일 로드
 */
function loadConfig() {
  const homeDirConfig = path.join(require('os').homedir(), '.ccsbatch', 'config.json');

  if (!fs.existsSync(homeDirConfig)) {
    console.error('ERROR: config.json not found at', homeDirConfig);
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(homeDirConfig, 'utf8'));
}

/**
 * 메인 실행
 */
async function runOnce() {
  console.log('='.repeat(50));
  console.log(`Claude Scheduler - Running at ${new Date().toISOString()}`);
  console.log('='.repeat(50));

  const config = loadConfig();

  try {
    await runClaudeCLI(config.claudeCodePath || 'claude');
    console.log('✅ Task completed successfully');
  } catch (error) {
    console.error('❌ Task failed:', error.message);
    process.exit(1);
  }
}

// 즉시 실행하고 종료
runOnce().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
