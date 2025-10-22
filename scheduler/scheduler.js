#!/usr/bin/env node

const cron = require('node-cron');
const { calculateSchedule, generateCronExpression } = require('./time-calculator');
const { runClaudeCLI } = require('./cli-runner');
const fs = require('fs');
const path = require('path');

/**
 * 설정 파일 경로 찾기
 * 우선순위: 현재 디렉토리 > 홈 디렉토리 > 패키지 디렉토리
 */
function findConfigPath() {
  const currentDirConfig = path.join(process.cwd(), 'config.json');
  const homeDirConfig = path.join(require('os').homedir(), '.ccsbatch', 'config.json');
  const packageDirConfig = path.join(__dirname, 'config.json');

  if (fs.existsSync(currentDirConfig)) {
    return currentDirConfig;
  } else if (fs.existsSync(homeDirConfig)) {
    return homeDirConfig;
  } else if (fs.existsSync(packageDirConfig)) {
    return packageDirConfig;
  }

  return null;
}

/**
 * 설정 파일 로드
 */
function loadConfig() {
  const configPath = findConfigPath();

  if (!configPath) {
    console.error('ERROR: config.json not found');
    console.error('');
    console.error('Please run one of the following:');
    console.error('  1. ccsbatch init                    (creates ~/.ccsbatch/config.json)');
    console.error('  2. Copy config.json to current dir  (for local use)');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // 검증
  if (!config.workStart || !/^\d{2}:\d{2}$/.test(config.workStart)) {
    console.error('ERROR: Invalid workStart format in config.json');
    console.error('Expected format: "HH:mm" (e.g., "09:00")');
    process.exit(1);
  }

  return config;
}

/**
 * 메인 스케줄러 시작
 */
function startScheduler() {
  console.log('='.repeat(50));
  console.log('Claude 5-Hour Quota Optimizer - Starting...');
  console.log('='.repeat(50));

  // 설정 로드
  const config = loadConfig();
  console.log(`Work Start Time: ${config.workStart}`);

  // 스케줄 계산
  const { firstTime, schedule, interval } = calculateSchedule(config.workStart);
  console.log(`First Message Time: ${firstTime} (${config.workStart} - 3 hours)`);
  console.log(`Schedule: ${schedule.join(', ')}`);
  console.log(`Interval: ${interval} minutes (5 hours)`);

  // cron 표현식 생성
  const cronExpression = generateCronExpression(firstTime);
  console.log(`Cron Expression: ${cronExpression}`);

  // 스케줄 등록
  const task = cron.schedule(cronExpression, async () => {
    console.log('\n' + '='.repeat(50));
    console.log(`Scheduled task triggered at ${new Date().toISOString()}`);
    console.log('='.repeat(50));

    try {
      await runClaudeCLI(config.claudeCodePath || 'claude-code');
    } catch (error) {
      console.error('Failed to run Claude CLI, will retry at next schedule');
    }
  });

  console.log('\n✅ Scheduler started successfully');
  console.log('Press Ctrl+C to stop\n');

  // 종료 시그널 처리
  process.on('SIGINT', () => {
    console.log('\n\nReceived SIGINT, stopping scheduler...');
    task.stop();
    console.log('Scheduler stopped gracefully');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\nReceived SIGTERM, stopping scheduler...');
    task.stop();
    console.log('Scheduler stopped gracefully');
    process.exit(0);
  });
}

// 스케줄러 시작
if (require.main === module) {
  startScheduler();
}

module.exports = { startScheduler };
