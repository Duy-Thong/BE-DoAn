# User Avatar Upload API

API để quản lý avatar của user với Firebase Storage.

## Endpoints

### 1. Upload Avatar
**POST** `/api/users/me/avatar`

Upload avatar mới cho user hiện tại.

#### Request
- **Method**: POST
- **Headers**: 
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: multipart/form-data`
- **Body**: 
  - `avatar` (file): File ảnh (PNG, JPEG, JPG, WEBP, tối đa 5MB)

#### Response
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://firebasestorage.googleapis.com/v0/b/jobsconnect-dafde.firebasestorage.app/o/avatars%2Fuser-id%2F1234567890.jpg?alt=media&token=abc123",
    "user": {
      "id": "user-id",
      "fullName": "Nguyễn Văn A",
      "email": "user@example.com",
      "avatarUrl": "https://firebasestorage.googleapis.com/v0/b/jobsconnect-dafde.firebasestorage.app/o/avatars%2Fuser-id%2F1234567890.jpg?alt=media&token=abc123"
    }
  },
  "message": "Tải lên avatar thành công"
}
```

#### Error Responses
- **400**: Không có file hoặc file không hợp lệ
- **401**: Không xác thực được user
- **500**: Lỗi server

### 2. Delete Avatar
**DELETE** `/api/users/me/avatar`

Xóa avatar của user hiện tại.

#### Request
- **Method**: DELETE
- **Headers**: 
  - `Authorization: Bearer <jwt_token>`

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "fullName": "Nguyễn Văn A",
      "email": "user@example.com",
      "avatarUrl": null
    }
  },
  "message": "Xóa avatar thành công"
}
```

## Tính năng

### ✅ Tự động xóa avatar cũ
- Khi upload avatar mới, hệ thống sẽ tự động xóa avatar cũ từ Firebase Storage
- Chỉ xóa file từ Firebase Storage (không xóa file từ nguồn khác)
- Nếu lỗi khi xóa file cũ, upload vẫn thành công (log warning)

### ✅ Validation
- **File type**: Chỉ chấp nhận PNG, JPEG, JPG, WEBP
- **File size**: Tối đa 5MB
- **Authentication**: Bắt buộc phải đăng nhập

### ✅ Firebase Storage Integration
- File được lưu trữ trên Firebase Storage
- Path format: `avatars/{userId}/{timestamp}.{extension}`
- Metadata bao gồm userId, type, uploadedAt

## Cách sử dụng

### 1. Upload Avatar
```bash
curl -X POST http://localhost:3000/api/users/me/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/your/image.jpg"
```

### 2. Delete Avatar
```bash
curl -X DELETE http://localhost:3000/api/users/me/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Postman Collection

Import file `User Avatar Upload API.postman_collection.json` vào Postman để test:

1. Set biến `base_url` = `http://localhost:3000`
2. Set biến `auth_token` = JWT token của user
3. Chạy request "Upload My Avatar" với file ảnh
4. Chạy request "Delete My Avatar" để xóa avatar

## Lưu ý

- Avatar cũ sẽ được tự động xóa khi upload avatar mới
- Nếu muốn xóa avatar mà không upload mới, sử dụng endpoint DELETE
- File được lưu trữ trên Firebase Storage với path có timestamp để tránh conflict
- Hệ thống chỉ xóa file từ Firebase Storage, không ảnh hưởng đến file từ nguồn khác
