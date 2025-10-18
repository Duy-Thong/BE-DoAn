# API Implementation Guide

## Tổng quan

Tài liệu này mô tả cấu trúc CRUD API đã được xây dựng cho hệ thống tuyển dụng.

## Cấu trúc Module

Mỗi module tuân theo cấu trúc 4 lớp:

```
src/modules/{module-name}/
├── dto.ts          # Data Transfer Objects & Validation schemas
├── service.ts      # Business logic layer
├── controller.ts   # HTTP request handlers
└── routes.ts       # API route definitions
```

## Modules đã triển khai

### 1. User Module ✅
- **Path**: `/api/users`
- **Features**:
  - List với pagination, filtering, sorting
  - CRUD đầy đủ (Create, Read, Update, Delete)
  - Lock/Unlock user
  - Verify email
  - Tìm kiếm theo email, fullName, phoneNumber

### 2. Company Module (Cần hoàn thiện)
- **Path**: `/api/companies`
- **Features**: Tương tự User module
- **Note**: Schema không có CompanyMember model, sử dụng companyId trong User model

### 3-21. Các Module còn lại

Dưới đây là template chuẩn cho các module còn lại:

## Template Structure

### DTO Template (`dto.ts`)

```typescript
import { z } from 'zod';
import { /* Enums */ } from '../../generated/prisma/index.js';

// Create DTO
export const Create{Entity}Dto = z.object({
  // Define required and optional fields
});
export type Create{Entity}Dto = z.infer<typeof Create{Entity}Dto>;

// Update DTO
export const Update{Entity}Dto = z.object({
  // All fields optional
});
export type Update{Entity}Dto = z.infer<typeof Update{Entity}Dto>;

// Query DTO
export const {Entity}QueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  // Other filters
  sortBy: z.enum([/* sortable fields */]).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type {Entity}QueryDto = z.infer<typeof {Entity}QueryDto>;
```

### Service Template (`service.ts`)

```typescript
import { Prisma } from '../../generated/prisma/index.js';
import { prisma } from '../../loaders/prisma.js';
import { AppError } from '../../utils/error.js';
import type { Create{Entity}Dto, Update{Entity}Dto, {Entity}QueryDto } from './dto.js';

export class {Entity}Service {
  async list(query: {Entity}QueryDto) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const where: Prisma.{Entity}WhereInput = {};

    if (search) {
      where.OR = [/* searchable fields */];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.{entity}.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.{entity}.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(input: Create{Entity}Dto) {
    return prisma.{entity}.create({ data: input });
  }

  async getById(id: string) {
    const entity = await prisma.{entity}.findUnique({ where: { id } });
    if (!entity) {
      throw new AppError('{Entity} không tồn tại', 404);
    }
    return entity;
  }

  async update(id: string, input: Update{Entity}Dto) {
    await this.getById(id); // Check exists
    return prisma.{entity}.update({
      where: { id },
      data: input,
    });
  }

  async remove(id: string) {
    await this.getById(id); // Check exists
    await prisma.{entity}.delete({ where: { id } });
    return { message: 'Xóa thành công' };
  }
}
```

### Controller Template (`controller.ts`)

```typescript
import type { Request, Response } from 'express';
import { {Entity}Service } from './service.js';
import { Create{Entity}Dto, Update{Entity}Dto, {Entity}QueryDto } from './dto.js';

const service = new {Entity}Service();

export const list{Entities} = async (req: Request, res: Response) => {
  try {
    const query = {Entity}QueryDto.parse(req.query);
    const result = await service.list(query);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};

export const create{Entity} = async (req: Request, res: Response) => {
  try {
    const input = Create{Entity}Dto.parse(req.body);
    const data = await service.create(input);
    res.status(201).json({ success: true, data, message: 'Tạo thành công' });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};

export const get{Entity} = async (req: Request, res: Response) => {
  try {
    const data = await service.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};

export const update{Entity} = async (req: Request, res: Response) => {
  try {
    const input = Update{Entity}Dto.parse(req.body);
    const data = await service.update(req.params.id, input);
    res.json({ success: true, data, message: 'Cập nhật thành công' });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};

export const delete{Entity} = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};
```

### Routes Template (`routes.ts`)

```typescript
import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/auth.js';
import {
  list{Entities},
  create{Entity},
  get{Entity},
  update{Entity},
  delete{Entity},
} from './controller.js';

export const {entities}Router = Router();

// Apply authentication middleware
{entities}Router.use(AuthMiddleware.authenticate);

// CRUD routes
{entities}Router.get('/', list{Entities});
{entities}Router.post('/', create{Entity});
{entities}Router.get('/:id', get{Entity});
{entities}Router.put('/:id', update{Entity});
{entities}Router.delete('/:id', delete{Entity});
```

## Danh sách Module cần triển khai

### Core Entities
1. ✅ **User** - User management
2. 🔄 **Company** - Company profiles
3. 🔄 **CV** - Candidate CVs
4. 🔄 **Job** - Job listings
5. ⏳ **Application** - Job applications

### Nested CV Entities (thuộc về CV)
6. ⏳ **WorkExperience** - Work history
7. ⏳ **Education** - Educational background
8. ⏳ **Language** - Language skills
9. ⏳ **Certification** - Certifications
10. ⏳ **Project** - Personal projects
11. ⏳ **Achievement** - Achievements
12. ⏳ **Reference** - References
13. ⏳ **Activity** - Activities
14. ⏳ **CVSkill** - CV skills

### Nested Job Entities (thuộc về Job)
15. ⏳ **JobRequirement** - Job requirements
16. ⏳ **JobBenefit** - Job benefits
17. ⏳ **JobSkill** - Required skills

### Supporting Entities
18. ⏳ **SocialMedia** - Social media links (polymorphic)
19. ⏳ **SavedJob** - Saved jobs
20. ⏳ **Notification** - User notifications
21. ⏳ **Upload** - File uploads

## Notes Quan trọng

### Schema Insights

1. **User-Company Relationship**:
   - User có field `companyId`, `companyRole`, `joinedAt`
   - 1 user chỉ thuộc về 1 company
   - KHÔNG có bảng CompanyMember trung gian

2. **Polymorphic SocialMedia**:
   - Dùng `ownerType` (User|Company|CV) + `ownerId`
   - Cần validate ownerType khi CRUD

3. **CV-User Relationship**:
   - 1 User có nhiều CVs
   - CV có field `isMain` để đánh dấu CV chính

4. **Application Unique Constraint**:
   - `@@unique([cvId, jobId])` - 1 CV chỉ apply 1 Job 1 lần

5. **Embedding Fields**:
   - CV và Job có field `embedding: Float[]` cho AI features
   - Có thể optional hoặc empty array

## Best Practices

1. **Validation**: Sử dụng Zod cho tất cả input validation
2. **Error Handling**: Throw AppError với message và status code rõ ràng
3. **Pagination**: Luôn hỗ trợ pagination cho list endpoints
4. **Filtering**: Cho phép filter theo các trường quan trọng
5. **Sorting**: Hỗ trợ sort theo createdAt, updatedAt mặc định
6. **Security**: Authenticate tất cả routes, authorize theo role khi cần

## Next Steps

1. Hoàn thiện Company service (bỏ CompanyMember logic)
2. Implement CV module với nested entities
3. Implement Job module với nested entities
4. Implement các supporting modules
5. Test tất cả APIs
6. Viết API documentation
