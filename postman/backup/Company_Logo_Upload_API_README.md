# Company Logo Upload API

API để quản lý logo của company với Firebase Storage.

## Endpoints

### 1. Upload Company Logo
**POST** `/api/companies/{companyId}/logo`

Upload logo mới cho company.

#### Request
- **Method**: POST
- **Headers**: 
  - `Authorization: Bearer <jwt_token>` (Recruiter hoặc Admin)
  - `Content-Type: multipart/form-data`
- **Body**: 
  - `avatar` (file): File ảnh (PNG, JPEG, JPG, WEBP, tối đa 5MB)

#### Response
```json
{
  "success": true,
  "data": {
    "logoUrl": "https://firebasestorage.googleapis.com/v0/b/jobsconnect-dafde.firebasestorage.app/o/logos%2Fcompany-id%2F1234567890.jpg?alt=media&token=abc123",
    "company": {
      "id": "company-id",
      "name": "ABC Company",
      "logoUrl": "https://firebasestorage.googleapis.com/v0/b/jobsconnect-dafde.firebasestorage.app/o/logos%2Fcompany-id%2F1234567890.jpg?alt=media&token=abc123"
    }
  },
  "message": "Tải lên logo thành công"
}
```

#### Error Responses
- **400**: Không có file hoặc file không hợp lệ
- **401**: Không xác thực được user
- **403**: Không có quyền (cần Recruiter hoặc Admin)
- **500**: Lỗi server

### 2. Delete Company Logo
**DELETE** `/api/companies/{companyId}/logo`

Xóa logo của company.

#### Request
- **Method**: DELETE
- **Headers**: 
  - `Authorization: Bearer <jwt_token>` (Recruiter hoặc Admin)

#### Response
```json
{
  "success": true,
  "data": {
    "company": {
      "id": "company-id",
      "name": "ABC Company",
      "logoUrl": null
    }
  },
  "message": "Xóa logo thành công"
}
```

## Tính năng

### ✅ Tự động xóa logo cũ
- Khi upload logo mới, hệ thống sẽ tự động xóa logo cũ từ Firebase Storage
- Chỉ xóa file từ Firebase Storage (không xóa file từ nguồn khác)
- Nếu lỗi khi xóa file cũ, upload vẫn thành công (log warning)

### ✅ Validation
- **File type**: Chỉ chấp nhận PNG, JPEG, JPG, WEBP
- **File size**: Tối đa 5MB
- **Authentication**: Bắt buộc phải đăng nhập
- **Authorization**: Cần quyền Recruiter hoặc Admin

### ✅ Firebase Storage Integration
- File được lưu trữ trên Firebase Storage
- Path format: `logos/{companyId}/{timestamp}.{extension}`
- Metadata bao gồm companyId, type, uploadedAt

## Cách sử dụng

### 1. Upload Company Logo
```bash
curl -X POST http://localhost:3000/api/companies/{companyId}/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/your/logo.jpg"
```

### 2. Delete Company Logo
```bash
curl -X DELETE http://localhost:3000/api/companies/{companyId}/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Postman Collection

Import file `Company Logo Upload API.postman_collection.json` vào Postman để test:

1. Set biến `base_url` = `http://localhost:3000`
2. Set biến `auth_token` = JWT token của user có quyền Recruiter/Admin
3. Set biến `company_id` = ID của company
4. Chạy request "Upload Company Logo" với file ảnh
5. Chạy request "Delete Company Logo" để xóa logo

## Phân quyền

### ✅ Có thể upload/delete logo:
- **Admin**: Tất cả company
- **Recruiter**: Company mà họ là member

### ❌ Không thể upload/delete logo:
- **User thường**: Không có quyền
- **User không thuộc company**: Không có quyền

## Lưu ý

- Logo cũ sẽ được tự động xóa khi upload logo mới
- Nếu muốn xóa logo mà không upload mới, sử dụng endpoint DELETE
- File được lưu trữ trên Firebase Storage với path có timestamp để tránh conflict
- Hệ thống chỉ xóa file từ Firebase Storage, không ảnh hưởng đến file từ nguồn khác
- Cần quyền Recruiter hoặc Admin để thực hiện các thao tác
