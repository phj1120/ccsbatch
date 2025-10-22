#!/usr/bin/env node

const { startScheduler } = require('../scheduler');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const command = process.argv[2];

function showHelp() {
  console.log(`
ccsbatch - Claude Scheduler Batch

Usage:
  ccsbatch [command]

Commands:
  init               Interactive setup (asks for work start time)
  config             Change work start time
  status             Check scheduler status
  explain            Show detailed schedule information
  start              Start the scheduler (default)
  stop               Stop the scheduler
  setup              Setup auto-start for your OS
  log                View scheduler logs
  uninstall          Remove auto-start and optionally delete config
  help               Show this help message

Examples:
  ccsbatch init          # Interactive setup
  ccsbatch status        # Check status
  ccsbatch config        # Change work start time
  ccsbatch explain       # Show detailed schedule
  ccsbatch stop          # Stop the scheduler
  ccsbatch log           # View logs
  ccsbatch setup         # Setup auto-start
  ccsbatch uninstall     # Remove everything

For more information, visit:
https://github.com/phj1120/ccsbatch
  `);
}

async function initConfig() {
  const os = require('os');
  const readline = require('readline');
  const homeDir = os.homedir();
  const ccsbatchDir = path.join(homeDir, '.ccsbatch');
  const configPath = path.join(ccsbatchDir, 'config.json');
  const logsDir = path.join(ccsbatchDir, 'logs');

  // .ccsbatch 디렉토리 생성
  if (!fs.existsSync(ccsbatchDir)) {
    fs.mkdirSync(ccsbatchDir, { recursive: true });
  }

  // logs 디렉토리 생성
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // config.json이 이미 있는지 확인
  if (fs.existsSync(configPath)) {
    console.log('⚠️  Configuration already exists');
    console.log('');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('Do you want to reconfigure? (y/N): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      process.exit(0);
    }
  }

  // 출근 시간 입력받기
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('');
  console.log('='.repeat(50));
  console.log('ccsbatch - Initial Setup');
  console.log('='.repeat(50));
  console.log('');

  const workStart = await new Promise(resolve => {
    rl.question('Enter your work start time (HH:mm, e.g., 09:00): ', resolve);
  });

  // 시간 형식 검증
  if (!/^\d{2}:\d{2}$/.test(workStart)) {
    console.log('');
    console.log('❌ Invalid time format. Please use HH:mm format (e.g., 09:00)');
    rl.close();
    process.exit(1);
  }

  const [hours, minutes] = workStart.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    console.log('');
    console.log('❌ Invalid time. Hours must be 00-23 and minutes must be 00-59');
    rl.close();
    process.exit(1);
  }

  // 자동 시작 설정 여부
  const shouldSetupAutoStart = await new Promise(resolve => {
    rl.question('Setup auto-start on system boot? (Y/n): ', resolve);
  });

  rl.close();

  // config.json 생성
  const config = {
    workStart: workStart
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

  console.log('');
  console.log('✅ Configuration saved!');
  console.log(`   Location: ${configPath}`);
  console.log(`   Work Start: ${workStart}`);
  console.log('');

  // 자동 시작 설정
  if (shouldSetupAutoStart.toLowerCase() !== 'n') {
    console.log('Setting up auto-start...');
    console.log('');
    setupAutoStart();
  } else {
    console.log('✅ Setup complete!');
    console.log('');
    console.log('Scheduler will start automatically at calculated times.');
    console.log('To manually setup auto-start later, run: ccsbatch setup');
  }
}

function setupAutoStart() {
  const platform = process.platform;

  console.log('Setting up auto-start...');
  console.log('');

  if (platform === 'darwin') {
    const scriptPath = path.join(__dirname, '..', 'setup', 'macos-setup.sh');
    try {
      execSync(`bash "${scriptPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to setup auto-start');
      process.exit(1);
    }
  } else if (platform === 'win32') {
    const scriptPath = path.join(__dirname, '..', 'setup', 'windows-setup.ps1');
    try {
      execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to setup auto-start');
      process.exit(1);
    }
  } else {
    console.log('⚠️  Auto-start setup is only supported on macOS and Windows');
    console.log('');
    console.log('For Linux, you can manually setup a systemd service or cron job.');
    console.log('See README.md for more information.');
    process.exit(1);
  }
}

function stopScheduler() {
  const platform = process.platform;

  console.log('Stopping scheduler...');
  console.log('');

  if (platform === 'darwin') {
    const plistPath = path.join(require('os').homedir(), 'Library', 'LaunchAgents', 'com.claude.scheduler.plist');

    if (!fs.existsSync(plistPath)) {
      console.log('⚠️  Scheduler is not running (LaunchAgent not found)');
      process.exit(0);
    }

    try {
      execSync(`launchctl unload "${plistPath}"`, { stdio: 'inherit' });
      console.log('');
      console.log('✅ Scheduler stopped successfully');
      console.log('');
      console.log('To start again, run: ccsbatch setup');
    } catch (error) {
      console.error('Failed to stop scheduler');
      process.exit(1);
    }
  } else if (platform === 'win32') {
    console.log('⚠️  Stop command for Windows is not yet implemented');
    console.log('Please use Task Manager to stop the scheduler task');
    process.exit(1);
  } else {
    console.log('⚠️  Stop command is only supported on macOS and Windows');
    process.exit(1);
  }
}

function uninstallAutoStart() {
  const platform = process.platform;

  console.log('Removing auto-start configuration...');
  console.log('');

  if (platform === 'darwin') {
    const scriptPath = path.join(__dirname, '..', 'setup', 'uninstall.sh');
    try {
      execSync(`bash "${scriptPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to uninstall auto-start');
      process.exit(1);
    }
  } else if (platform === 'win32') {
    const scriptPath = path.join(__dirname, '..', 'setup', 'windows-uninstall.ps1');
    try {
      execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to uninstall auto-start');
      process.exit(1);
    }
  } else {
    console.log('⚠️  Auto-start uninstall is only supported on macOS and Windows');
    process.exit(1);
  }
}

async function uninstallAll() {
  const os = require('os');
  const readline = require('readline');
  const homeDir = os.homedir();
  const ccsbatchDir = path.join(homeDir, '.ccsbatch');

  console.log('');
  console.log('='.repeat(50));
  console.log('Uninstall ccsbatch');
  console.log('='.repeat(50));
  console.log('');

  // 1. LaunchAgent/Task 제거
  console.log('Step 1: Removing auto-start configuration...');
  uninstallAutoStart();

  // 2. 설정 파일 삭제 여부 확인
  if (fs.existsSync(ccsbatchDir)) {
    console.log('');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('Do you want to delete config files in ~/.ccsbatch? (y/N): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() === 'y') {
      console.log('');
      console.log('Removing config files...');
      try {
        fs.rmSync(ccsbatchDir, { recursive: true, force: true });
        console.log(`✅ Config directory removed: ${ccsbatchDir}`);
      } catch (error) {
        console.error(`Failed to remove config directory: ${error.message}`);
      }
    } else {
      console.log('');
      console.log(`ℹ️  Config files kept at: ${ccsbatchDir}`);
      console.log('To manually delete later, run: rm -rf ~/.ccsbatch');
    }
  }

  console.log('');
  console.log('✅ Uninstall complete!');
  console.log('');
}

async function changeConfig() {
  const os = require('os');
  const readline = require('readline');
  const homeDir = os.homedir();
  const configPath = path.join(homeDir, '.ccsbatch', 'config.json');

  // config.json 확인
  if (!fs.existsSync(configPath)) {
    console.log('❌ Configuration not found');
    console.log('Please run: ccsbatch init');
    process.exit(1);
  }

  // 현재 설정 읽기
  const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  console.log('');
  console.log('='.repeat(50));
  console.log('Change Configuration');
  console.log('='.repeat(50));
  console.log('');
  console.log(`Current work start time: ${currentConfig.workStart}`);
  console.log('');

  // 새로운 출근 시간 입력받기
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const workStart = await new Promise(resolve => {
    rl.question('Enter new work start time (HH:mm, or press Enter to keep current): ', resolve);
  });

  rl.close();

  // 입력이 없으면 취소
  if (!workStart.trim()) {
    console.log('');
    console.log('No changes made.');
    process.exit(0);
  }

  // 시간 형식 검증
  if (!/^\d{2}:\d{2}$/.test(workStart)) {
    console.log('');
    console.log('❌ Invalid time format. Please use HH:mm format (e.g., 09:00)');
    process.exit(1);
  }

  const [hours, minutes] = workStart.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    console.log('');
    console.log('❌ Invalid time. Hours must be 00-23 and minutes must be 00-59');
    process.exit(1);
  }

  // 설정 업데이트
  currentConfig.workStart = workStart;
  fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf8');

  console.log('');
  console.log('✅ Configuration updated!');
  console.log(`   Work Start: ${workStart}`);
  console.log('');

  // 자동 재시작
  const platform = process.platform;
  if (platform === 'darwin') {
    const plistPath = path.join(homeDir, 'Library', 'LaunchAgents', 'com.claude.scheduler.plist');

    if (fs.existsSync(plistPath)) {
      console.log('Restarting scheduler with new configuration...');
      console.log('');

      try {
        // 기존 서비스 중지
        execSync(`launchctl unload "${plistPath}"`, { stdio: 'pipe' });

        // 서비스 재시작
        execSync(`launchctl load "${plistPath}"`, { stdio: 'pipe' });

        console.log('✅ Scheduler restarted successfully!');
        console.log('');

        // 새로운 스케줄 표시
        const { calculateSchedule } = require('../time-calculator');
        const { firstTime, schedule } = calculateSchedule(workStart);
        console.log('New schedule:');
        console.log(`  First message: ${firstTime}`);
        console.log(`  All times: ${schedule.join(', ')}`);
        console.log('');
      } catch (error) {
        console.error('⚠️  Failed to restart scheduler automatically');
        console.error('Please run: ccsbatch stop && ccsbatch setup');
      }
    } else {
      console.log('💡 Scheduler is not running. To start it, run: ccsbatch setup');
    }
  } else if (platform === 'win32') {
    console.log('💡 Please restart the scheduler manually on Windows');
    console.log('   You can restart your system or re-run: ccsbatch setup');
  }
}

function viewLog() {
  const os = require('os');
  const homeDir = os.homedir();
  const logPath = path.join(homeDir, '.ccsbatch', 'logs', 'scheduler.log');

  if (!fs.existsSync(logPath)) {
    console.log('');
    console.log('ℹ️  No logs found yet');
    console.log('');
    console.log('Logs will be created when the scheduler runs.');
    console.log(`Location: ${logPath}`);
    process.exit(0);
  }

  // 로그 파일 읽기
  const logs = fs.readFileSync(logPath, 'utf8');
  const lines = logs.split('\n').filter(line => line.trim());

  console.log('');
  console.log('='.repeat(60));
  console.log(`Scheduler Logs (${logPath})`);
  console.log('='.repeat(60));
  console.log('');

  if (lines.length === 0) {
    console.log('No log entries yet.');
  } else {
    // 마지막 20줄만 표시
    const recentLines = lines.slice(-20);
    recentLines.forEach(line => console.log(line));

    if (lines.length > 20) {
      console.log('');
      console.log(`... (${lines.length - 20} more lines)`);
      console.log('');
      console.log('To view all logs:');
      console.log(`  cat ${logPath}`);
      console.log('');
      console.log('To follow logs in real-time:');
      console.log(`  tail -f ${logPath}`);
    }
  }

  console.log('');
}

function explainSchedule() {
  const os = require('os');
  const homeDir = os.homedir();
  const configPath = path.join(homeDir, '.ccsbatch', 'config.json');

  // config.json 확인
  if (!fs.existsSync(configPath)) {
    console.log('');
    console.log('❌ Configuration not found');
    console.log('Please run: ccsbatch init');
    console.log('');
    process.exit(1);
  }

  // 설정 읽기
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { calculateSchedule, generateCronExpression } = require('../time-calculator');
  const { firstTime, schedule, interval } = calculateSchedule(config.workStart);
  const cronExpression = generateCronExpression(firstTime);

  console.log('');
  console.log('='.repeat(60));
  console.log('📅  Claude Scheduler - Current Configuration');
  console.log('='.repeat(60));
  console.log('');

  // 설정 정보
  console.log('⚙️  Configuration:');
  console.log(`   Work Start Time: ${config.workStart}`);
  console.log(`   First Message Time: ${firstTime} (${config.workStart} - 3 hours)`);
  console.log(`   Interval: ${interval} minutes (5 hours)`);
  console.log('');

  // 스케줄 정보
  console.log('🕐  Schedule (5 times per day):');
  schedule.forEach((time, index) => {
    const emoji = ['🕐', '🕘', '🕑', '🕖', '🕛'][index] || '⏰';
    console.log(`   ${emoji}  ${time}`);
  });
  console.log('');

  // Cron 표현식
  console.log('⚡️  Cron Expression:');
  console.log(`   ${cronExpression}`);
  console.log('');

  // 스케줄러 실행 상태 확인
  const platform = process.platform;
  if (platform === 'darwin') {
    const plistPath = path.join(homeDir, 'Library', 'LaunchAgents', 'com.claude.scheduler.plist');

    if (fs.existsSync(plistPath)) {
      try {
        const output = execSync('launchctl list | grep com.claude.scheduler', { encoding: 'utf8' });
        if (output.trim()) {
          console.log('✅  Scheduler Status: Running');
          console.log('');
          console.log('💡  Tips:');
          console.log('   - View logs: ccsbatch log');
          console.log('   - Change time: ccsbatch config');
          console.log('   - Stop scheduler: ccsbatch stop');
        } else {
          console.log('⚠️  Scheduler Status: Not Running');
          console.log('');
          console.log('💡  To start: ccsbatch setup');
        }
      } catch (error) {
        console.log('⚠️  Scheduler Status: Not Running');
        console.log('');
        console.log('💡  To start: ccsbatch setup');
      }
    } else {
      console.log('⚠️  Scheduler Status: Not Setup');
      console.log('');
      console.log('💡  To setup auto-start: ccsbatch setup');
    }
  } else if (platform === 'win32') {
    console.log('ℹ️  Scheduler Status: Check Task Scheduler on Windows');
  }

  console.log('');
}

function checkStatus() {
  const os = require('os');
  const homeDir = os.homedir();
  const configPath = path.join(homeDir, '.ccsbatch', 'config.json');

  console.log('');
  console.log('='.repeat(50));
  console.log('📊  ccsbatch - Status');
  console.log('='.repeat(50));
  console.log('');

  // config.json 확인
  if (!fs.existsSync(configPath)) {
    console.log('⚠️  Status: Not Configured');
    console.log('');
    console.log('💡 Get started: ccsbatch init');
    console.log('');
    process.exit(0);
  }

  // 설정 읽기
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { calculateSchedule } = require('../time-calculator');
  const { firstTime, schedule } = calculateSchedule(config.workStart);

  // 스케줄러 실행 상태 확인
  const platform = process.platform;
  let isRunning = false;
  let statusEmoji = '⚠️';
  let statusText = 'Not Running';

  if (platform === 'darwin') {
    const plistPath = path.join(homeDir, 'Library', 'LaunchAgents', 'com.claude.scheduler.plist');

    if (fs.existsSync(plistPath)) {
      try {
        const output = execSync('launchctl list | grep com.claude.scheduler', { encoding: 'utf8' });
        if (output.trim()) {
          isRunning = true;
          statusEmoji = '✅';
          statusText = 'Running';
        }
      } catch (error) {
        // Not running
      }
    } else {
      statusEmoji = '❌';
      statusText = 'Not Setup';
    }
  } else if (platform === 'win32') {
    statusEmoji = 'ℹ️';
    statusText = 'Check Task Scheduler';
  }

  // 상태 출력
  console.log(`${statusEmoji}  Scheduler: ${statusText}`);
  console.log(`⚙️   Work Start: ${config.workStart}`);
  console.log('');

  // 다음 실행 예정 시간
  if (isRunning || statusText === 'Not Running') {
    console.log('🕐  Next Scheduled Times:');

    // 현재 시간
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // 다음 3개 스케줄 찾기
    const nextTimes = [];
    for (let i = 0; i < schedule.length * 2; i++) { // 2일치 확인
      const scheduleTime = schedule[i % schedule.length];
      const [hour, minute] = scheduleTime.split(':').map(Number);
      let timeInMinutes = hour * 60 + minute;

      const dayOffset = Math.floor(i / schedule.length);
      if (dayOffset > 0) {
        timeInMinutes += dayOffset * 24 * 60;
      }

      if (timeInMinutes > currentTimeInMinutes) {
        const diff = timeInMinutes - currentTimeInMinutes;
        const hoursUntil = Math.floor(diff / 60);
        const minutesUntil = diff % 60;

        let timeLabel = scheduleTime;
        if (dayOffset > 0) {
          timeLabel += ' (tomorrow)';
        }

        let untilText = '';
        if (hoursUntil > 0) {
          untilText = `in ${hoursUntil}h ${minutesUntil}m`;
        } else {
          untilText = `in ${minutesUntil}m`;
        }

        nextTimes.push({ time: timeLabel, until: untilText });

        if (nextTimes.length >= 3) break;
      }
    }

    if (nextTimes.length > 0) {
      nextTimes.forEach((item, index) => {
        const emoji = index === 0 ? '→' : ' ';
        console.log(`   ${emoji}  ${item.time} ${item.until}`);
      });
    } else {
      console.log('   No upcoming schedules found');
    }
    console.log('');
  }

  // 액션 제안
  if (statusText === 'Running') {
    console.log('💡  Quick Actions:');
    console.log('   - View details: ccsbatch explain');
    console.log('   - View logs: ccsbatch log');
    console.log('   - Change time: ccsbatch config');
    console.log('   - Stop: ccsbatch stop');
  } else if (statusText === 'Not Running') {
    console.log('💡  To start: ccsbatch setup');
  } else if (statusText === 'Not Setup') {
    console.log('💡  To setup: ccsbatch setup');
  }

  console.log('');
}

// 명령어 처리
switch (command) {
  case 'init':
    initConfig();
    break;

  case 'config':
    changeConfig();
    break;

  case 'status':
    checkStatus();
    break;

  case 'explain':
    explainSchedule();
    break;

  case 'log':
    viewLog();
    break;

  case 'setup':
    setupAutoStart();
    break;

  case 'stop':
    stopScheduler();
    break;

  case 'uninstall':
    uninstallAll();
    break;

  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;

  case 'start':
  case undefined:
    // 기본 동작: 스케줄러 시작
    startScheduler();
    break;

  default:
    console.log(`Unknown command: ${command}`);
    console.log('');
    showHelp();
    process.exit(1);
}
