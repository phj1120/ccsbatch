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
