$ErrorActionPreference = "Continue"
Set-Location -Path "c:\Users\lucky\OneDrive\Desktop\projects\mainproject\backend"
Write-Host "Starting server from: $(Get-Location)"

# Cap Node's old space memory to avoid PowerShell OOMs
$env:NODE_OPTIONS = "--max-old-space-size=512"

try {
	node index.js
} catch {
	Write-Error "Failed to start Node server: $_"
	exit 1
}
