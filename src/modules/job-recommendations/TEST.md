# Test AI Job Recommendations API

## Endpoint
```
GET /api/job-recommendations/ai/:userId?k=5
```

## Test Cases

### 1. Test với sample user ID từ Postman collection
```bash
GET http://localhost:4000/api/job-recommendations/ai/cmg9q7frf001nny2owjdaf0oq?k=5
Authorization: Bearer <your_token>
```

### 2. Test với k khác nhau
```bash
# Lấy 3 recommendations
GET http://localhost:4000/api/job-recommendations/ai/cmg9q7frf001nny2owjdaf0oq?k=3

# Lấy 10 recommendations  
GET http://localhost:4000/api/job-recommendations/ai/cmg9q7frf001nny2owjdaf0oq?k=10

# Không truyền k (default = 5)
GET http://localhost:4000/api/job-recommendations/ai/cmg9q7frf001nny2owjdaf0oq
```

### 3. Expected Response
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "cmg9q7fsf004rny2o4ulwfsmh",
        "title": "Senior Machine Learning Engineer",
        "description": "Build and deploy production ML models...",
        "salary": "$100,000 - $150,000",
        "location": "Remote",
        "type": "FULL_TIME",
        "requirements": "5+ years experience in ML...",
        "benefits": "Health insurance, 401k...",
        "isActive": true,
        "isApproved": true,
        "company": {
          "id": "company_id",
          "name": "Tech Innovators Inc",
          "logoUrl": "https://example.com/logo.png",
          "isVerified": true
        },
        "_count": {
          "applications": 25,
          "views": 456
        },
        "recommendationScore": 1.0,
        "recommendationReason": "AI-powered recommendation",
        "rank": 1
      },
      // ... more jobs
    ],
    "total": 5,
    "source": "AI Service"
  }
}
```

### 4. Error Cases

#### AI Service không khả dụng
```json
{
  "success": false,
  "error": "Failed to get AI recommendations: fetch failed"
}
```

#### User ID không hợp lệ
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```

#### Không có recommendations
```json
{
  "success": true,
  "data": {
    "recommendations": [],
    "message": "No recommendations found from AI service"
  }
}
```

## PowerShell Test Script

```powershell
# Set variables
$baseUrl = "http://localhost:4000"
$token = "your_jwt_token_here"
$userId = "cmg9q7frf001nny2owjdaf0oq"

# Test AI recommendations
$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host "Testing AI Recommendations API..." -ForegroundColor Green

# Test 1: Default k=5
Write-Host "`n1. Testing with default k=5" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/api/job-recommendations/ai/$userId" -Headers $headers -Method Get
$response | ConvertTo-Json -Depth 10

# Test 2: k=3
Write-Host "`n2. Testing with k=3" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/api/job-recommendations/ai/$userId`?k=3" -Headers $headers -Method Get
$response | ConvertTo-Json -Depth 10

# Test 3: k=10
Write-Host "`n3. Testing with k=10" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/api/job-recommendations/ai/$userId`?k=10" -Headers $headers -Method Get
$response | ConvertTo-Json -Depth 10

Write-Host "`nTests completed!" -ForegroundColor Green
```

## cURL Examples

```bash
# Default (k=5)
curl -X GET "http://localhost:4000/api/job-recommendations/ai/cmg9q7frf001nny2owjdaf0oq" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With k=3
curl -X GET "http://localhost:4000/api/job-recommendations/ai/cmg9q7frf001nny2owjdaf0oq?k=3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Postman Collection

Import vào Postman để test:
```json
{
  "name": "AI Job Recommendations",
  "item": [
    {
      "name": "Get AI Recommendations",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/job-recommendations/ai/{{userId}}?k=5",
          "host": ["{{baseUrl}}"],
          "path": ["api", "job-recommendations", "ai", "{{userId}}"],
          "query": [
            {
              "key": "k",
              "value": "5"
            }
          ]
        }
      }
    }
  ]
}
```

## Checklist trước khi test

- [ ] AI Service (Python) đang chạy ở http://localhost:8000
- [ ] Backend đang chạy ở http://localhost:4000
- [ ] Database đã có dữ liệu jobs
- [ ] Database đã có dữ liệu users
- [ ] Có JWT token hợp lệ
- [ ] Đã set AI_SERVICE_URL trong .env
