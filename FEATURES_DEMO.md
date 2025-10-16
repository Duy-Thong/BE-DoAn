# Các tính năng đã được tạo trong lần demo này

## Backend

### Công nghệ sử dụng
- **ORM**: Prisma để tương tác với database
- **Authentication**: JWT (JSON Web Token)
- **Framework**: Express.js với TypeScript
- **Database**: PostgreSQL/MySQL (quản lý bởi Prisma)

---

## 1. 🔐 Authentication (Xác thực)

### API Authentication
- **Login** - Đăng nhập
  - `POST /api/auth/login`
  - Input: email, password
  - Output: accessToken, refreshToken
  
- **Register** - Đăng ký tài khoản mới
  - `POST /api/auth/register`
  - Input: email, password, fullName, phoneNumber, role
  - Hỗ trợ các role: CANDIDATE, EMPLOYER, ADMIN
  
- **Refresh Token** - Làm mới token
  - `POST /api/auth/refresh`
  - Input: refreshToken
  - Output: accessToken mới
  
- **Logout** - Đăng xuất
  - `POST /api/auth/logout`
  - Xóa refresh token khỏi hệ thống

---

## 2. 👥 Quản lý User (User Management)

### API User
- **Get All Users** - Lấy danh sách tất cả users (Admin only)
  - `GET /api/users`
  - Query params: page, limit, role
  - Hỗ trợ phân trang và lọc theo role
  
- **Get User by ID** - Lấy thông tin user theo ID
  - `GET /api/users/:userId`
  - Trả về thông tin chi tiết user
  
- **Create User** - Tạo user mới (Admin only)
  - `POST /api/users`
  - Input: email, password, fullName, phoneNumber, role
  
- **Update User** - Cập nhật thông tin user (Admin only)
  - `PUT /api/users/:userId`
  - Input: fullName, phoneNumber, isActive
  
- **Delete User** - Xóa user (Admin only)
  - `DELETE /api/users/:userId`

---

## 3. 👤 Quản lý Profile (Profile Management)

### API Profile
- **Get My Profile** - Lấy thông tin profile của user hiện tại
  - `GET /api/profiles/me`
  - Trả về thông tin profile đầy đủ
  
- **Update My Profile** - Cập nhật profile
  - `PUT /api/profiles/me`
  - Input: bio, location, website, skills, experience

---

## 4. 📄 Quản lý CV (CV Management)

### API CV
- **Create CV** - Tạo CV mới
  - `POST /api/cvs`
  - Input: title, content, fileName, filePath, skills, experience, education
  
- **Get My CVs** - Lấy danh sách CV của user
  - `GET /api/cvs`
  - Trả về tất cả CV đã tạo
  
- **Get Main CV** - Lấy CV chính
  - `GET /api/cvs/main`
  - Trả về CV được đánh dấu là chính
  
- **Get CV by ID** - Lấy CV theo ID
  - `GET /api/cvs/:cvId`
  
- **Update CV** - Cập nhật CV
  - `PUT /api/cvs/:cvId`
  - Input: title, content, skills
  
- **Delete CV** - Xóa CV
  - `DELETE /api/cvs/:cvId`
  
- **Set Main CV** - Đặt CV làm CV chính
  - `POST /api/cvs/set-main`
  - Input: cvId
  
- **Download CV** - Tải xuống CV
  - `GET /api/cvs/:cvId/download`

---

## 5. 🏢 Quản lý Company (Company Management)

### API Company (Public)
- **Get All Companies** - Lấy danh sách công ty (Public)
  - `GET /api/companies`
  - Query params: page, limit, search
  - Hỗ trợ tìm kiếm và phân trang
  
- **Get Company by ID** - Lấy thông tin công ty (Public)
  - `GET /api/companies/:companyId`

### API Company (Authenticated)
- **Create Company** - Tạo công ty mới
  - `POST /api/companies`
  - Input: name, description, website, industry, size, location, email, phone
  
- **Update Company** - Cập nhật thông tin công ty
  - `PUT /api/companies/:companyId`
  - Input: name, description, website
  
- **Delete Company** - Xóa công ty
  - `DELETE /api/companies/:companyId`
  
- **Get My Companies** - Lấy danh sách công ty của user
  - `GET /api/companies/user/my-companies`

---

## 6. 💼 Quản lý Job (Job Management)

### API Job (Public)
- **Get All Jobs** - Lấy danh sách công việc (Public)
  - `GET /api/jobs`
  - Query params: page, limit, search, location, type
  - Hỗ trợ tìm kiếm và lọc theo nhiều tiêu chí
  
- **Get Job by ID** - Lấy thông tin công việc (Public)
  - `GET /api/jobs/:jobId`
  
- **Record Job View** - Ghi nhận lượt xem công việc
  - `POST /api/jobs/:jobId/view`

### API Job (Authenticated)
- **Create Job** - Tạo công việc mới
  - `POST /api/jobs`
  - Input: title, description, requirements, benefits, location, type, experienceLevel, salary, companyId, skills
  
- **Update Job** - Cập nhật công việc
  - `PUT /api/jobs/:jobId`
  - Input: title, description, salary
  
- **Delete Job** - Xóa công việc
  - `DELETE /api/jobs/:jobId`
  
- **Get Company Jobs** - Lấy danh sách công việc của công ty
  - `GET /api/jobs/company/:companyId`
  
- **Repost Job** - Đăng lại công việc
  - `POST /api/jobs/company/:companyId/repost`
  
- **Get Job Applications** - Lấy danh sách ứng tuyển
  - `GET /api/jobs/:jobId/applications`

---

## 7. 🔧 Quản lý Admin (Admin Management)

### API Admin
- **Get Dashboard Stats** - Lấy thống kê dashboard
  - `GET /api/admin/dashboard`
  - Trả về thống kê tổng quan hệ thống

### Admin User Management
- **Get Users** - Lấy danh sách users
  - `GET /api/admin/users`
  - Query params: page, limit, role, status
  
- **Update User Status** - Cập nhật trạng thái user
  - `PUT /api/admin/users/status`
  - Input: userId, status, reason
  
- **Delete User** - Xóa user
  - `DELETE /api/admin/users`
  - Input: userId, reason

### Admin Job Management
- **Get Jobs** - Lấy danh sách công việc
  - `GET /api/admin/jobs`
  - Query params: page, limit, status
  
- **Approve Job** - Phê duyệt công việc
  - `PUT /api/admin/jobs/approve`
  - Input: jobId, approved, comments

### Admin Company Management
- **Get Companies** - Lấy danh sách công ty
  - `GET /api/admin/companies`
  - Query params: page, limit, verified
  
- **Verify Company** - Xác minh công ty
  - `PUT /api/admin/companies/verify`
  - Input: companyId, verified, comments

---

## 8. 🔔 Quản lý Notifications (Thông báo)

### API Notifications
- **Get My Notifications** - Lấy danh sách thông báo
  - `GET /api/notifications`
  - Query params: page, limit, unreadOnly
  
- **Mark as Read** - Đánh dấu đã đọc
  - `PUT /api/notifications/:notificationId/read`
  
- **Mark All as Read** - Đánh dấu tất cả đã đọc
  - `PUT /api/notifications/read-all`

---

## 9. ⭐ Quản lý Reviews (Đánh giá)

### API Reviews
- **Get Company Reviews** - Lấy đánh giá công ty
  - `GET /api/reviews/company/:companyId`
  - Query params: page, limit, sortBy
  
- **Create Review** - Tạo đánh giá mới
  - `POST /api/reviews`
  - Input: companyId, rating, title, comment, pros, cons, workLifeBalance, salaryBenefits, careerGrowth, management, culture, isAnonymous

---

## 10. 📁 Quản lý File Uploads (Upload tệp)

### API Uploads
- **Upload CV** - Upload CV
  - `POST /api/uploads/cv`
  - Input: file (multipart/form-data), title
  - Hỗ trợ upload file PDF
  
- **Get My Files** - Lấy danh sách files đã upload
  - `GET /api/uploads/my-files`
  - Query params: page, limit, category

---

## 11. 🤖 AI Integration (Tích hợp AI)

### API AI
- **AI Service Status** - Kiểm tra trạng thái dịch vụ AI
  - `GET /api/ai/status`
  - Trả về trạng thái kết nối với AI service
  
- **Generate Job Recommendations** - Tạo gợi ý công việc bằng AI
  - `POST /api/ai/recommendations/jobs`
  - Input: userId, type, filters
  - Sử dụng AI để gợi ý công việc phù hợp
  
- **Analyze CV** - Phân tích CV bằng AI
  - `POST /api/ai/analyze/cv`
  - Input: cvId
  - AI phân tích và đưa ra đánh giá về CV

---

## Tính năng bảo mật

### Middleware Authentication
- JWT token validation
- Role-based access control (RBAC)
- Admin, Employer, Candidate permissions

### Middleware Error Handling
- Centralized error handling
- Custom error responses
- Logging errors

### Middleware Not Found
- 404 error handling cho routes không tồn tại

---

## Cấu trúc Database (Prisma Schema)

### Models chính:
- **User** - Người dùng (Candidate, Employer, Admin)
- **Profile** - Thông tin profile
- **CV** - Hồ sơ xin việc
- **Company** - Công ty
- **Job** - Công việc
- **Application** - Đơn ứng tuyển
- **Notification** - Thông báo
- **Review** - Đánh giá công ty
- **SavedJob** - Công việc đã lưu
- **JobAlert** - Cảnh báo công việc mới

---

## API Documentation

- **Postman Collection**: `BE-DoAn-Complete-API-Collection-UPDATED.json`
- **Base URL**: `http://localhost:4000`
- **API Prefix**: `/api`

### Variables:
- `base_url`: http://localhost:4000
- `auth_token`: Token xác thực (nhận từ login)
- `refresh_token`: Refresh token
- `user_id`: ID người dùng
- `company_id`: ID công ty
- `job_id`: ID công việc
- `cv_id`: ID CV

---

## Testing & Development Tools

- **PowerShell Scripts**:
  - `check-ai-service.ps1` - Kiểm tra AI service
  - `test-api.ps1` - Test API endpoints

- **Jest Configuration**: 
  - Unit testing setup
  - Integration testing support

---

## Deployment & Configuration

### Environment Variables (.env)
```env
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
AI_SERVICE_URL=
PORT=4000
```

### Scripts (package.json)
- `npm run dev` - Development mode
- `npm run build` - Build production
- `npm run start` - Start production
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database

---

## Tổng kết

Hệ thống đã được xây dựng với **50+ API endpoints** bao gồm đầy đủ các tính năng:
- ✅ Authentication & Authorization
- ✅ User Management (Admin, Employer, Candidate)
- ✅ CV Management
- ✅ Company Management
- ✅ Job Management & Applications
- ✅ Notifications System
- ✅ Reviews & Ratings
- ✅ File Upload
- ✅ AI Integration
- ✅ Admin Dashboard

**Công nghệ sử dụng**: TypeScript, Express.js, Prisma ORM, JWT, PostgreSQL/MySQL

**Kiến trúc**: RESTful API, Modular structure, Middleware pattern
