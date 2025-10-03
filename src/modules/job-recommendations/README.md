# Job Recommendations API

Module này cung cấp các API để gợi ý công việc cho người dùng dựa trên profile, job alerts và AI.

## Endpoints

### 1. Generate Recommendations (Rule-based)
```
GET /api/job-recommendations/generate
```
Tạo gợi ý việc làm dựa trên thuật toán rule-based (profile matching, job alerts, etc.)

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items mỗi trang (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "job_id",
        "title": "Job Title",
        "company": {...},
        "recommendationScore": 0.85,
        "recommendationReasons": ["Skills match", "Location match"],
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 2. Get AI Recommendations ⭐ NEW
```
GET /api/job-recommendations/ai/:userId
```
Lấy gợi ý việc làm từ AI service (Python) với thông tin job đầy đủ.

**Path Parameters:**
- `userId` (required): ID của user cần lấy gợi ý

**Query Parameters:**
- `k` (optional): Số lượng job gợi ý (default: 5, min: 1, max: 20)

**Request Example:**
```
GET /api/job-recommendations/ai/cmg9q7frf001nny2owjdaf0oq?k=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "cmg9q7fsf004rny2o4ulwfsmh",
        "title": "Senior Backend Developer",
        "description": "...",
        "salary": "$80,000 - $120,000",
        "location": "Ha Noi",
        "type": "FULL_TIME",
        "company": {
          "id": "company_id",
          "name": "Tech Corp",
          "logoUrl": "...",
          "isVerified": true
        },
        "_count": {
          "applications": 15,
          "views": 234
        },
        "recommendationScore": 1.0,
        "recommendationReason": "AI-powered recommendation",
        "rank": 1,
        ...
      }
    ],
    "total": 5,
    "source": "AI Service"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to get AI recommendations: Connection timeout"
}
```

### 3. Get Saved Recommendations
```
GET /api/job-recommendations/saved
```
Lấy danh sách gợi ý đã được lưu trong database.

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items mỗi trang (default: 10, max: 50)

### 4. Update Recommendation
```
PUT /api/job-recommendations/update
```
Cập nhật điểm gợi ý (để feedback).

**Request Body:**
```json
{
  "jobId": "job_id",
  "score": 0.9,
  "reason": "User feedback"
}
```

### 5. Remove Recommendation
```
DELETE /api/job-recommendations/:jobId
```
Xóa một gợi ý công việc.

## Authentication

Tất cả các endpoints đều yêu cầu authentication token trong header:
```
Authorization: Bearer <token>
```

## AI Service Integration

API `/ai/:userId` tích hợp với Python AI service:
- **Endpoint gọi**: `{{AI_SERVICE_URL}}/api/jobs/match?user_id={{userId}}&k={{k}}`
- **AI Response**: 
  ```json
  {
    "jobIds": ["id1", "id2", "id3"],
    "userId": "user_id"
  }
  ```
- **Backend xử lý**: Lấy jobIds từ AI service, query thông tin job đầy đủ từ database và trả về

## Configuration

Cấu hình AI service trong `.env`:
```env
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=30000
AI_SERVICE_RETRY_ATTEMPTS=3
```

## Flow

1. Frontend gọi: `GET /api/job-recommendations/ai/:userId?k=5`
2. Backend gọi AI service: `GET {{AI_SERVICE_URL}}/api/jobs/match?user_id={userId}&k=5`
3. AI service trả về danh sách job IDs
4. Backend query database để lấy thông tin chi tiết của các jobs
5. Backend sắp xếp jobs theo thứ tự từ AI service
6. Backend lưu recommendations vào database để tracking
7. Backend trả về response với thông tin job đầy đủ

## Error Handling

- Nếu AI service không khả dụng → trả về lỗi với message rõ ràng
- Nếu không tìm thấy jobs → trả về array rỗng với message
- Tất cả errors đều được log để debug
