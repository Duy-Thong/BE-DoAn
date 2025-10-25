# Applications API - Postman Collection

## 📋 Overview

Đây là Postman Collection hoàn chỉnh cho **Applications API Module** với:
- ✅ Authentication cho 3 roles: Candidate, Recruiter, Admin
- ✅ Test scripts tự động
- ✅ Environment variables
- ✅ Token management
- ✅ Error scenario testing

## 🚀 Quick Start

### 1. Import Collection và Environment

**Import Collection:**
1. Mở Postman
2. Click **Import** button
3. Chọn file `Applications_API.postman_collection.json`
4. Collection sẽ xuất hiện trong sidebar

**Import Environment:**
1. Click **Environments** tab
2. Click **Import** button
3. Chọn file `Applications_API.postman_environment.json`
4. Select environment từ dropdown (top right)

### 2. Cấu hình Environment Variables

Cập nhật các giá trị sau trong environment:

#### API Configuration
- `base_url`: URL của API server (mặc định: `http://localhost:3000/api`)

#### User Credentials
- `candidate_email`: Email của candidate user
- `candidate_password`: Password của candidate
- `recruiter_email`: Email của recruiter user
- `recruiter_password`: Password của recruiter
- `admin_email`: Email của admin user
- `admin_password`: Password của admin

#### Test Data (sẽ được auto-populate sau khi login)
- `job_id`: ID của job để test application
- `cv_id`: ID của CV để submit application

### 3. Setup Test Data

Trước khi test Applications API, bạn cần:

1. **Tạo Job (Recruiter)**
   - Login as Recruiter
   - Tạo job posting
   - Copy `job_id` vào environment variable

2. **Tạo CV (Candidate)**
   - Login as Candidate
   - Tạo CV
   - Copy `cv_id` vào environment variable

## 📖 Collection Structure

### 1. Authentication (Required First)

Chạy các request này trước để lấy access tokens:

#### 🔐 Login as Candidate
- **Endpoint**: `POST /auth/login`
- **Purpose**: Lấy token cho candidate operations
- **Auto-saves**: `access_token`, `user_id`, `user_role`, `token_expiry`

#### 🔐 Login as Recruiter
- **Endpoint**: `POST /auth/login`
- **Purpose**: Lấy token cho recruiter operations
- **Auto-saves**: `recruiter_token`, `recruiter_id`, `company_id`

#### 🔐 Login as Admin
- **Endpoint**: `POST /auth/login`
- **Purpose**: Lấy token cho admin operations
- **Auto-saves**: `admin_token`, `admin_id`

### 2. Candidate Operations

Operations cho candidates để manage applications của họ:

#### 📝 Get My Applications
- **Endpoint**: `GET /applications/mine`
- **Auth**: Candidate token
- **Returns**: List of all applications submitted by candidate
- **Tests**: 
  - Status code 200
  - Response is array
  - Each application has required fields

#### ➕ Create Application
- **Endpoint**: `POST /applications`
- **Auth**: Candidate token
- **Body**:
  ```json
  {
    "jobId": "string",
    "cvId": "string",
    "coverLetter": "string (optional)",
    "notes": "string (optional)"
  }
  ```
- **Auto-saves**: `application_id`
- **Tests**:
  - Status code 201
  - Application created with PENDING status
  - Validates duplicate check

#### ✏️ Update Application
- **Endpoint**: `PUT /applications/:id`
- **Auth**: Candidate token
- **Constraint**: Chỉ update được nếu status là PENDING
- **Body**:
  ```json
  {
    "cvId": "string (optional)",
    "coverLetter": "string (optional)",
    "notes": "string (optional)"
  }
  ```

#### ❌ Delete Application
- **Endpoint**: `DELETE /applications/:id`
- **Auth**: Candidate token
- **Constraint**: Chỉ delete được nếu status là PENDING

#### 🔍 Get Application by ID
- **Endpoint**: `GET /applications/:id`
- **Auth**: Candidate token
- **Returns**: Detailed application info với job và company details

### 3. Recruiter Operations

Operations cho recruiters để manage applications cho jobs của company:

#### 📋 Get All Applications (Recruiter)
- **Endpoint**: `GET /applications`
- **Auth**: Recruiter token
- **Returns**: All applications cho jobs thuộc company của recruiter
- **Tests**: Validates company scope

#### 📊 Get Job Applications
- **Endpoint**: `GET /applications/job/:jobId`
- **Auth**: Recruiter token
- **Returns**: All applications for specific job
- **Tests**: 
  - All applications belong to specified job
  - Includes CV details (fullName, email, phone)

#### ✅ Update Application Status - Accept
- **Endpoint**: `PATCH /applications/:id/status`
- **Auth**: Recruiter token
- **Body**:
  ```json
  {
    "status": "ACCEPTED",
    "notes": "Optional feedback message"
  }
  ```
- **Tests**: Status updated to ACCEPTED

#### ❌ Update Application Status - Reject
- **Endpoint**: `PATCH /applications/:id/status`
- **Auth**: Recruiter token
- **Body**:
  ```json
  {
    "status": "REJECTED",
    "notes": "Optional feedback message"
  }
  ```
- **Tests**: Status updated to REJECTED

### 4. Admin Operations

Operations cho admin để view toàn bộ system:

#### 🔧 Get All Applications (Admin)
- **Endpoint**: `GET /applications`
- **Auth**: Admin token
- **Returns**: ALL applications across all companies
- **Tests**: 
  - Admin can view everything
  - Includes company information

### 5. Error Scenarios

Test cases cho validation và error handling:

#### ❌ Create Duplicate Application
- **Expected**: 400 Bad Request
- **Message**: "Bạn đã ứng tuyển công việc này rồi"

#### ❌ Update Non-Pending Application
- **Expected**: 400 Bad Request
- **Message**: "Chỉ có thể cập nhật đơn ứng tuyển đang chờ xử lý"

#### ❌ Unauthorized Access
- **Expected**: 401 Unauthorized
- **Message**: "Vui lòng đăng nhập"

## 🧪 Test Scripts

### Global Scripts (Collection Level)

#### Pre-request Script
```javascript
// Auto-refresh token if expired
const tokenExpiry = pm.environment.get('token_expiry');
const currentTime = new Date().getTime();

if (!tokenExpiry || currentTime >= tokenExpiry) {
    console.log('Token expired or not set, requesting new token...');
}
```

#### Test Script
```javascript
// Validate response time
pm.test('Response time is less than 2000ms', function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Validate content-type
pm.test('Response has correct content-type', function () {
    pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});
```

### Request-Level Scripts

Mỗi request có custom test scripts để:
- ✅ Validate status codes
- ✅ Check response structure
- ✅ Verify business logic
- ✅ Auto-save important variables
- ✅ Log useful information

## 🔄 Workflow Examples

### Workflow 1: Complete Application Flow (Candidate)

1. **Login as Candidate**
2. **Get My Applications** - Check existing applications
3. **Create Application** - Submit new application (requires job_id and cv_id)
4. **Get My Applications** - Verify application created
5. **Update Application** - Update cover letter/notes (optional)
6. **Get Application by ID** - Check details
7. **Delete Application** - Remove if needed (must be PENDING)

### Workflow 2: Recruiter Application Management

1. **Login as Recruiter**
2. **Get All Applications** - View all applications for company's jobs
3. **Get Job Applications** - Filter by specific job
4. **Update Application Status - Accept** - Accept qualified candidates
5. **Update Application Status - Reject** - Reject unqualified candidates

### Workflow 3: Admin Monitoring

1. **Login as Admin**
2. **Get All Applications** - Monitor all applications system-wide
3. View statistics and trends across all companies

### Workflow 4: Error Handling Testing

1. **Unauthorized Access** - Test without token
2. **Create Duplicate Application** - Test validation
3. **Update Non-Pending Application** - Test business rule

## 📊 Environment Variables Reference

### Configuration
| Variable | Type | Description | Auto-populated |
|----------|------|-------------|----------------|
| `base_url` | string | API base URL | No |

### Authentication Credentials
| Variable | Type | Description | Auto-populated |
|----------|------|-------------|----------------|
| `candidate_email` | string | Candidate login email | No |
| `candidate_password` | secret | Candidate password | No |
| `recruiter_email` | string | Recruiter login email | No |
| `recruiter_password` | secret | Recruiter password | No |
| `admin_email` | string | Admin login email | No |
| `admin_password` | secret | Admin password | No |

### Tokens
| Variable | Type | Description | Auto-populated |
|----------|------|-------------|----------------|
| `access_token` | secret | Candidate access token | Yes (on login) |
| `refresh_token` | secret | Candidate refresh token | Yes (on login) |
| `recruiter_token` | secret | Recruiter access token | Yes (on login) |
| `admin_token` | secret | Admin access token | Yes (on login) |
| `token_expiry` | string | Token expiry timestamp | Yes (on login) |

### User Info
| Variable | Type | Description | Auto-populated |
|----------|------|-------------|----------------|
| `user_id` | string | Current candidate user ID | Yes (on login) |
| `user_role` | string | Current user role | Yes (on login) |
| `recruiter_id` | string | Recruiter user ID | Yes (on login) |
| `admin_id` | string | Admin user ID | Yes (on login) |
| `company_id` | string | Recruiter's company ID | Yes (on login) |

### Test Data
| Variable | Type | Description | Auto-populated |
|----------|------|-------------|----------------|
| `application_id` | string | Current application ID | Yes (on create) |
| `job_id` | string | Job ID for testing | No (manual setup) |
| `cv_id` | string | CV ID for testing | No (manual setup) |

## 🎯 Best Practices

### 1. Token Management
- Tokens tự động được save sau khi login
- Collection-level script check token expiry
- Mỗi role có token riêng

### 2. Test Execution Order
```
1. Authentication first (login)
2. Setup test data (job_id, cv_id)
3. Run candidate operations
4. Run recruiter operations
5. Run admin operations
6. Test error scenarios
```

### 3. Clean Test Data
- Delete test applications sau khi test
- Giữ environment clean
- Reset variables khi cần

### 4. Monitoring & Debugging
- Check Console tab cho logs
- Test Results tab hiển thị pass/fail
- Network tab cho raw request/response

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
**Solution**: 
- Chạy login request trước
- Verify token được save vào environment
- Check token expiry

### Issue: 400 Bad Request - "Bạn đã ứng tuyển công việc này rồi"
**Solution**:
- Application đã tồn tại cho job+cv này
- Delete application cũ hoặc dùng CV khác

### Issue: 400 Bad Request - "Chỉ có thể cập nhật đơn ứng tuyển đang chờ xử lý"
**Solution**:
- Application status không phải PENDING
- Create application mới để test

### Issue: 403 Forbidden - "Không có quyền..."
**Solution**:
- Check đang dùng đúng token cho role
- Verify user có quyền cho resource

### Issue: 404 Not Found
**Solution**:
- Verify ID variables (`application_id`, `job_id`, `cv_id`)
- Check resource tồn tại

## 📝 Notes

### Application Status Flow
```
PENDING → ACCEPTED (by Recruiter)
        ↓
        REJECTED (by Recruiter)
```

- Candidate chỉ có thể update/delete PENDING applications
- Recruiter có thể update status bất kỳ lúc nào
- Status change là final (không thể revert)

### Permission Matrix
| Action | Candidate | Recruiter | Admin |
|--------|-----------|-----------|-------|
| Create application | ✅ | ❌ | ❌ |
| Update own application | ✅ (PENDING) | ❌ | ❌ |
| Delete own application | ✅ (PENDING) | ❌ | ❌ |
| View own applications | ✅ | ❌ | ❌ |
| View job applications | ❌ | ✅ (own company) | ✅ |
| Update status | ❌ | ✅ (own company) | ✅ |
| View all applications | ❌ | ✅ (company scope) | ✅ (all) |

## 🔗 Related Collections

- **Jobs API**: Tạo và manage jobs
- **CVs API**: Tạo và manage CVs
- **Users API**: User authentication và profile

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs
2. Verify environment variables
3. Review API documentation
4. Check server logs

## 📄 License

MIT License - Free to use and modify

