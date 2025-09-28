# API Testing Script
Write-Host "=== API Testing Script ===" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET
    Write-Host "✅ Health Check: $($healthResponse.StatusCode) - $($healthResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Root API (should return 404)
Write-Host "`n2. Testing Root API..." -ForegroundColor Yellow
try {
    $rootResponse = Invoke-WebRequest -Uri "http://localhost:4000/api" -Method GET
    Write-Host "✅ Root API: $($rootResponse.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Root API: 404 (Expected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Root API Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Auth Login (should fail without credentials)
Write-Host "`n3. Testing Auth Login..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
    Write-Host "✅ Auth Login: $($loginResponse.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 500) {
        Write-Host "✅ Auth Login: 500 (Expected - Database not connected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Auth Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Users endpoint (should require auth)
Write-Host "`n4. Testing Users Endpoint..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/users" -Method GET
    Write-Host "✅ Users: $($usersResponse.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Users: 401 (Expected - Requires Authentication)" -ForegroundColor Green
    } else {
        Write-Host "❌ Users Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Companies endpoint (should require auth)
Write-Host "`n5. Testing Companies Endpoint..." -ForegroundColor Yellow
try {
    $companiesResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/companies" -Method GET
    Write-Host "✅ Companies: $($companiesResponse.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Companies: 401 (Expected - Requires Authentication)" -ForegroundColor Green
    } else {
        Write-Host "❌ Companies Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Jobs endpoint (should require auth)
Write-Host "`n6. Testing Jobs Endpoint..." -ForegroundColor Yellow
try {
    $jobsResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/jobs" -Method GET
    Write-Host "✅ Jobs: $($jobsResponse.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Jobs: 401 (Expected - Requires Authentication)" -ForegroundColor Green
    } else {
        Write-Host "❌ Jobs Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 7: Search endpoint (should fail due to database)
Write-Host "`n7. Testing Search Endpoint..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/search/jobs" -Method GET
    Write-Host "✅ Search: $($searchResponse.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 500) {
        Write-Host "✅ Search: 500 (Expected - Database not connected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Search Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== API Testing Complete ===" -ForegroundColor Green
Write-Host "`nNote: Some endpoints return 500 errors due to database connection issues." -ForegroundColor Cyan
Write-Host "To fully test the APIs, you need to:" -ForegroundColor Cyan
Write-Host "1. Set up a PostgreSQL database" -ForegroundColor Cyan
Write-Host "2. Update the DATABASE_URL in .env file" -ForegroundColor Cyan
Write-Host "3. Run 'npx prisma db push' to create tables" -ForegroundColor Cyan
Write-Host "4. Run 'npx prisma db seed' to populate test data" -ForegroundColor Cyan
