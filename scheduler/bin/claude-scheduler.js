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
  start              Start the scheduler (default)
  setup              Setup auto-start for your OS
  log                View scheduler logs
  uninstall          Remove auto-start configuration
  help               Show this help message

Examples:
  ccsbatch init          # Interactive setup
  ccsbatch config        # Change work start time
  ccsbatch log           # View logs
  ccsbatch setup         # Setup auto-start

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
    workStart: workStart,
    claudeCodePath: 'claude-code'
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
  console.log('💡 If auto-start is enabled, restart is required for changes to take effect.');
  console.log('   You can restart your system or manually restart the scheduler.');
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

// 명령어 처리
switch (command) {
  case 'init':
    initConfig();
    break;

  case 'config':
    changeConfig();
    break;

  case 'log':
    viewLog();
    break;

  case 'setup':
    setupAutoStart();
    break;

  case 'uninstall':
    uninstallAutoStart();
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
