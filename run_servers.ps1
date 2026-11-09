# =========================================================
# eCare - Start Both Backend & Frontend in 1 Command Line
# =========================================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting eCare Full-Stack System" -ForegroundColor Cyan
Write-Host "Running Django Backend + React Frontend concurrently" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Django API:  http://127.0.0.1:8000/api/" -ForegroundColor Green
Write-Host "Django Admin: http://127.0.0.1:8000/admin/" -ForegroundColor Green
Write-Host "React UI:    http://localhost:5173/" -ForegroundColor Green
Write-Host "Press Ctrl+C at any time to stop both servers.`n" -ForegroundColor Yellow

npm run dev
