# 실제 로그인한 사용자 감지 유틸리티
# Administrator 권한으로 실행되어도 실제 사용자를 찾습니다

function Get-RealUser {
    param()

    Write-Host "Detecting real logged-in user..." -ForegroundColor Cyan

    # 방법 1: query user 명령어로 현재 콘솔 세션의 사용자 찾기
    try {
        $queryResult = query user 2>&1

        if ($queryResult -match '>\s*(\S+)\s+console') {
            $realUser = $matches[1]
            Write-Host "  Found console user: $realUser" -ForegroundColor Green

            # 사용자의 홈 디렉토리 확인
            $userHome = "C:\Users\$realUser"
            if (Test-Path $userHome) {
                return @{
                    Username = $realUser
                    HomeDirectory = $userHome
                }
            }
        }
    }
    catch {
        Write-Host "  query user failed, trying alternative method..." -ForegroundColor Yellow
    }

    # 방법 2: LOGNAME 환경변수 확인
    $logName = $env:LOGNAME
    if ($logName -and $logName -ne "SYSTEM" -and $logName -ne "Administrator") {
        $userHome = "C:\Users\$logName"
        if (Test-Path $userHome) {
            Write-Host "  Using LOGNAME: $logName" -ForegroundColor Green
            return @{
                Username = $logName
                HomeDirectory = $userHome
            }
        }
    }

    # 방법 3: USERNAME 환경변수 (fallback)
    $userName = $env:USERNAME
    if ($userName -eq "Administrator" -or $userName -eq "SYSTEM") {
        Write-Host "  Warning: Running as $userName, attempting to find real user..." -ForegroundColor Yellow

        # C:\Users 폴더에서 최근 활동한 사용자 찾기 (Administrator, Public, Default 제외)
        $recentUser = Get-ChildItem "C:\Users" -Directory |
            Where-Object { $_.Name -notin @("Administrator", "Public", "Default", "Default User") } |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1

        if ($recentUser) {
            Write-Host "  Using most recently active user: $($recentUser.Name)" -ForegroundColor Green
            return @{
                Username = $recentUser.Name
                HomeDirectory = $recentUser.FullName
            }
        }
    }

    # Fallback: 현재 USERNAME 사용
    $userHome = "C:\Users\$userName"
    Write-Host "  Using current user: $userName" -ForegroundColor Yellow

    return @{
        Username = $userName
        HomeDirectory = $userHome
    }
}

# 함수를 export
Export-ModuleMember -Function Get-RealUser
