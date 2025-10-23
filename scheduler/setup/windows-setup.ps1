# Windows Task Scheduler 최적화 설정 스크립트
# 리소스 절약: 필요한 시간에만 실행하고 즉시 종료

param()

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Claude Scheduler - Optimized Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 현재 디렉토리
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SchedulerDir = Split-Path -Parent $ScriptDir
$TaskName = "ClaudeScheduler"

# 실제 사용자 감지 함수 (whoami 사용)
function Get-RealUser {
    Write-Host "Detecting real logged-in user..." -ForegroundColor Cyan

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

$RealUser = Get-RealUser

Write-Host ""
Write-Host "Target user: $($RealUser.Username)" -ForegroundColor Green
Write-Host "Home directory: $($RealUser.HomeDirectory)" -ForegroundColor Green
Write-Host ""

$ConfigPath = Join-Path $RealUser.HomeDirectory ".ccsbatch\config.json"

Write-Host "Scheduler directory: $SchedulerDir"

# config.json 확인
if (-not (Test-Path $ConfigPath)) {
    Write-Host "ERROR: config.json not found at $ConfigPath" -ForegroundColor Red
    Write-Host "Please run: ccsbatch init" -ForegroundColor Yellow
    exit 1
}

# 설정 읽기
$Config = Get-Content $ConfigPath | ConvertFrom-Json
$WorkStart = $Config.workStart
Write-Host "Work start time: $WorkStart"

# 스케줄 계산 (Node.js 스크립트 사용)
$CalculatorScript = Join-Path $SchedulerDir "time-calculator.js"
$ScheduleJson = node -e "const calc = require('$($CalculatorScript.Replace('\', '\\'))'); const result = calc.calculateSchedule('$WorkStart'); console.log(JSON.stringify(result));"
$Schedule = $ScheduleJson | ConvertFrom-Json

Write-Host ""
Write-Host "Calculated schedule:"
Write-Host "  First message: $($Schedule.firstTime)"
Write-Host "  Schedule times: $($Schedule.schedule -join ', ')"
Write-Host ""

# Node.js 경로 찾기
$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $NodePath) {
    Write-Host "ERROR: Node.js not found in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# 기존 작업 제거
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($ExistingTask) {
    Write-Host "Removing existing task..."
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Task Action 생성 (scheduler-once.js 실행)
$SchedulerScript = Join-Path $SchedulerDir "scheduler-once.js"
$LogPath = Join-Path $RealUser.HomeDirectory ".ccsbatch\logs\scheduler.log"
$LogDir = Split-Path $LogPath

# 로그 디렉토리 생성
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# 명령어: node scheduler-once.js >> log 2>&1
$ActionArgs = "`"$SchedulerScript`" >> `"$LogPath`" 2>&1"
$Action = New-ScheduledTaskAction -Execute $NodePath -Argument $ActionArgs -WorkingDirectory $SchedulerDir

# 여러 개의 Daily Trigger 생성 (각 스케줄 시간마다)
$Triggers = @()
foreach ($Time in $Schedule.schedule) {
    $Trigger = New-ScheduledTaskTrigger -Daily -At $Time
    $Triggers += $Trigger
}

# Task 설정
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -DontStopOnIdleEnd `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

# Principal (실제 사용자 권한)
$Principal = New-ScheduledTaskPrincipal -UserId $RealUser.Username -LogonType S4U -RunLevel Limited

# Task 등록
Write-Host "Registering scheduled task with $($Triggers.Count) triggers..."
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Triggers `
    -Settings $Settings `
    -Principal $Principal `
    -Description "Claude 5-Hour Quota Optimizer - Runs 4 times daily" | Out-Null

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Resource-optimized mode:"
Write-Host "  - Runs ONLY at scheduled times: $($Schedule.schedule -join ', ')"
Write-Host "  - Exits immediately after execution"
Write-Host "  - Zero resource usage when not running"
Write-Host ""
Write-Host "To check status: ccsbatch status"
Write-Host "To view logs: ccsbatch log"
Write-Host ""
