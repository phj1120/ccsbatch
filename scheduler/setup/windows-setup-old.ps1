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
