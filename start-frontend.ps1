# Startup script for frontend dev server
# Ensures proper working directory and error handling

$ErrorActionPreference = "Stop"
$FrontendPath = "C:\Users\lucky\OneDrive\Desktop\projects\mainproject\disaster-guardian"

Write-Host "🎨 Starting Disaster Guardian Frontend..." -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Push-Location $FrontendPath

try {
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
        npm install
    }

    # Check if .env exists
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  .env file not found!" -ForegroundColor Red
        Write-Host "Creating default .env file..." -ForegroundColor Yellow
        "VITE_API_URL=http://localhost:5000/api`nVITE_USE_MOCK=false" | Out-File -FilePath ".env" -Encoding UTF8
    }

    Write-Host "✅ Environment ready" -ForegroundColor Green
    Write-Host "📂 Working directory: $(Get-Location)" -ForegroundColor Cyan
    Write-Host "🌐 Starting Vite dev server..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host ""

    # Start the dev server
    npm run dev
} catch {
    Write-Host ""
    Write-Host "❌ Failed to start frontend: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
