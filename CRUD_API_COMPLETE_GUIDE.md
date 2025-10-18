# Hướng Dẫn Triển Khai Hoàn Chỉnh CRUD APIs

## Tổng Quan Dự Án

Dự án này xây dựng hệ thống tuyển dụng với các module chính:
- **User** ✅ - Đã hoàn thành
- **Company** ✅ - Đã hoàn thành
- **CV** - Cần triển khai
- **Job** - Cần triển khai
- **Application** - Cần triển khai
- Và 16 module phụ khác

## Cấu Trúc Đã Hoàn Thành

### 1. User Module ✅

**Location**: `src/modules/users/`

**API Endpoints**:
- `GET /api/users` - List users (with pagination, filtering, sorting)
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/lock` - Lock user
- `POST /api/users/:id/unlock` - Unlock user
- `POST /api/users/:id/verify-email` - Verify email

**Features**:
- Pagination (page, limit)
- Search (email, fullName, phoneNumber)
- Filter (role, isActive, isLocked, isEmailVerified, companyId)
- Sort (createdAt, updatedAt, fullName, email)

### 2. Company Module ✅

**Location**: `src/modules/companies/`

**API Endpoints**:
- `GET /api/companies` - List companies (with pagination, filtering)
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company details
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company
- `POST /api/companies/:id/verify` - Verify company (Admin only)
- `GET /api/companies/:id/jobs` - Get company's jobs
- `GET /api/companies/:id/users` - Get company's members
- `POST /api/companies/:id/users` - Assign user to company
- `DELETE /api/companies/:id/users/:userId` - Remove user from company

**Features**:
- Pagination và filtering giống User
- User assignment với companyRole (OWNER, MANAGER, RECRUITER, VIEWER)
- Nested resources (jobs, users)

## Template Code Cho Các Module Còn Lại

### CV Module (Priority: HIGH)

#### src/modules/cvs/dto.ts
```typescript
import { z } from 'zod';
import { Gender } from '../../generated/prisma/index.js';

export const CreateCVDto = z.object({
  title: z.string().min(1, 'Tiêu đề CV không được để trống'),
  fullName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  nationality: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  currentPosition: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  objective: z.string().optional().nullable(),
  isMain: z.boolean().default(false),
  userId: z.string(),
});
export type CreateCVDto = z.infer<typeof CreateCVDto>;

export const UpdateCVDto = z.object({
  title: z.string().min(1).optional(),
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  nationality: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  currentPosition: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  objective: z.string().optional().nullable(),
  isMain: z.boolean().optional(),
});
export type UpdateCVDto = z.infer<typeof UpdateCVDto>;

export const CVQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  userId: z.string().optional(),
  isMain: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type CVQueryDto = z.infer<typeof CVQueryDto>;
```

#### src/modules/cvs/service.ts
```typescript
import { Prisma } from '../../generated/prisma/index.js';
import { prisma } from '../../loaders/prisma.js';
import { AppError } from '../../utils/error.js';
import type { CreateCVDto, UpdateCVDto, CVQueryDto } from './dto.js';

export class CVsService {
  async list(query: CVQueryDto) {
    const { page, limit, search, userId, isMain, sortBy, sortOrder } = query;
    const where: Prisma.CVWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { currentPosition: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (userId !== undefined) where.userId = userId;
    if (isMain !== undefined) where.isMain = isMain;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.cV.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: {
              workExperience: true,
              education: true,
              skills: true,
              projects: true,
              applications: true,
            },
          },
        },
      }),
      prisma.cV.count({ where }),
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

  async create(input: CreateCVDto) {
    // If isMain = true, set all other CVs of this user to isMain = false
    if (input.isMain) {
      await prisma.cV.updateMany({
        where: { userId: input.userId, isMain: true },
        data: { isMain: false },
      });
    }

    return prisma.cV.create({
      data: {
        ...input,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        embedding: [], // Initialize empty embedding
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async getById(id: string) {
    const cv = await prisma.cV.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        workExperience: { orderBy: { startDate: 'desc' } },
        education: { orderBy: { startDate: 'desc' } },
        languages: true,
        certifications: { orderBy: { acquiredAt: 'desc' } },
        projects: { orderBy: { startDate: 'desc' } },
        achievements: { orderBy: { acquiredAt: 'desc' } },
        references: true,
        skills: { orderBy: { level: 'desc' } },
        activities: { orderBy: { startDate: 'desc' } },
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    logoUrl: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cv) {
      throw new AppError('CV không tồn tại', 404);
    }

    return cv;
  }

  async update(id: string, input: UpdateCVDto) {
    const existingCV = await prisma.cV.findUnique({ where: { id } });
    if (!existingCV) {
      throw new AppError('CV không tồn tại', 404);
    }

    // If setting as main, unset other CVs
    if (input.isMain === true) {
      await prisma.cV.updateMany({
        where: { userId: existingCV.userId, isMain: true, NOT: { id } },
        data: { isMain: false },
      });
    }

    const data: Prisma.CVUpdateInput = { ...input };
    if (input.dateOfBirth !== undefined) {
      data.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
    }

    return prisma.cV.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const cv = await prisma.cV.findUnique({ where: { id } });
    if (!cv) {
      throw new AppError('CV không tồn tại', 404);
    }

    await prisma.cV.delete({ where: { id } });
    return { message: 'Xóa CV thành công' };
  }

  // Set CV as main
  async setAsMain(id: string) {
    const cv = await prisma.cV.findUnique({ where: { id } });
    if (!cv) {
      throw new AppError('CV không tồn tại', 404);
    }

    // Unset all other CVs of this user
    await prisma.cV.updateMany({
      where: { userId: cv.userId, isMain: true },
      data: { isMain: false },
    });

    // Set this CV as main
    return prisma.cV.update({
      where: { id },
      data: { isMain: true },
    });
  }
}
```

#### src/modules/cvs/controller.ts
```typescript
import type { Request, Response } from 'express';
import { CVsService } from './service.js';
import { CreateCVDto, UpdateCVDto, CVQueryDto } from './dto.js';

const service = new CVsService();

export const listCVs = async (req: Request, res: Response) => {
  try {
    const query = CVQueryDto.parse(req.query);
    const result = await service.list(query);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};

export const createCV = async (req: Request, res: Response) => {
  try {
    const input = CreateCVDto.parse(req.body);
    const data = await service.create(input);
    res.status(201).json({ success: true, data, message: 'Tạo CV thành công' });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};

export const getCV = async (req: Request, res: Response) => {
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

export const updateCV = async (req: Request, res: Response) => {
  try {
    const input = UpdateCVDto.parse(req.body);
    const data = await service.update(req.params.id, input);
    res.json({ success: true, data, message: 'Cập nhật CV thành công' });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};

export const deleteCV = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, message: 'Xóa CV thành công' });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};

export const setMainCV = async (req: Request, res: Response) => {
  try {
    const data = await service.setAsMain(req.params.id);
    res.json({ success: true, data, message: 'Đặt làm CV chính thành công' });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};
```

#### src/modules/cvs/routes.ts
```typescript
import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/auth.js';
import { listCVs, createCV, getCV, updateCV, deleteCV, setMainCV } from './controller.js';

export const cvsRouter = Router();

// Protected routes
cvsRouter.use(AuthMiddleware.authenticate);

// CRUD routes
cvsRouter.get('/', listCVs);
cvsRouter.post('/', createCV);
cvsRouter.get('/:id', getCV);
cvsRouter.put('/:id', updateCV);
cvsRouter.delete('/:id', deleteCV);

// Additional routes
cvsRouter.post('/:id/set-main', setMainCV);

// Nested routes for CV details (implement later)
// import { workExperienceRouter } from './work-experience/routes.js';
// cvsRouter.use('/:cvId/work-experience', workExperienceRouter);
```

---

## Job Module Template

### src/modules/jobs/dto.ts
```typescript
import { z } from 'zod';
import { JobType, ExperienceLevel } from '../../generated/prisma/index.js';

export const CreateJobDto = z.object({
  title: z.string().min(1, 'Tiêu đề công việc không được để trống'),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional().nullable(),
  type: z.nativeEnum(JobType).default(JobType.FULL_TIME),
  salary: z.coerce.number().optional().nullable(),
  urgent: z.boolean().default(false),
  expiresAt: z.string().datetime().optional().nullable(),
  companyId: z.string(),
});
export type CreateJobDto = z.infer<typeof CreateJobDto>;

export const UpdateJobDto = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional().nullable(),
  type: z.nativeEnum(JobType).optional(),
  salary: z.coerce.number().optional().nullable(),
  urgent: z.boolean().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});
export type UpdateJobDto = z.infer<typeof UpdateJobDto>;

export const JobQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  companyId: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  type: z.nativeEnum(JobType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  urgent: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'salary']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type JobQueryDto = z.infer<typeof JobQueryDto>;
```

Tương tự, bạn cần implement service, controller, và routes theo template như CV module.

---

## Application Module Template

```typescript
// src/modules/applications/dto.ts
import { z } from 'zod';
import { AppStatus } from '../../generated/prisma/index.js';

export const CreateApplicationDto = z.object({
  cvId: z.string(),
  jobId: z.string(),
  coverLetter: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdateApplicationDto = z.object({
  status: z.nativeEnum(AppStatus).optional(),
  coverLetter: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const ApplicationQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cvId: z.string().optional(),
  jobId: z.string().optional(),
  status: z.nativeEnum(AppStatus).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
```

---

## Nested Entities Template (Work Experience, Education, etc.)

Các entity nested (thuộc về CV hoặc Job) sẽ có cấu trúc tương tự nhưng đơn giản hơn.

### Example: WorkExperience

```typescript
// src/modules/cvs/work-experience/dto.ts
export const CreateWorkExperienceDto = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  description: z.string().optional().nullable(),
  cvId: z.string(),
});

export const UpdateWorkExperienceDto = CreateWorkExperienceDto.partial().omit({ cvId: true });
```

Service tương tự nhưng không cần pagination phức tạp (vì thường list all cho một CV).

---

## Checklist Triển Khai

### Modules Chính (Priority: HIGH)
- [ ] CV Module - **BẮT ĐẦU TỪ ĐÂY**
- [ ] Job Module
- [ ] Application Module

### Nested CV Modules (Priority: MEDIUM)
- [ ] WorkExperience
- [ ] Education
- [ ] Language
- [ ] Certification
- [ ] Project
- [ ] Achievement
- [ ] Reference
- [ ] Activity
- [ ] CVSkill

### Nested Job Modules (Priority: MEDIUM)
- [ ] JobRequirement
- [ ] JobBenefit
- [ ] JobSkill

### Supporting Modules (Priority: LOW)
- [ ] SocialMedia (polymorphic)
- [ ] SavedJob
- [ ] Notification
- [ ] Upload

---

## Quy Trình Triển Khai Từng Module

1. **Tạo dto.ts**:
   - Create, Update, Query DTOs
   - Import các enum từ Prisma
   - Validation với Zod

2. **Tạo service.ts**:
   - Implement CRUD methods
   - Pagination logic
   - Error handling với AppError

3. **Tạo controller.ts**:
   - Parse request data với DTOs
   - Call service methods
   - Return consistent response format

4. **Tạo routes.ts**:
   - Define REST endpoints
   - Apply authentication middleware
   - Apply authorization middleware (theo role)

5. **Test**:
   - Test với Postman/Thunder Client
   - Verify pagination
   - Verify filtering
   - Verify authentication/authorization

---

## Response Format Chuẩn

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Success với Pagination
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Authentication & Authorization

### Middleware đã có:
- `AuthMiddleware.authenticate` - Yêu cầu đăng nhập
- `AuthMiddleware.requireAdmin` - Chỉ ADMIN
- `AuthMiddleware.requireRecruiterOrAdmin` - RECRUITER hoặc ADMIN

### Sử dụng trong routes:
```typescript
router.get('/', listItems); // Public
router.get('/:id', AuthMiddleware.authenticate, getItem); // Authenticated
router.post('/', AuthMiddleware.requireAdmin, createItem); // Admin only
```

---

## Notes Quan Trọng

1. **Embedding Field**: CV và Job có field `embedding: Float[]` - khởi tạo là empty array `[]`

2. **Unique Constraints**:
   - Application: `@@unique([cvId, jobId])` - Check trước khi create
   - CVSkill: `@@unique([cvId, skillName])`
   - JobSkill: `@@unique([jobId, skillName])`

3. **Polymorphic SocialMedia**:
   - Validate `ownerType` in ('User', 'Company', 'CV')
   - Match `ownerId` với entity tương ứng

4. **CV isMain Logic**:
   - Khi set CV là main, unset tất cả CV khác của user
   - User chỉ có 1 CV main

5. **Soft Delete**: Hiện tại chưa implement, có thể thêm sau

---

## Bước Tiếp Theo

1. Copy template CV module vào code
2. Test CV CRUD APIs
3. Implement Job module
4. Implement Application module
5. Implement nested modules (WorkExperience, etc.)
6. Viết tests
7. Viết API documentation

Chúc bạn thành công! 🚀
