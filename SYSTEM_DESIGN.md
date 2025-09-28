# Hệ Thống Tuyển Dụng Trực Tuyến - Thiết Kế Mới

## Tổng Quan
Hệ thống backend cho nền tảng tuyển dụng trực tuyến với đầy đủ các chức năng quản lý ứng viên, nhà tuyển dụng và admin.

## Cấu Trúc Database

### Models Chính
- **User**: Quản lý người dùng với roles (ADMIN, RECRUITER, CANDIDATE)
- **Company**: Thông tin công ty với xác minh
- **CompanyMember**: Quản lý thành viên công ty với roles (OWNER, MANAGER, RECRUITER, VIEWER)
- **Job**: Tin tuyển dụng với kiểm duyệt
- **Application**: Đơn ứng tuyển
- **CV**: Quản lý CV của ứng viên
- **JobRecommendation**: Gợi ý việc làm
- **InternalNote**: Ghi chú nội bộ cho nhà tuyển dụng

## Các Module Chính

### 1. CV Management (`/api/cvs`)
**Chức năng cho ứng viên:**
- ✅ Tạo CV mới
- ✅ Chỉnh sửa CV
- ✅ Xóa CV
- ✅ Đặt CV làm CV chính
- ✅ Download CV
- ✅ Xem danh sách CV

### 2. Company Members (`/api/company-members`)
**Chức năng quản lý thành viên công ty:**
- ✅ Mời thành viên vào công ty
- ✅ Phân quyền thành viên (OWNER, MANAGER, RECRUITER, VIEWER)
- ✅ Xóa thành viên khỏi công ty
- ✅ Xem danh sách thành viên

### 3. Application Management (`/api/application-management`)
**Chức năng ứng tuyển:**
- ✅ Ứng viên ứng tuyển việc làm
- ✅ Xem danh sách ứng tuyển của ứng viên
- ✅ Nhà tuyển dụng xem danh sách ứng viên
- ✅ Cập nhật trạng thái ứng tuyển
- ✅ Thêm ghi chú nội bộ
- ✅ Xem chi tiết ứng viên

### 4. Job Recommendations (`/api/job-recommendations`)
**Hệ thống gợi ý việc làm:**
- ✅ Tạo gợi ý dựa trên profile và job alerts
- ✅ Lưu gợi ý đã tạo
- ✅ Cập nhật điểm gợi ý
- ✅ Xóa gợi ý

### 5. Admin Management (`/api/admin`)
**Chức năng quản trị:**
- ✅ Quản lý tài khoản (xem, khóa/mở khóa, xóa)
- ✅ Kiểm duyệt tin tuyển dụng
- ✅ Xác minh tài khoản công ty
- ✅ Dashboard thống kê

### 6. Company Info (`/api/company-info`)
**Xem thông tin công ty:**
- ✅ Xem chi tiết công ty
- ✅ Xem danh sách việc làm của công ty
- ✅ Tìm kiếm công ty
- ✅ Danh sách công ty nổi bật

### 7. Jobs Management (Cập nhật)
**Quản lý việc làm:**
- ✅ Tạo tin tuyển dụng (cần duyệt)
- ✅ Sửa tin tuyển dụng
- ✅ Tái đăng tin tuyển dụng
- ✅ Xem danh sách việc làm của công ty
- ✅ Kiểm duyệt tin tuyển dụng (Admin)

### 8. Companies Management (Cập nhật)
**Quản lý công ty:**
- ✅ Tạo công ty (cần xác minh)
- ✅ Cập nhật thông tin công ty
- ✅ Xóa công ty
- ✅ Xem danh sách công ty của user

## Use Cases Đã Triển Khai

### Ứng Viên
1. ✅ Đăng ký/đăng nhập tài khoản
2. ✅ Cài đặt thông tin cá nhân
3. ✅ Tạo/sửa/xóa CV
4. ✅ Đặt CV làm CV chính
5. ✅ Download CV
6. ✅ Tìm việc làm
7. ✅ Xem chi tiết việc làm
8. ✅ Xem thông tin công ty
9. ✅ Ứng tuyển việc làm
10. ✅ Xem việc làm đã ứng tuyển
11. ✅ Xem gợi ý việc làm

### Nhà Tuyển Dụng
1. ✅ Đăng ký tài khoản
2. ✅ Tạo công ty
3. ✅ Mời thành viên công ty
4. ✅ Phân quyền thành viên
5. ✅ Xóa thành viên
6. ✅ Tạo tin tuyển dụng
7. ✅ Sửa tin tuyển dụng
8. ✅ Tái đăng tin tuyển dụng
9. ✅ Xem danh sách ứng viên
10. ✅ Xem chi tiết ứng viên
11. ✅ Thêm ghi chú nội bộ
12. ✅ Duyệt đơn ứng tuyển

### Admin
1. ✅ Đăng nhập tài khoản
2. ✅ Xem danh sách tài khoản
3. ✅ Khóa/mở khóa tài khoản
4. ✅ Xóa tài khoản
5. ✅ Kiểm duyệt tin tuyển dụng
6. ✅ Kiểm duyệt tài khoản công ty

## API Endpoints

### CV Management
```
POST   /api/cvs                    # Tạo CV
GET    /api/cvs                    # Lấy danh sách CV
GET    /api/cvs/main               # Lấy CV chính
GET    /api/cvs/:cvId              # Lấy CV theo ID
PUT    /api/cvs/:cvId              # Cập nhật CV
DELETE /api/cvs/:cvId              # Xóa CV
POST   /api/cvs/set-main           # Đặt CV chính
GET    /api/cvs/:cvId/download     # Download CV
```

### Company Members
```
POST   /api/company-members/:companyId/invite     # Mời thành viên
GET    /api/company-members/:companyId            # Danh sách thành viên
PUT    /api/company-members/:companyId/role       # Cập nhật role
DELETE /api/company-members/:companyId/remove     # Xóa thành viên
GET    /api/company-members/:companyId/my-role    # Role của user
```

### Application Management
```
POST   /api/application-management/apply                    # Ứng tuyển
GET    /api/application-management/my-applications          # Đơn ứng tuyển của user
GET    /api/application-management/company/:companyId       # Danh sách ứng tuyển (recruiter)
PUT    /api/application-management/company/:companyId/status # Cập nhật trạng thái
POST   /api/application-management/company/:companyId/note  # Thêm ghi chú
GET    /api/application-management/company/:companyId/candidate/:candidateId # Chi tiết ứng viên
```

### Job Recommendations
```
GET    /api/job-recommendations/generate    # Tạo gợi ý mới
GET    /api/job-recommendations/saved       # Gợi ý đã lưu
PUT    /api/job-recommendations/update      # Cập nhật điểm
DELETE /api/job-recommendations/:jobId      # Xóa gợi ý
```

### Admin
```
GET    /api/admin/dashboard                 # Thống kê
GET    /api/admin/users                     # Danh sách users
PUT    /api/admin/users/status              # Cập nhật trạng thái user
DELETE /api/admin/users                     # Xóa user
GET    /api/admin/jobs                      # Danh sách jobs
PUT    /api/admin/jobs/approve              # Duyệt job
GET    /api/admin/companies                 # Danh sách companies
PUT    /api/admin/companies/verify          # Xác minh company
```

### Company Info
```
GET    /api/company-info/search             # Tìm kiếm công ty
GET    /api/company-info/featured           # Công ty nổi bật
GET    /api/company-info/:companyId         # Chi tiết công ty
GET    /api/company-info/:companyId/jobs    # Việc làm của công ty
```

## Tính Năng Nổi Bật

### 1. Hệ Thống Phân Quyền
- **User Roles**: ADMIN, RECRUITER, CANDIDATE
- **Company Roles**: OWNER, MANAGER, RECRUITER, VIEWER
- Phân quyền chi tiết cho từng chức năng

### 2. Kiểm Duyệt Nội Dung
- Tin tuyển dụng cần được admin duyệt
- Công ty cần được admin xác minh
- Hệ thống trạng thái rõ ràng

### 3. Gợi Ý Thông Minh
- Thuật toán gợi ý dựa trên profile, skills, location
- Tích hợp với job alerts
- Điểm số và lý do gợi ý

### 4. Quản Lý CV Linh Hoạt
- Nhiều CV cho một user
- CV chính để ứng tuyển
- Upload và download file

### 5. Quản Lý Thành Viên Công Ty
- Mời thành viên qua email
- Phân quyền chi tiết
- Quản lý quyền truy cập

## Cài Đặt và Chạy

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Cấu hình database:**
```bash
# Tạo file .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/topcv?schema=public"
```

3. **Chạy migration:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. **Chạy server:**
```bash
npm run dev
```

## Health Check
```
GET http://localhost:4000/health
```

Hệ thống đã được thiết kế lại hoàn chỉnh với tất cả các use cases yêu cầu!
