# Script kiem tra AI Service
Write-Host "Checking AI Service..." -ForegroundColor Cyan

$aiServiceUrl = "http://127.0.0.1:8000"

# Test health check
Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$aiServiceUrl/api/health" -Method Get -TimeoutSec 5
    Write-Host "SUCCESS: AI Service is running!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "FAILED: AI Service is NOT running" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease start Python AI service on http://127.0.0.1:8000" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nAI Service is ready!" -ForegroundColor Green
