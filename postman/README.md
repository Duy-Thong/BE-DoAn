# 📮 Postman API Collections - Recruitment System

Bộ collection Postman đầy đủ cho hệ thống tuyển dụng với các tính năng tự động hóa và test scripts.

## 📚 Danh sách Collections

### 1. **Development.postman_environment.json**
Environment file chứa tất cả biến môi trường được sử dụng trong các collection.

### 2. **01-Auth-APIs.postman_collection.json**
Quản lý authentication và authorization:
- ✅ Register (Đăng ký tài khoản mới)
- ✅ Login (Đăng nhập - tự động lưu tokens)
- ✅ Refresh Token (Làm mới access token)
- ✅ Verify Email (Xác thực email)
- ✅ Resend Verification (Gửi lại email xác thực)
- ✅ Forgot Password (Quên mật khẩu)
- ✅ Reset Password (Đặt lại mật khẩu)
- ✅ Logout (Đăng xuất)

### 3. **02-User-Management-APIs.postman_collection.json**
Quản lý người dùng:
- **Profile Management** (Quản lý profile cá nhân)
  - Get/Update My Profile
  - Change Password
  - Upload/Delete Avatar
- **User CRUD** (CRUD người dùng)
  - List Users (với pagination và filters)
  - Get/Create/Update/Delete User
- **User Management** (Quản lý Admin)
  - Lock/Unlock User
  - Verify Email

### 4. **03-Companies-APIs.postman_collection.json**
Quản lý công ty:
- **Public APIs** (APIs công khai)
  - List/Get Companies
  - Get Company Jobs
- **Company CRUD** (CRUD công ty)
  - Create/Update/Delete Company
- **Status Management** (Quản lý trạng thái - Admin)
  - Verify/Unverify Company
  - Activate/Deactivate Company
- **Members Management** (Quản lý thành viên)
  - Get/Assign/Remove Members
  - Update Member Role
- **Media Management** (Quản lý media)
  - Upload/Delete Logo
  - Upload/Delete Banner

### 5. **04-Jobs-APIs.postman_collection.json**
Quản lý công việc:
- **Public APIs** (APIs công khai)
  - List/Get Jobs (với filters)
  - Track Job View
- **Job CRUD** (CRUD công việc)
  - Create/Update/Delete Job
  - Get Job Applications
- **Company Job Management**
  - Get Company Jobs
  - Repost Job

### 6. **05-CVs-APIs.postman_collection.json**
Quản lý CV:
- **CV Management**
  - Get My CVs
  - Get/Create/Update/Delete CV
  - Duplicate CV
  - Set Main CV
- **Templates & Download**
  - Get CV Templates
  - Download CV as PDF
  - Download Main CV as PDF

### 7. **06-Applications-APIs.postman_collection.json**
Quản lý đơn ứng tuyển:
- **My Applications** (Ứng viên)
  - Get My Applications
  - Create/Update/Delete Application
- **Application Management** (Recruiter/Admin)
  - List All Applications
  - Get Application Details
  - Get Applications for Job
  - Update Application Status (REVIEWED, SHORTLISTED, INTERVIEW, OFFERED, REJECTED)

### 8. **07-CV-Templates-APIs.postman_collection.json**
Quản lý CV Templates - **Admin Only**:

**Important:** End users không tương tác trực tiếp với template APIs. Họ chỉ sử dụng API download CV, server sẽ tự động lấy template và render PDF.

- **Admin CRUD** (Admin only, chuẩn REST)
  - **POST** `/admin/templates` - Create template (với HTML + preview image)
  - **GET** `/admin/templates` - Get all templates (với filters)
  - **GET** `/admin/templates/:id` - Get template by ID
  - **PUT** `/admin/templates/:id` - Update template (metadata, HTML, hoặc preview)
  - **DELETE** `/admin/templates/:id` - Delete template
  - **GET** `/admin/templates/stats` - Get usage statistics

**Note:** Tất cả endpoints yêu cầu Admin role và sử dụng `multipart/form-data` cho file uploads.

---

## 🚀 Hướng dẫn sử dụng

### Bước 1: Import vào Postman

1. Mở Postman
2. Click **Import** 
3. Chọn tất cả các file `.json` trong thư mục `postman/`
4. Click **Import**

### Bước 2: Thiết lập Environment

1. Trong Postman, chọn **Development** environment (góc trên bên phải)
2. Kiểm tra và cập nhật các biến môi trường nếu cần:
   - `baseUrl`: URL của API server (mặc định: `http://localhost:3000/api`)
   - Các biến khác sẽ tự động được set bởi test scripts

### Bước 3: Chạy APIs

#### 📌 Luồng cơ bản:

**1. Authentication Flow:**
```
Register → Login (tự động lưu tokens) → Access Protected APIs
```

**2. Create Job Application Flow:**
```
Login → Get My CVs → Get Jobs → Create Application
```

**3. Recruiter Review Applications Flow:**
```
Login (as Recruiter) → Get Job Applications → Update Application Status
```

---

## 🔑 Biến môi trường tự động

Các biến sau được tự động lưu bởi test scripts:

| Biến | Được set bởi | Mô tả |
|------|-------------|-------|
| `authToken` | Login, Register, Refresh Token | Access token để xác thực |
| `refreshToken` | Login, Register | Refresh token để lấy access token mới |
| `userId` | Login | ID của user hiện tại |
| `userEmail` | Login | Email của user hiện tại |
| `userRole` | Login | Role của user (ADMIN, RECRUITER, CANDIDATE) |
| `companyId` | List Companies, Create Company | ID công ty được chọn |
| `jobId` | List Jobs, Create Job | ID công việc được chọn |
| `cvId` | Get My CVs, Create CV | ID CV được chọn |
| `applicationId` | Create Application | ID đơn ứng tuyển được chọn |
| `templateId` | Get All Templates | ID template được chọn |
| `newTemplateId` | Create Template | ID template mới tạo |
| `testUserId` | Register, Create User | ID user test |

---

## ✨ Tính năng nổi bật

### 1. 🤖 Tự động lưu tokens
- Login/Register tự động lưu `authToken` và `refreshToken`
- Refresh Token tự động cập nhật cả hai tokens
- Tất cả protected routes tự động sử dụng token từ environment

### 2. 📊 Test Scripts đầy đủ
Mỗi request đều có test scripts để:
- ✅ Kiểm tra status code
- ✅ Validate response structure
- ✅ Tự động lưu IDs và tokens
- ✅ Log thông tin hữu ích ra Console

### 3. 🔄 Auto-generated test data
- Register: tự động tạo email unique
- Create User: tự động tạo email unique
- Tránh lỗi duplicate khi test

### 4. 📝 Documentation chi tiết
- Mỗi request có description rõ ràng
- Query parameters được document với ví dụ
- Body examples cho POST/PUT requests

---

## 👥 Test Accounts

Database seed tạo sẵn các tài khoản test:

### Admin Account
```
Email: admin@example.com
Password: Admin@123456
Role: ADMIN
```

### Recruiter Accounts
```
Email: recruiter1@example.com
Password: Recruiter@123456
Role: RECRUITER

Email: recruiter2@example.com
Password: Recruiter@123456
Role: RECRUITER
```

### Candidate Accounts
```
Email: candidate1@example.com
Password: Candidate@123456
Role: CANDIDATE

Email: candidate2@example.com
Password: Candidate@123456
Role: CANDIDATE

Email: candidate3@example.com
Password: Candidate@123456
Role: CANDIDATE
```

---

## 🧪 Testing Workflow

### Scenario 1: Candidate tìm việc và apply
```
1. Login với candidate account
2. Get My CVs → Lưu cvId
3. List Jobs → Lưu jobId
4. Get Job Details
5. Create Application (dùng cvId và jobId)
6. Get My Applications → Xem đơn đã nộp
```

### Scenario 2: Recruiter post job và review applications
```
1. Login với recruiter account
2. Get My Company → Lưu companyId
3. Create Job (dùng companyId)
4. Get Job Applications → Xem danh sách ứng viên
5. Update Application Status (REVIEWED → SHORTLISTED → INTERVIEW → OFFERED)
```

### Scenario 3: Admin quản lý system
```
1. Login với admin account
2. List All Users
3. List All Companies
4. Verify Company
5. Lock/Unlock User
6. Manage Company Status
```

---

## 📱 Request Organization

Collections được tổ chức theo folders logic:

```
01-Auth-APIs
├── Register
├── Login
├── Refresh Token
└── ...

02-User-Management-APIs
├── Profile Management
│   ├── Get My Profile
│   ├── Update My Profile
│   └── ...
├── User CRUD
│   ├── List Users
│   └── ...
└── User Management (Admin)

03-Companies-APIs
├── Public Company APIs
├── Company CRUD
├── Status Management
├── Members Management
└── Media Management

... và tiếp tục
```

---

## 🔧 Troubleshooting

### Lỗi: "Unauthorized" hoặc 401
**Giải pháp:**
1. Chạy lại **Login** request
2. Kiểm tra `authToken` trong environment có được set chưa
3. Token có thể đã expire, chạy **Refresh Token**

### Lỗi: "Environment variable not found"
**Giải pháp:**
1. Đảm bảo đã chọn **Development** environment
2. Chạy các requests theo thứ tự (Login trước, sau đó các protected APIs)

### Lỗi: "Invalid ID" hoặc 404
**Giải pháp:**
1. Kiểm tra biến môi trường (`companyId`, `jobId`, `cvId`, etc.) có giá trị chưa
2. Chạy lại request để lấy ID (ví dụ: List Companies để lấy companyId)

### Database empty
**Giải pháp:**
```bash
npm run prisma:seed
```

---

## 💡 Tips & Best Practices

### 1. Sử dụng Console Log
- Mở **Postman Console** (View → Show Postman Console)
- Xem logs chi tiết về tokens và IDs được lưu
- Giúp debug dễ dàng hơn

### 2. Run Collection
- Click chuột phải vào Collection → **Run Collection**
- Chạy toàn bộ collection để test automation
- Xem kết quả tests một cách trực quan

### 3. Export/Import
- Export collections thường xuyên để backup
- Share với team members
- Version control với Git

### 4. Environment Variables
- Tạo multiple environments (Development, Staging, Production)
- Switch giữa các environments dễ dàng
- Không hardcode URLs hoặc IDs

### 5. Pre-request Scripts
- Một số requests có pre-request scripts
- Tự động generate data (như unique email)
- Không cần sửa manual

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra Server đang chạy (`npm run dev`)
2. Kiểm tra Database connection
3. Xem Postman Console để debug
4. Đọc lại documentation của từng request

---

## 📝 Changelog

### Version 1.2.0 (2025-10-25)
- ✅ Refactor CV Templates APIs thành **Admin-only**
- ✅ Xóa tất cả public endpoints (end users không cần tương tác trực tiếp với templates)
- ✅ Template rendering được xử lý hoàn toàn ở server-side trong API download CV
- ✅ Đơn giản hóa flow: Admin quản lý templates → Users download CV with template

### Version 1.1.0 (2025-10-25)
- ✅ Thêm CV Templates APIs collection (07-CV-Templates-APIs)
- ✅ CRUD chuẩn REST cho templates
- ✅ Template creation/update với HTML + preview image trong 1 request (multipart/form-data)
- ✅ Loại bỏ các endpoints riêng lẻ `/html`, `/preview` - merge vào UPDATE endpoint

### Version 1.0.0 (2025-10-25)
- ✅ Tạo mới 6 collections đầy đủ
- ✅ Environment file với biến thống nhất
- ✅ Auto token management
- ✅ Comprehensive test scripts
- ✅ Auto-generated test data
- ✅ Full documentation

---

## 🎯 Next Steps

1. Import tất cả collections vào Postman
2. Chọn Development environment
3. Chạy seed database
4. Login với test account
5. Explore các APIs!

**Happy Testing! 🚀**

