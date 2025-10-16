# Backend Architecture Redesign Plan

## 1. Module Restructuring (Grouped by Domain)

### 1.1 Core Modules to Reorganize

**User Module** (`src/modules/users/`)

- Remove `companyId` references (not in schema)
- Add all User fields: `phoneNumber`, `dateOfBirth`, `gender`, `nationality`, `avatarUrl`, `isLocked`, `isEmailVerified`, `lastLoginAt`
- Service layer for user management
- DTO validation with all schema fields

**Auth Module** (`src/modules/auth/`)

- Login, register, verify email, password reset
- JWT token management
- Session handling with `lastLoginAt` tracking

**Company Module** (`src/modules/companies/`)

- Company CRUD with all schema fields
- Nested `social-media/` submodule for company social links
- Service layer for company operations

**Company Members Module** (`src/modules/companies/members/`)

- Moved under companies as `src/modules/companies/members/`
- Member invitation system (`invitedBy` field)
- Role management (OWNER, MANAGER, RECRUITER, VIEWER)
- Permission checks for company operations

### 1.2 CV Domain (`src/modules/cvs/`)

Complete rebuild with nested submodules:

```
src/modules/cvs/
  ├── cv.service.ts           # Main CV operations
  ├── cv.controller.ts
  ├── cv.routes.ts
  ├── cv.dto.ts
  ├── work-experience/
  │   ├── service.ts
  │   ├── controller.ts
  │   ├── routes.ts
  │   └── dto.ts
  ├── education/
  ├── languages/
  ├── certifications/
  ├── projects/
  ├── achievements/
  ├── references/
  ├── activities/
  ├── skills/                 # CVSkill model
  └── social-media/
```

**Changes:**

- Remove `fileName`, `fileUrl`, `fileSize` (not in schema)
- Add all schema fields: `fullName`, `email`, `phoneNumber`, `dateOfBirth`, `gender`, `nationality`, `address`, `avatarUrl`, `currentPosition`, `summary`, `objective`, `embedding`
- Each nested entity managed through parent CV context
- Routes pattern: `/api/cvs/:cvId/work-experience`, `/api/cvs/:cvId/education`, etc.

### 1.3 Job Domain (`src/modules/jobs/`)

Restructure with nested submodules:

```
src/modules/jobs/
  ├── job.service.ts
  ├── job.controller.ts
  ├── job.routes.ts
  ├── job.dto.ts
  ├── requirements/          # JobRequirement model
  ├── benefits/              # JobBenefit model
  ├── skills/                # JobSkill model
  └── views/                 # JobView tracking
```

**Changes:**

- Remove string fields `requirements`, `benefits` (now separate models)
- Add `embedding` field for AI recommendations
- Add `remoteWork`, `urgent`, `featured` fields
- Nested operations for requirements, benefits, skills
- View tracking system
- Routes: `/api/jobs/:jobId/requirements`, `/api/jobs/:jobId/benefits`, etc.

### 1.4 Application Module (`src/modules/applications/`)

**Changes:**

- Remove references to CV file fields
- Update to use CV relationship properly
- Add `availableFrom` field
- Support `notes` field
- Proper status flow (PENDING → REVIEWING → INTERVIEW → OFFER/REJECTED)

### 1.5 Supporting Modules

**Notifications** (`src/modules/notifications/`)

- Full CRUD implementation
- Support all NotificationType enum values
- Mark as read/unread
- Bulk operations

**Saved Jobs** (`src/modules/saved-jobs/`)

- Ensure unique constraint (userId, jobId)
- List, add, remove operations

**Job Alerts** (`src/modules/job-alerts/`)

- Complete CRUD with all fields
- Alert matching service

**Search** (`src/modules/search/`)

- Unified search across jobs, companies
- Filter by type, location, etc.

**Uploads** (`src/modules/uploads/`)

- File upload for avatars, logos, documents
- Proper storage in `uploads/` directories

## 2. AI Microservice Integration

### 2.1 Existing AI Service Structure

- AI service already exists at separate endpoint (per `AI-SERVICE-INTEGRATION.md`)
- Current client: `src/services/ai-client.ts`
- Config: `src/config/ai.ts`

### 2.2 AI Module Reorganization (`src/modules/ai/`)

```
src/modules/ai/
  ├── ai.service.ts          # Orchestrator for AI operations
  ├── ai.controller.ts       # Expose AI endpoints
  ├── ai.routes.ts
  ├── ai.dto.ts
  ├── embedding/
  │   ├── service.ts         # CV & Job embedding generation
  │   ├── controller.ts
  │   └── dto.ts
  └── recommendations/
      ├── service.ts         # Job recommendations for users
      ├── controller.ts
      └── dto.ts
```

**Features:**

- **Embedding Service**: Generate embeddings for CVs and Jobs using AI microservice
- **Recommendation Service**: Get job recommendations based on CV embeddings
- API routes: `/api/ai/embeddings/cv`, `/api/ai/embeddings/job`, `/api/ai/recommendations`
- Integration points:
  - Auto-generate embeddings when CV/Job is created/updated
  - Background job queue for bulk embedding generation
  - Cache layer for recommendation results

## 3. Layered Architecture Implementation

### 3.1 Layer Structure

```
Controller Layer (routes.ts + controller.ts)
    ↓
Service Layer (service.ts)
    ↓
Repository/Prisma Layer (direct Prisma calls)
    ↓
Database
```

### 3.2 Cross-cutting Concerns

**Middleware** (`src/middlewares/`)

- `auth.ts`: Update to handle all permission checks
- `validation.ts`: Zod schema validation middleware
- `errorHandler.ts`: Standardized error responses
- `permissions.ts`: Role-based access control

**Utils** (`src/utils/`)

- `response.ts`: Standard API response format
- `pagination.ts`: Pagination helpers
- `filters.ts`: Query filter builders

## 4. Data Transfer Objects (DTOs)

### 4.1 Standardization

- All DTOs use Zod schemas
- Separate Create, Update, Response DTOs
- Nested DTOs for complex operations
- Validation messages in Vietnamese

### 4.2 Examples

**CV DTOs:**

```typescript
CreateCVDto: title, fullName, email, phoneNumber, dateOfBirth, gender, nationality, address, avatarUrl, currentPosition, summary, objective

UpdateCVDto: Partial of CreateCVDto + isMain

CVResponseDto: All fields + relations (workExperience[], education[], etc.)

CreateWorkExperienceDto: title, company, startDate, endDate, description
```

**Job DTOs:**

```typescript
CreateJobDto: title, description, location, type, salary, embedding, remoteWork, urgent, featured, expiresAt, companyId

CreateJobRequirementDto: title, description
CreateJobBenefitDto: title, description
CreateJobSkillDto: skillName, isRequired
```

## 5. Database Migration Strategy

### 5.1 Remove Incompatible Code

- Delete all references to removed fields
- Clean up old service methods
- Remove deprecated routes

### 5.2 Data Migration

- Create migration scripts for data transformation if needed
- Handle existing data gracefully

## 6. API Route Reorganization

### 6.1 New Route Structure

```
/api/auth/*                    # Authentication
/api/users/*                   # User management
/api/companies/*               # Company CRUD
/api/companies/:id/members/*   # Company members
/api/cvs/*                     # CV CRUD
/api/cvs/:id/work-experience/* # CV nested entities
/api/cvs/:id/education/*
/api/cvs/:id/languages/*
/api/cvs/:id/certifications/*
/api/cvs/:id/projects/*
/api/cvs/:id/achievements/*
/api/cvs/:id/references/*
/api/cvs/:id/activities/*
/api/cvs/:id/skills/*
/api/cvs/:id/social-media/*
/api/jobs/*                    # Job CRUD
/api/jobs/:id/requirements/*   # Job nested entities
/api/jobs/:id/benefits/*
/api/jobs/:id/skills/*
/api/applications/*            # Applications
/api/saved-jobs/*              # Saved jobs
/api/job-alerts/*              # Job alerts
/api/notifications/*           # Notifications
/api/search/*                  # Search
/api/uploads/*                 # File uploads
/api/ai/embeddings/*           # AI embeddings
/api/ai/recommendations/*      # AI recommendations
/api/admin/*                   # Admin operations
```

## 7. Implementation Checklist

### Phase 1: Core Module Cleanup

- [ ] Update User module (remove companyId, add missing fields)
- [ ] Update Auth module (email verification, session tracking)
- [ ] Update Company module (add social media support)
- [ ] Reorganize Company Members under companies/

### Phase 2: CV Domain Rebuild

- [ ] Create new CV service with all schema fields
- [ ] Build 9 nested submodules (work-experience, education, etc.)
- [ ] Implement CV DTOs with proper validation
- [ ] Create nested routes for all CV entities

### Phase 3: Job Domain Rebuild

- [ ] Update Job service (remove string requirements/benefits)
- [ ] Build 3 nested submodules (requirements, benefits, skills)
- [ ] Implement JobView tracking
- [ ] Add embedding field support

### Phase 4: Supporting Modules

- [ ] Complete Notifications module
- [ ] Update Applications module
- [ ] Verify Saved Jobs & Job Alerts
- [ ] Update Search module

### Phase 5: AI Integration

- [ ] Create AI module structure
- [ ] Implement embedding service (CV & Job)
- [ ] Implement recommendation service
- [ ] Add auto-embedding triggers on create/update
- [ ] Test AI microservice integration

### Phase 6: Testing & Documentation

- [ ] Update all API documentation
- [ ] Create integration tests
- [ ] Test all nested CRUD operations
- [ ] Verify permission checks
- [ ] Load test AI endpoints

## 8. Files to Create/Modify

### New Files (~60+ files)

- CV nested modules: 9 submodules × 4 files each = 36 files
- Job nested modules: 3 submodules × 4 files each = 12 files
- AI module: 8 files
- Company members relocation: 4 files
- Utils & middleware: 5 files

### Files to Modify (~25 files)

- All existing module services (users, companies, jobs, cvs, applications)
- All existing DTOs
- All existing routes
- Express loader (route registration)
- Auth middleware (permission updates)

### Files to Delete (~15 files)

- Old profiles module (merged into users/cvs)
- Old company-info module (merged into companies)
- Old application-management module (merged into applications)
- Deprecated route files