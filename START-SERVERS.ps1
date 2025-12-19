# Disaster Guardian - Quick Start Script
# Kills old processes, seeds DB, starts backend and frontend

Write-Host "🚀 Starting Disaster Guardian..." -ForegroundColor Cyan
Write-Host ""

# Kill any running node processes
Write-Host "🔄 Cleaning up old processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

# Start Backend
Write-Host "📡 Starting Backend Server..." -ForegroundColor Green
$backendPath = "C:\Users\lucky\OneDrive\Desktop\projects\mainproject\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; `$env:MONGO_URI='mongodb://127.0.0.1:27017/disaster-guardian'; node index.js"
Start-Sleep -Seconds 4

# Test Backend
Write-Host "✅ Testing Backend Health..." -ForegroundColor Cyan
try {
    $health = Invoke-WebRequest -UseBasicParsing http://localhost:5000/api/health -ErrorAction Stop
    Write-Host "   Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Backend may not be ready yet" -ForegroundColor Yellow
}

# Start Frontend
Write-Host "🎨 Starting Frontend (Vite)..." -ForegroundColor Green
$frontendPath = "C:\Users\lucky\OneDrive\Desktop\projects\mainproject\disaster-guardian"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; `$env:VITE_API_URL='http://localhost:5000'; npm run dev"

Write-Host ""
Write-Host "✨ Servers Starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173 (or next available port)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "  Admin:     admin@disasterguardian.com / admin123" -ForegroundColor White
Write-Host "  Citizen:   citizen@test.com / citizen123" -ForegroundColor White
Write-Host "  Volunteer: volunteer@test.com / volunteer123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
