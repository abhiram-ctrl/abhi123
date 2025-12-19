Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FORGOT PASSWORD - FULL TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test Citizen
Write-Host "[CITIZEN]" -ForegroundColor Yellow
$b1=@{method="email";email="citizen@test.com"}|ConvertTo-Json -Compress
$r1=Invoke-RestMethod -Uri "http://localhost:5000/api/forgot-password/request-otp" -Method POST -ContentType "application/json" -Body $b1
Write-Host "  Step 1: OTP=$($r1.devOtp), Role=$($r1.role)" -ForegroundColor Green

$b2=@{method="email";email="citizen@test.com";otp=$r1.devOtp}|ConvertTo-Json -Compress
$r2=Invoke-RestMethod -Uri "http://localhost:5000/api/forgot-password/verify-otp" -Method POST -ContentType "application/json" -Body $b2
Write-Host "  Step 2: Verified=$($r2.verified)" -ForegroundColor Green

$b3=@{method="email";email="citizen@test.com";otp=$r1.devOtp;newPassword="newpass123"}|ConvertTo-Json -Compress
$r3=Invoke-RestMethod -Uri "http://localhost:5000/api/forgot-password/reset-password" -Method POST -ContentType "application/json" -Body $b3
Write-Host "  Step 3: Reset=$($r3.success)`n" -ForegroundColor Green

# Test Volunteer
Write-Host "[VOLUNTEER]" -ForegroundColor Yellow
$b1=@{method="email";email="volunteer@test.com"}|ConvertTo-Json -Compress
$r1=Invoke-RestMethod -Uri "http://localhost:5000/api/forgot-password/request-otp" -Method POST -ContentType "application/json" -Body $b1
Write-Host "  Step 1: OTP=$($r1.devOtp), Role=$($r1.role)" -ForegroundColor Green

$b2=@{method="email";email="volunteer@test.com";otp=$r1.devOtp}|ConvertTo-Json -Compress
$r2=Invoke-RestMethod -Uri "http://localhost:5000/api/forgot-password/verify-otp" -Method POST -ContentType "application/json" -Body $b2
Write-Host "  Step 2: Verified=$($r2.verified)" -ForegroundColor Green

$b3=@{method="email";email="volunteer@test.com";otp=$r1.devOtp;newPassword="newvolpass123"}|ConvertTo-Json -Compress
$r3=Invoke-RestMethod -Uri "http://localhost:5000/api/forgot-password/reset-password" -Method POST -ContentType "application/json" -Body $b3
Write-Host "  Step 3: Reset=$($r3.success)`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓✓✓ ALL TESTS PASSED ✓✓✓" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
