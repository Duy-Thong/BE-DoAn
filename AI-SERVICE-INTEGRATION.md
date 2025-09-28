# AI Service Integration Guide

## Overview
This document describes how to integrate the AI service for CV embedding, job recommendations, and analysis features.

## AI Service Repository Structure
Create a separate repository for the AI service with the following structure:

```
ai-service/
├── src/
│   ├── embeddings/
│   │   ├── generator.py
│   │   ├── search.py
│   │   └── models.py
│   ├── recommendations/
│   │   ├── job_recommender.py
│   │   ├── candidate_recommender.py
│   │   └── skill_matcher.py
│   ├── analysis/
│   │   ├── cv_analyzer.py
│   │   ├── job_analyzer.py
│   │   └── match_analyzer.py
│   ├── api/
│   │   ├── routes.py
│   │   ├── middleware.py
│   │   └── schemas.py
│   └── main.py
├── requirements.txt
├── Dockerfile
└── README.md
```

## Required AI Service Endpoints

### 1. Health Check
```
GET /health
Response: { "status": "ok", "version": "1.0.0" }
```

### 2. Embeddings
```
POST /api/embeddings/generate
Body: { "content": "string", "type": "CV|JOB_DESCRIPTION|PROFILE|COMPANY", "metadata": {} }
Response: { "id": "string", "content": "string", "type": "string", "embedding": [float], "metadata": {}, "createdAt": "string" }

POST /api/embeddings/batch
Body: { "items": [{ "content": "string", "type": "string", "metadata": {} }] }
Response: [{ "id": "string", "content": "string", "type": "string", "embedding": [float], "metadata": {}, "createdAt": "string" }]

GET /api/embeddings/search?q=string&type=string&limit=10
Response: [{ "id": "string", "content": "string", "type": "string", "embedding": [float], "metadata": {}, "createdAt": "string", "similarity": float }]
```

### 3. Recommendations
```
POST /api/recommendations/jobs
Body: { "userId": "string", "type": "JOB_RECOMMENDATION", "filters": {} }
Response: [{ "id": "string", "score": float, "reasons": [string], "data": {} }]

POST /api/recommendations/candidates
Body: { "jobId": "string", "type": "CANDIDATE_RECOMMENDATION", "filters": {} }
Response: [{ "id": "string", "score": float, "reasons": [string], "data": {} }]

POST /api/recommendations/skills
Body: { "userId": "string", "type": "SKILL_MATCH", "filters": {} }
Response: [{ "id": "string", "score": float, "reasons": [string], "data": {} }]
```

### 4. Analysis
```
POST /api/analyze/cv
Body: { "content": "string", "type": "CV", "metadata": {} }
Response: { "skills": [string], "experience": "string", "education": "string", "languages": [string], "certifications": [string], "summary": "string", "confidence": float }

POST /api/analyze/job
Body: { "content": "string", "type": "JOB_DESCRIPTION", "metadata": {} }
Response: { "requiredSkills": [string], "preferredSkills": [string], "experienceLevel": "string", "education": "string", "softSkills": [string], "summary": "string", "confidence": float }

POST /api/analyze/match
Body: { "cvContent": "string", "jobContent": "string" }
Response: { "matchScore": float, "strengths": [string], "weaknesses": [string], "recommendations": [string] }
```

## Environment Variables

### Backend (.env)
```env
AI_SERVICE_URL=http://localhost:5000
AI_SERVICE_TIMEOUT=30000
AI_SERVICE_RETRY_ATTEMPTS=3
AI_EMBEDDING_MODEL=text-embedding-ada-002
AI_RECOMMENDATION_MODEL=gpt-3.5-turbo
AI_ANALYSIS_MODEL=gpt-4
AI_BATCH_SIZE=10
AI_CACHE_TTL=3600
```

### AI Service (.env)
```env
OPENAI_API_KEY=your_openai_api_key
EMBEDDING_MODEL=text-embedding-ada-002
RECOMMENDATION_MODEL=gpt-3.5-turbo
ANALYSIS_MODEL=gpt-4
VECTOR_DB_URL=your_vector_db_url
REDIS_URL=your_redis_url
PORT=5000
```

## Database Schema Updates

Add these tables to your Prisma schema:

```prisma
model Embedding {
  id        String   @id @default(cuid())
  content   String
  type      String
  embedding String   // JSON string of embedding vector
  metadata  Json     @default("{}")
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, type])
}

model Notification {
  id        String   @id @default(cuid())
  title     String
  message   String
  type      String   @default("INFO")
  isRead    Boolean  @default(false)
  readAt    DateTime?
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  relatedId String?
  relatedType String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, isRead])
}

model CompanyReview {
  id              String   @id @default(cuid())
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id])
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  rating          Int
  title           String
  comment         String
  pros            String?
  cons            String?
  workLifeBalance Int?
  salaryBenefits  Int?
  careerGrowth    Int?
  management      Int?
  culture         Int?
  isAnonymous     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([companyId, userId])
  @@index([companyId, rating])
}

model ReviewLike {
  id       String        @id @default(cuid())
  reviewId String
  review   CompanyReview @relation(fields: [reviewId], references: [id])
  userId   String
  user     User          @relation(fields: [userId], references: [id])
  createdAt DateTime     @default(now())

  @@unique([reviewId, userId])
}

model ReviewReport {
  id          String        @id @default(cuid())
  reviewId    String
  review      CompanyReview @relation(fields: [reviewId], references: [id])
  reporterId  String
  reporter    User          @relation(fields: [reporterId], references: [id])
  reason      String
  description String?
  createdAt   DateTime      @default(now())

  @@index([reviewId])
}

model Upload {
  id          String   @id @default(cuid())
  fileName    String
  originalName String
  mimeType    String
  size        Int
  path        String
  url         String
  title       String?
  description String?
  category    String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, category])
}
```

## Implementation Steps

1. **Create AI Service Repository**
   - Set up Python FastAPI/Flask service
   - Implement embedding generation using OpenAI API
   - Implement recommendation algorithms
   - Implement CV/Job analysis using LLM

2. **Update Backend Database**
   - Add new tables to Prisma schema
   - Run migrations
   - Update seed data

3. **Deploy AI Service**
   - Deploy to cloud service (AWS, GCP, Azure)
   - Set up vector database (Pinecone, Weaviate, or Chroma)
   - Configure Redis for caching

4. **Test Integration**
   - Use the provided Postman collection
   - Test all AI endpoints
   - Verify data flow between services

## API Collection Usage

1. Import `BE-DoAn-Complete-API-Collection-FINAL.json` into Postman
2. Set environment variables:
   - `base_url`: Your backend URL
   - `auth_token`: Login and get token
   - Other IDs as needed
3. Test all endpoints systematically

## Monitoring and Logging

- Set up monitoring for AI service health
- Log all AI service calls
- Monitor embedding generation performance
- Track recommendation accuracy

## Security Considerations

- Secure AI service endpoints
- Rate limiting for AI calls
- Input validation and sanitization
- API key management
- Data privacy compliance
