# Social Media APIs - Postman Collection

## 📋 Tổng quan

Collection này chứa tất cả các API để quản lý mạng xã hội cho **Companies** và **CVs** trong hệ thống Recruitment.

## 🚀 Cài đặt

### 1. Import Collection
- Mở Postman
- Click **Import** → **Upload Files**
- Chọn file `Social Media APIs.postman_collection.json`

### 2. Import Environment
- Click **Import** → **Upload Files**  
- Chọn file `Social Media APIs - Environment.postman_environment.json`
- Chọn environment này trong dropdown (top-right)

### 3. Cấu hình Environment Variables
```
baseUrl: http://localhost:3000/api
accessToken: [JWT token của bạn]
companyId: [ID của company]
cvId: [ID của CV]
socialMediaId: [ID của social media - auto-saved]
```

## 📁 Cấu trúc Collection

### 🏢 Company Social Media
- **List Company Social Media** - Lấy danh sách mạng xã hội của company
- **Add Company Social Media** - Thêm mạng xã hội mới cho company
- **Get Company Social Media** - Lấy chi tiết 1 mạng xã hội
- **Update Company Social Media** - Cập nhật mạng xã hội
- **Delete Company Social Media** - Xóa mạng xã hội

### 📄 CV Social Media  
- **List CV Social Media** - Lấy danh sách mạng xã hội của CV
- **Add CV Social Media** - Thêm mạng xã hội mới cho CV
- **Get CV Social Media** - Lấy chi tiết 1 mạng xã hội
- **Update CV Social Media** - Cập nhật mạng xã hội
- **Delete CV Social Media** - Xóa mạng xã hội

## 🔧 Tính năng Auto-Save

Collection có tính năng **auto-save IDs**:
- Khi tạo mới social media → tự động save `socialMediaId`
- Khi tạo mới company → tự động save `companyId` 
- Khi tạo mới CV → tự động save `cvId`

**Xem console log:**
- Click **Console** (bottom left trong Postman)
- Xem các log: `✅ Auto-saved socialMediaId: xxx`

## 📝 Cách sử dụng

### Workflow cơ bản:

1. **Setup Authentication**
   ```
   accessToken: [lấy từ login API]
   ```

2. **Company Social Media Workflow**
   ```
   1. Set companyId trong environment
   2. List Company Social Media → xem danh sách hiện có
   3. Add Company Social Media → tạo mới (auto-save socialMediaId)
   4. Get/Update/Delete Company Social Media → dùng socialMediaId đã save
   ```

3. **CV Social Media Workflow**
   ```
   1. Set cvId trong environment  
   2. List CV Social Media → xem danh sách hiện có
   3. Add CV Social Media → tạo mới (auto-save socialMediaId)
   4. Get/Update/Delete CV Social Media → dùng socialMediaId đã save
   ```

## 🌐 Các nền tảng hỗ trợ

- **LINKEDIN** - LinkedIn profile/company page
- **FACEBOOK** - Facebook page/profile
- **TWITTER** - Twitter profile
- **INSTAGRAM** - Instagram profile
- **GITHUB** - GitHub profile
- **BLOG** - Personal/company blog
- **WEBSITE** - Company website
- **YOUTUBE** - YouTube channel
- **TIKTOK** - TikTok profile
- **DISCORD** - Discord server

## 📊 Request Body Examples

### Company Social Media
```json
{
  "platform": "LINKEDIN",
  "url": "https://linkedin.com/company/techcompany",
  "username": "techcompany",
  "isPublic": true
}
```

### CV Social Media
```json
{
  "platform": "GITHUB", 
  "url": "https://github.com/username",
  "username": "username",
  "isPublic": true
}
```

## ✅ Tests tự động

Mỗi request đều có tests tự động:
- ✅ Response time < 5000ms
- ✅ Response có field `success`
- ✅ Response thành công có field `data`
- ✅ Response lỗi có field `error`

## 🔐 Authentication

Tất cả endpoints đều yêu cầu:
```
Authorization: Bearer {{accessToken}}
```

## 📍 API Endpoints

### Company Social Media
```
GET    /companies/:companyId/social-media
POST   /companies/:companyId/social-media  
GET    /companies/:companyId/social-media/:id
PUT    /companies/:companyId/social-media/:id
DELETE /companies/:companyId/social-media/:id
```

### CV Social Media
```
GET    /cvs/:cvId/social-media
POST   /cvs/:cvId/social-media
GET    /cvs/:cvId/social-media/:id  
PUT    /cvs/:cvId/social-media/:id
DELETE /cvs/:cvId/social-media/:id
```

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **401 Unauthorized**
   - Kiểm tra `accessToken` trong environment
   - Token có thể đã hết hạn

2. **404 Not Found** 
   - Kiểm tra `companyId` hoặc `cvId` có đúng không
   - Kiểm tra `socialMediaId` có tồn tại không

3. **400 Bad Request**
   - Kiểm tra request body format
   - Kiểm tra URL có hợp lệ không
   - Kiểm tra platform có được hỗ trợ không

### Debug:
- Xem **Console** để check auto-save logs
- Xem **Response** để check error message chi tiết
- Kiểm tra **Environment Variables** có đúng không

## 📞 Support

Nếu gặp vấn đề, hãy:
1. Check console logs
2. Verify environment variables  
3. Check API server có chạy không
4. Check network connectivity
