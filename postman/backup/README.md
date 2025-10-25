# Postman Collections

## 📁 Files

- `Company_API.postman_collection.json` - Company API Collection (bao gồm cả variables)

## 🚀 Setup Instructions

### 1. Import vào Postman

1. Mở Postman
2. Click **Import** button (góc trên bên trái)
3. Chọn file `Company_API.postman_collection.json`
4. Done! Collection đã có sẵn variables

### 2. Cấu hình Variables

**Collection Variables** (đã có sẵn trong collection):
- `baseUrl`: `http://localhost:3000/api`
- `accessToken`: (để trống, sẽ set sau khi login)
- `companyId`: (để trống, sẽ set khi tạo/get company)
- `userId`: (để trống)
- `socialMediaId`: (để trống)

**Để edit variables:**
1. Right-click vào Collection "Company API"
2. Chọn **Edit**
3. Tab **Variables**
4. Update giá trị cần thiết

### 3. Authentication Flow

**Bước 1: Login để lấy token**
```
POST {{baseUrl}}/auth/login
Body:
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Bước 2: Copy accessToken từ response**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",  // ← Copy cái này
    "refreshToken": "...",
    "user": {...}
  }
}
```

**Bước 3: Set vào Collection Variable**
1. Right-click vào Collection "Company API"
2. Chọn **Edit**
3. Tab **Variables**
4. Paste token vào field `accessToken` (ở cột CURRENT VALUE)
5. Save

### 4. Auto-Save Variables (Test Scripts)

Collection có **test scripts tự động** để lưu IDs:

**✨ Scripts tự động lưu:**
- `List Companies` → Auto-save `companyId` từ company đầu tiên
- `Create Company` → Auto-save `companyId` từ response
- `Get Company Users` → Auto-save `userId` từ user đầu tiên
- `Add Social Media` → Auto-save `socialMediaId` từ response

**📊 Global Scripts:**
- **Pre-request**: Log tên request
- **Test**: Log status code và errors (nếu có)

**Cách hoạt động:**
1. Gọi `Create Company` → `companyId` được tự động save
2. Gọi `Add Social Media` → Dùng `{{companyId}}` từ bước 1, save `socialMediaId`
3. Gọi `Update Social Media` → Dùng cả 2 variables

**Xem console log:**
- Click **Console** (bottom left trong Postman)
- Xem logs: `✅ Saved companyId: clu...`

### 5. Sử dụng Collection

Tất cả các requests đã được configure sẵn với:
- ✅ Headers (Authorization, Content-Type)
- ✅ Body templates với sample data
- ✅ Query parameters với mô tả
- ✅ Path variables (companyId, userId, etc.)
- ✅ **Auto-save test scripts** ⭐

**Example Workflow:**

1. **Create Company**
   - Request: `POST /companies`
   - Copy `id` từ response
   - Paste vào Environment variable `companyId`

2. **Get Company**
   - Request: `GET /companies/:companyId`
   - Auto dùng `{{companyId}}` từ environment

3. **Add Social Media**
   - Request: `POST /companies/:companyId/social-media`
   - Copy `id` từ response để update/delete sau

## 📋 API Groups

### 1. Public APIs
Không cần authentication:
- List Companies (với filters)
- Get Company Detail
- Get Company Jobs

### 2. Company CRUD
Cần authentication (RECRUITER or ADMIN):
- Create Company
- Update Company
- Delete Company (ADMIN only)

### 3. Status Management
Cần ADMIN role:
- Verify/Unverify Company
- Activate/Deactivate Company

### 4. User/Member Management
Cần authentication (RECRUITER or ADMIN):
- List Users
- Add User to Company
- Update User Role
- Remove User

### 5. Social Media
Cần authentication:
- CRUD Social Media Links

## 🔑 Company Roles

- **OWNER**: Full control over company
- **MANAGER**: Can manage members and jobs
- **MEMBER**: Can manage jobs
- **VIEWER**: Read-only access

## 🏢 Company Sizes

- `STARTUP`: 1-10 employees
- `SMALL`: 11-50 employees
- `MEDIUM`: 51-200 employees
- `LARGE`: 201-1000 employees
- `ENTERPRISE`: 1000+ employees

## 🌐 Social Media Platforms

- `LINKEDIN`
- `FACEBOOK`
- `TWITTER`
- `INSTAGRAM`
- `YOUTUBE`
- `GITHUB`
- `WEBSITE`

## 📝 Notes

- Tất cả dates/times theo ISO 8601 format
- Pagination: Default `page=1`, `limit=10`, max `limit=100`
- Search: Case-insensitive, tìm trong name, description, industry
- Sort: `createdAt`, `updatedAt`, `name` với order `asc`/`desc`

## 🐛 Troubleshooting

**401 Unauthorized:**
- Check accessToken đã được set trong Environment chưa
- Token có thể đã expired, login lại để lấy token mới

**403 Forbidden:**
- Check user role có đủ quyền không
- Một số APIs chỉ cho ADMIN hoặc RECRUITER

**404 Not Found:**
- Check IDs (companyId, userId, etc.) có đúng không
- Check resource có tồn tại không

## 📚 Related Collections

Sẽ có thêm:
- Auth API Collection
- User API Collection
- CV API Collection
- Jobs API Collection
- Applications API Collection
