# Task 05: 메인 스케줄러 구현

## 🎯 목표
node-cron을 사용하여 계산된 시간에 자동으로 Claude CLI를 실행하는 메인 스케줄러 구현

## 📋 체크리스트

### 1. 스케줄러 메인 로직
- [ ] `scheduler.js` 파일 생성
- [ ] config.json 로드
- [ ] 시간 계산 (time-calculator 사용)
- [ ] cron 스케줄 등록

### 2. node-cron 통합
- [ ] 5시간 간격 cron 표현식 생성
- [ ] 스케줄 태스크 등록
- [ ] 스케줄러 시작

### 3. 프로세스 관리
- [ ] 프로세스 시작 로그
- [ ] 종료 시그널 처리 (SIGINT, SIGTERM)
- [ ] 우아한 종료 (Graceful Shutdown)

### 4. 에러 처리
- [ ] config.json 없을 경우
- [ ] CLI 실행 실패 시 계속 실행
- [ ] 스케줄 실행 예외 처리

## 📝 상세 구현

### scheduler.js
```javascript
#!/usr/bin/env node

const cron = require('node-cron');
const { calculateSchedule, generateCronExpression } = require('./time-calculator');
const { runClaudeCLI } = require('./cli-runner');
const fs = require('fs');
const path = require('path');

/**
 * 설정 파일 로드
 */
function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error('ERROR: config.json not found');
    console.error('Please copy config.example.json to config.json and set your work start time');
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
```

## 🧪 테스트

### 수동 실행
```bash
cd scheduler
node scheduler.js
```

### 예상 출력
```
==================================================
Claude 5-Hour Quota Optimizer - Starting...
==================================================
Work Start Time: 08:00
First Message Time: 05:00 (08:00 - 3 hours)
Schedule: 05:00, 10:00, 15:00, 20:00, 01:00
Interval: 300 minutes (5 hours)
Cron Expression: 0 5,10,15,20,1 * * *

✅ Scheduler started successfully
Press Ctrl+C to stop
```

## 📊 동작 흐름

```
1. scheduler.js 시작
   ↓
2. config.json 로드
   ↓
3. calculateSchedule(workStart)
   ↓
4. generateCronExpression(firstTime)
   ↓
5. cron.schedule() 등록
   ↓
6. [대기] → [트리거 시간] → runClaudeCLI()
   ↓
7. 5시간 후 다시 트리거
```

## 🔧 Cron 표현식 설명

### 기본 구조
```
분 시 일 월 요일
```

### 예시: 출근 8시
```
0 5,10,15,20,1 * * *
│ └─────────────┘ │ │ │
│       시        일 월 요일
│
분 (0분)

의미: 매일 5시, 10시, 15시, 20시, 01시 00분에 실행
```

## 🚨 에러 시나리오 처리

### 1. config.json 없음
```
ERROR: config.json not found
Please copy config.example.json to config.json and set your work start time
→ 프로세스 종료 (exit code 1)
```

### 2. CLI 실행 실패
```
Failed to run Claude CLI, will retry at next schedule
→ 계속 실행 (다음 스케줄에서 재시도)
```

### 3. 잘못된 설정 형식
```
ERROR: Invalid workStart format in config.json
Expected format: "HH:mm" (e.g., "09:00")
→ 프로세스 종료 (exit code 1)
```

## ✅ 완료 기준
- [ ] scheduler.js 구현 완료
- [ ] 설정 로드 및 검증 정상 동작
- [ ] cron 스케줄 등록 성공
- [ ] 스케줄 시간에 정확히 실행
- [ ] Ctrl+C로 우아한 종료

## 📌 다음 단계
Task 06: macOS 자동 시작 설정
