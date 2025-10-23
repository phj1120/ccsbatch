/**
 * 실제 로그인한 사용자 감지 유틸리티 (Windows용)
 * Administrator 권한으로 실행되어도 실제 사용자를 찾습니다
 */

const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

/**
 * 실제 로그인한 사용자 정보 가져오기
 * @returns {{ username: string, homeDirectory: string }}
 */
function getRealUser() {
  const platform = process.platform;

  if (platform !== 'win32') {
    // macOS/Linux는 os.homedir()만 사용
    return {
      username: os.userInfo().username,
      homeDirectory: os.homedir()
    };
  }

  // Windows: whoami 명령어로 현재 실행 중인 사용자 가져오기
  try {
    // whoami 실행 (형식: DOMAIN\Username 또는 COMPUTERNAME\Username)
    const whoamiOutput = execSync('whoami', { encoding: 'utf8' }).trim();
    console.log(`[get-real-user] whoami output: ${whoamiOutput}`);

    // 백슬래시로 분리하여 사용자명만 추출
    const parts = whoamiOutput.split('\\');
    const currentUser = parts.length > 1 ? parts[1] : parts[0];

    const userHome = path.join('C:', 'Users', currentUser);

    // 홈 디렉토리 존재 확인
    if (fs.existsSync(userHome)) {
      console.log(`[get-real-user] Using current user from whoami: ${currentUser}`);
      return {
        username: currentUser,
        homeDirectory: userHome
      };
    }

    console.log(`[get-real-user] Warning: Home directory not found: ${userHome}`);
  } catch (error) {
    console.log(`[get-real-user] whoami failed: ${error.message}`);
  }

  // Fallback: os 모듈 사용
  const currentUser = os.userInfo().username;
  const userHome = os.homedir();
  console.log(`[get-real-user] Fallback to os module: ${currentUser}`);

  return {
    username: currentUser,
    homeDirectory: userHome
  };
}

module.exports = {
  getRealUser
};
