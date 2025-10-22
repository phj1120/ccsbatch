# Task 07: Windows 자동 시작 설정

## 🎯 목표
Windows Task Scheduler를 사용하여 로그인 시 스케줄러 자동 시작 설정

## 📋 체크리스트

### 1. Task Scheduler XML 템플릿 생성
- [ ] `templates/task.xml` 파일 생성
- [ ] 로그인 시 실행 트리거 설정
- [ ] Node.js 및 scheduler.js 경로 설정
- [ ] 자동 재시작 설정

### 2. 설치 스크립트 작성 (PowerShell)
- [ ] `setup/windows-setup.ps1` 생성
- [ ] 관리자 권한 확인
- [ ] XML 템플릿에서 경로 치환
- [ ] schtasks 명령어로 등록

### 3. 제거 스크립트 작성
- [ ] `setup/windows-uninstall.ps1` 생성
- [ ] Task Scheduler에서 작업 제거

### 4. 테스트
- [ ] 설치 스크립트 실행
- [ ] 로그인 후 자동 시작 확인
- [ ] 제거 스크립트 실행

## 📝 상세 구현

### templates/task.xml
```xml
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Date>2025-01-01T00:00:00</Date>
    <Author>Claude Scheduler</Author>
    <Description>Automated scheduler to optimize Claude 5-hour quota usage</Description>
  </RegistrationInfo>

  <Triggers>
    <LogonTrigger>
      <Enabled>true</Enabled>
    </LogonTrigger>
  </Triggers>

  <Principals>
    <Principal id="Author">
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>

  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <Priority>7</Priority>
    <RestartOnFailure>
      <Interval>PT1M</Interval>
      <Count>3</Count>
    </RestartOnFailure>
  </Settings>

  <Actions Context="Author">
    <Exec>
      <Command>__NODE_PATH__</Command>
      <Arguments>__SCHEDULER_PATH__\scheduler.js</Arguments>
      <WorkingDirectory>__SCHEDULER_PATH__</WorkingDirectory>
    </Exec>
  </Actions>
</Task>
```

### setup/windows-setup.ps1
```powershell
# Windows Task Scheduler 설정 스크립트

param()

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Claude Scheduler - Windows Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 현재 디렉토리 (scheduler/)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SchedulerDir = Split-Path -Parent $ScriptDir
$TemplateFile = Join-Path $SchedulerDir "templates\task.xml"
$TempXmlFile = Join-Path $env:TEMP "claude-scheduler-task.xml"
$TaskName = "ClaudeScheduler"

Write-Host "Scheduler directory: $SchedulerDir"

# Node.js 경로 찾기
$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $NodePath) {
    Write-Host "ERROR: Node.js not found in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host "Node.js path: $NodePath"

# XML 템플릿 복사 및 경로 치환
Write-Host "Creating task definition..."
$XmlContent = Get-Content $TemplateFile -Raw
$XmlContent = $XmlContent -replace '__NODE_PATH__', $NodePath
$XmlContent = $XmlContent -replace '__SCHEDULER_PATH__', $SchedulerDir
$XmlContent | Set-Content $TempXmlFile -Encoding UTF8

# 기존 작업 제거 (있다면)
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($ExistingTask) {
    Write-Host "Removing existing task..."
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# 작업 등록
Write-Host "Registering scheduled task..."
Register-ScheduledTask -Xml (Get-Content $TempXmlFile -Raw) -TaskName $TaskName

# 임시 파일 삭제
Remove-Item $TempXmlFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "The scheduler will now start automatically on login."
Write-Host "To check status: Get-ScheduledTask -TaskName $TaskName"
Write-Host "To view logs: Get-Content $SchedulerDir\logs\scheduler.log -Tail 20"
Write-Host ""
Write-Host "To uninstall, run: npm run uninstall"
```

### setup/windows-uninstall.ps1
```powershell
# Windows Task Scheduler 제거 스크립트

param()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Claude Scheduler - Uninstall" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$TaskName = "ClaudeScheduler"

# 작업 존재 여부 확인
$Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if (-not $Task) {
    Write-Host "⚠️  Task not found. Already uninstalled?" -ForegroundColor Yellow
    exit 0
}

# 작업 제거
Write-Host "Removing scheduled task..."
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false

Write-Host ""
Write-Host "✅ Uninstall complete!" -ForegroundColor Green
Write-Host "The scheduler will no longer start automatically."
```

## 🧪 테스트

### 설치 (PowerShell - 관리자 권한)
```powershell
cd scheduler
npm run setup:windows
# 또는
powershell -ExecutionPolicy Bypass -File setup\windows-setup.ps1
```

### 상태 확인
```powershell
# 작업 확인
Get-ScheduledTask -TaskName ClaudeScheduler

# 작업 상세 정보
Get-ScheduledTaskInfo -TaskName ClaudeScheduler

# 로그 확인
Get-Content scheduler\logs\scheduler.log -Tail 20 -Wait
```

### 수동 실행 (테스트용)
```powershell
Start-ScheduledTask -TaskName ClaudeScheduler
```

### 제거
```powershell
npm run uninstall
# 또는
powershell -ExecutionPolicy Bypass -File setup\windows-uninstall.ps1
```

## 📊 Task Scheduler 개념

### 트리거 종류
- **LogonTrigger**: 사용자 로그인 시 (우리가 사용)
- **BootTrigger**: 시스템 부팅 시
- **TimeTrigger**: 특정 시간에

### 주요 설정 항목
- **MultipleInstancesPolicy**: 중복 실행 방지
- **DisallowStartIfOnBatteries**: 배터리 모드에서도 실행
- **RestartOnFailure**: 실패 시 자동 재시작
- **ExecutionTimeLimit**: 실행 시간 제한 (PT0S = 무제한)

## 🔧 트러블슈팅

### 문제: PowerShell 실행 정책 오류
```powershell
# 현재 정책 확인
Get-ExecutionPolicy

# 임시로 우회하여 실행
powershell -ExecutionPolicy Bypass -File setup\windows-setup.ps1
```

### 문제: 작업이 시작되지 않음
```powershell
# 작업 로그 확인
Get-WinEvent -LogName "Microsoft-Windows-TaskScheduler/Operational" |
    Where-Object {$_.Message -like "*ClaudeScheduler*"} |
    Select-Object -First 10

# 작업 상태 확인
Get-ScheduledTask -TaskName ClaudeScheduler | Select-Object State, LastRunTime, LastTaskResult
```

### 문제: Node.js 경로 오류
```powershell
# Node.js 경로 확인
(Get-Command node).Source

# XML에서 수동으로 경로 수정 후 재등록
# Task Scheduler GUI에서도 가능
```

## ✅ 완료 기준
- [ ] task.xml 템플릿 생성
- [ ] windows-setup.ps1 실행 성공
- [ ] 로그인 후 자동 시작 확인
- [ ] windows-uninstall.ps1 정상 동작
- [ ] 재부팅 후에도 자동 시작

## 📌 다음 단계
Task 08: 테스트 및 문서화
