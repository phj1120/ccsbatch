# Task 03: 시간 계산 로직 구현

## 🎯 목표
출근 시간을 기반으로 첫 메시지 전송 시간과 5시간 간격 스케줄 계산

## 📋 체크리스트

### 1. 시간 계산 함수 구현
- [ ] `time-calculator.js` 파일 생성
- [ ] 첫 전송 시간 계산 함수 (workStart - 3시간)
- [ ] 5시간 간격 스케줄 생성 함수

### 2. 시간 파싱 및 변환
- [ ] "HH:mm" 문자열을 시간 객체로 변환
- [ ] 시간 연산 (3시간 빼기)
- [ ] 24시간 범위 처리 (00:00 넘어가는 경우)

### 3. 스케줄 생성
- [ ] 첫 시간부터 5시간씩 증가하는 배열 생성
- [ ] cron 표현식으로 변환

### 4. 단위 테스트
- [ ] 다양한 출근 시간으로 테스트
- [ ] 경계값 테스트 (00:00, 23:59 등)

## 📝 상세 구현

### time-calculator.js
```javascript
/**
 * 출근 시간 기반 최적 스케줄 계산
 * @param {string} workStart - "HH:mm" 형식의 출근 시간
 * @returns {object} 계산된 스케줄 정보
 */
function calculateSchedule(workStart) {
  // 출근 시간 파싱
  const [hours, minutes] = workStart.split(':').map(Number);

  // 첫 메시지 시간 = 출근 시간 - 3시간
  let firstHour = hours - 3;
  if (firstHour < 0) {
    firstHour += 24; // 전날로 넘어가는 경우
  }

  const firstTime = `${String(firstHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  // 5시간 간격 스케줄 생성
  const schedule = [];
  let currentHour = firstHour;

  for (let i = 0; i < 5; i++) { // 하루 최대 5회
    const time = `${String(currentHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    schedule.push(time);
    currentHour = (currentHour + 5) % 24;
  }

  return {
    firstTime,
    schedule,
    interval: 300 // 5시간 = 300분
  };
}

/**
 * 시간을 cron 표현식으로 변환
 * @param {string} time - "HH:mm" 형식
 * @returns {string} cron 표현식
 */
function timeToCron(time) {
  const [hours, minutes] = time.split(':');
  return `${minutes} ${hours} * * *`;
}

/**
 * 5시간 간격 cron 표현식 생성
 * @param {string} firstTime - 첫 실행 시간
 * @returns {string} cron 표현식
 */
function generateCronExpression(firstTime) {
  const [hours, minutes] = firstTime.split(':').map(Number);

  // 5시간마다 실행: 시작 시간부터 5시간 간격
  const cronHours = [];
  let currentHour = hours;
  for (let i = 0; i < 5; i++) {
    cronHours.push(currentHour);
    currentHour = (currentHour + 5) % 24;
  }

  return `${minutes} ${cronHours.join(',')}} * * *`;
}

module.exports = {
  calculateSchedule,
  timeToCron,
  generateCronExpression
};
```

## 🧪 테스트 케이스

### 케이스 1: 출근 08:00
```javascript
calculateSchedule("08:00")
// 결과:
// {
//   firstTime: "05:00",
//   schedule: ["05:00", "10:00", "15:00", "20:00", "01:00"],
//   interval: 300
// }
```

### 케이스 2: 출근 09:30
```javascript
calculateSchedule("09:30")
// 결과:
// {
//   firstTime: "06:30",
//   schedule: ["06:30", "11:30", "16:30", "21:30", "02:30"],
//   interval: 300
// }
```

### 케이스 3: 출근 02:00 (자정 넘어가는 경우)
```javascript
calculateSchedule("02:00")
// 결과:
// {
//   firstTime: "23:00", // 전날 23시
//   schedule: ["23:00", "04:00", "09:00", "14:00", "19:00"],
//   interval: 300
// }
```

## 📊 동작 시각화

### 출근 8시 예시
```
시간축: 00:00 -------- 05:00 -------- 10:00 -------- 15:00 -------- 20:00 -------- 24:00
                  ↑              ↑              ↑              ↑
               첫 전송      2차 전송      3차 전송      4차 전송
               (출근-3h)

업무시간:              [========== 08:00 - 18:00 ==========]

할당량:    [슬롯1: 05-10] [슬롯2: 10-15] [슬롯3: 15-20]
```

## ✅ 완료 기준
- [ ] time-calculator.js 구현 완료
- [ ] 모든 테스트 케이스 통과
- [ ] 24시간 경계 처리 정상 동작
- [ ] cron 표현식 생성 정상 동작

## 📌 다음 단계
Task 04: CLI 실행 모듈 구현
