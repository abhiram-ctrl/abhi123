# Startup script for backend server
# Ensures proper working directory and error handling

$ErrorActionPreference = "Stop"
$BackendPath = "C:\Users\lucky\OneDrive\Desktop\projects\mainproject\backend"

Write-Host "🚀 Starting Disaster Guardian Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Push-Location $BackendPath

try {
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
        npm install --only=prod --no-audit --no-fund
    }

    # Check if .env exists
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  .env file not found!" -ForegroundColor Red
        Write-Host "Creating default .env file..." -ForegroundColor Yellow
        "MONGO_URI=mongodb://127.0.0.1:27017/disaster-guardian`nJWT_SECRET=supersecret123" | Out-File -FilePath ".env" -Encoding UTF8
    }

    Write-Host "✅ Environment ready" -ForegroundColor Green
    Write-Host "📂 Working directory: $(Get-Location)" -ForegroundColor Cyan
    Write-Host "🔌 Starting server on port 5000..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host ""

    # Start the server
    node index.js
} catch {
    Write-Host ""
    Write-Host "❌ Failed to start server: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
