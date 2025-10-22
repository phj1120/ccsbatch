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

  return `${minutes} ${cronHours.join(',')} * * *`;
}

module.exports = {
  calculateSchedule,
  timeToCron,
  generateCronExpression
};
