# 실제 로그인한 사용자 감지 유틸리티
# Administrator 권한으로 실행되어도 실제 사용자를 찾습니다

function Get-RealUser {
    param()

    Write-Host "Detecting real logged-in user..." -ForegroundColor Cyan

    # 방법 1: whoami 명령어로 현재 실행 중인 사용자 가져오기
    try {
        $whoamiOutput = whoami
        Write-Host "  whoami output: $whoamiOutput" -ForegroundColor Cyan

        # DOMAIN\Username 또는 COMPUTERNAME\Username 형식에서 사용자명만 추출
        if ($whoamiOutput -match '\\(.+)$') {
            $realUser = $matches[1]
        } else {
            $realUser = $whoamiOutput
        }

        $userHome = "C:\Users\$realUser"

        # 홈 디렉토리 존재 확인
        if (Test-Path $userHome) {
            Write-Host "  Using current user from whoami: $realUser" -ForegroundColor Green
            return @{
                Username = $realUser
                HomeDirectory = $userHome
            }
        }

        Write-Host "  Warning: Home directory not found: $userHome" -ForegroundColor Yellow
    }
    catch {
        Write-Host "  whoami failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    # Fallback: USERNAME 환경변수 사용
    $userName = $env:USERNAME
    $userHome = "C:\Users\$userName"
    Write-Host "  Fallback to USERNAME: $userName" -ForegroundColor Yellow

    return @{
        Username = $userName
        HomeDirectory = $userHome
    }
}

# 함수를 export
Export-ModuleMember -Function Get-RealUser
