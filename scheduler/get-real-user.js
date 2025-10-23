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

  // Windows: 실제 로그인한 사용자 감지
  const currentUser = os.userInfo().username;

  // 방법 1: query user로 콘솔 세션 사용자 찾기
  try {
    const queryOutput = execSync('query user', { encoding: 'utf8' });
    const lines = queryOutput.split('\n');

    for (const line of lines) {
      // ">" 표시가 있는 줄이 현재 활성 세션
      if (line.includes('>') && line.includes('console')) {
        const match = line.match(/>\s*(\S+)/);
        if (match) {
          const realUser = match[1];
          const userHome = path.join('C:', 'Users', realUser);

          if (fs.existsSync(userHome)) {
            console.log(`[get-real-user] Detected console user: ${realUser}`);
            return {
              username: realUser,
              homeDirectory: userHome
            };
          }
        }
      }
    }
  } catch (error) {
    // query user 실패 시 계속 진행
  }

  // 방법 2: USERNAME이 Administrator/SYSTEM이면 최근 사용자 찾기
  if (currentUser === 'Administrator' || currentUser === 'SYSTEM') {
    try {
      const usersDir = path.join('C:', 'Users');
      const excludeUsers = ['Administrator', 'Public', 'Default', 'Default User'];

      const userDirs = fs.readdirSync(usersDir)
        .filter(name => {
          const userPath = path.join(usersDir, name);
          return fs.statSync(userPath).isDirectory() && !excludeUsers.includes(name);
        })
        .map(name => ({
          name,
          path: path.join(usersDir, name),
          mtime: fs.statSync(path.join(usersDir, name)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      if (userDirs.length > 0) {
        const recentUser = userDirs[0];
        console.log(`[get-real-user] Using most recent user: ${recentUser.name}`);
        return {
          username: recentUser.name,
          homeDirectory: recentUser.path
        };
      }
    } catch (error) {
      // 실패 시 계속 진행
    }
  }

  // 방법 3: Fallback - 현재 사용자 사용
  const userHome = os.homedir();
  console.log(`[get-real-user] Using current user: ${currentUser}`);

  return {
    username: currentUser,
    homeDirectory: userHome
  };
}

module.exports = {
  getRealUser
};
