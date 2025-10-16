/**
 * Application constants
 */

export const APP_CONSTANTS = {
  // Application info
  APP_NAME: 'JobPortal',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Job Portal Application',

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,

  // File upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],

  // Authentication
  JWT_EXPIRES_IN: '7d',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,

  // Email verification
  EMAIL_VERIFICATION_EXPIRES_IN: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET_EXPIRES_IN: 60 * 60 * 1000, // 1 hour

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  CACHE_MAX_SIZE: 1000,

  // AI
  AI_EMBEDDING_DIMENSION: 768,
  AI_RECOMMENDATION_LIMIT: 10,
  AI_REQUEST_TIMEOUT: 30000, // 30 seconds

  // Job
  JOB_EXPIRY_DAYS: 30,
  JOB_FEATURED_DAYS: 7,
  JOB_URGENT_DAYS: 3,

  // CV
  CV_MAX_COUNT_PER_USER: 5,
  CV_SKILL_MAX_COUNT: 50,
  CV_EXPERIENCE_MAX_COUNT: 20,

  // Application
  APPLICATION_MAX_PER_JOB: 1000,
  APPLICATION_STATUS_UPDATE_COOLDOWN: 24 * 60 * 60 * 1000, // 24 hours

  // Company
  COMPANY_MAX_MEMBERS: 100,
  COMPANY_VERIFICATION_REQUIRED: true,

  // Notification
  NOTIFICATION_MAX_COUNT: 1000,
  NOTIFICATION_CLEANUP_DAYS: 30,

  // Search
  SEARCH_MIN_QUERY_LENGTH: 2,
  SEARCH_MAX_QUERY_LENGTH: 100,
  SEARCH_RESULTS_PER_PAGE: 20,

  // Upload
  UPLOAD_DIR: 'uploads',
  UPLOAD_TEMP_DIR: 'temp',
  UPLOAD_CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours

  // Database
  DB_CONNECTION_TIMEOUT: 30000, // 30 seconds
  DB_QUERY_TIMEOUT: 10000, // 10 seconds
  DB_POOL_SIZE: 10,

  // Logging
  LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  LOG_MAX_SIZE: '20m',
  LOG_MAX_FILES: '14d',

  // Security
  BCRYPT_ROUNDS: 12,
  SESSION_SECRET_LENGTH: 64,
  API_KEY_LENGTH: 32,

  // Validation
  VALIDATION_ERROR_MESSAGE: 'Dữ liệu không hợp lệ',
  REQUIRED_FIELD_MESSAGE: 'Trường này là bắt buộc',
  INVALID_FORMAT_MESSAGE: 'Định dạng không hợp lệ',

  // Response
  SUCCESS_MESSAGE: 'Thành công',
  ERROR_MESSAGE: 'Có lỗi xảy ra',
  NOT_FOUND_MESSAGE: 'Không tìm thấy',
  UNAUTHORIZED_MESSAGE: 'Không có quyền truy cập',
  FORBIDDEN_MESSAGE: 'Bị cấm truy cập',
  CONFLICT_MESSAGE: 'Xung đột dữ liệu',
  VALIDATION_ERROR_MESSAGE: 'Dữ liệu không hợp lệ',
  INTERNAL_ERROR_MESSAGE: 'Lỗi máy chủ nội bộ',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  RECRUITER: 'RECRUITER',
  CANDIDATE: 'CANDIDATE',
} as const;

export const COMPANY_MEMBER_ROLES = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  RECRUITER: 'RECRUITER',
  VIEWER: 'VIEWER',
} as const;

export const JOB_TYPES = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
} as const;

export const JOB_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  EXPIRED: 'EXPIRED',
} as const;

export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  INTERVIEW: 'INTERVIEW',
  OFFER: 'OFFER',
  REJECTED: 'REJECTED',
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  APPLICATION: 'APPLICATION',
  JOB: 'JOB',
  COMPANY: 'COMPANY',
  CV: 'CV',
  PROFILE: 'PROFILE',
  SYSTEM: 'SYSTEM',
} as const;

export const NOTIFICATION_RELATED_TYPES = {
  JOB: 'JOB',
  APPLICATION: 'APPLICATION',
  COMPANY: 'COMPANY',
  USER: 'USER',
  CV: 'CV',
  PROFILE: 'PROFILE',
} as const;

export const GENDER_OPTIONS = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
} as const;

export const LANGUAGE_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  NATIVE: 'NATIVE',
} as const;

export const SKILL_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
} as const;

export const COMPANY_SIZES = {
  STARTUP: 'STARTUP',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export const UPLOAD_CATEGORIES = {
  CV: 'CV',
  LOGO: 'LOGO',
  AVATAR: 'AVATAR',
  DOCUMENT: 'DOCUMENT',
} as const;

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const SORT_FIELDS = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  NAME: 'name',
  TITLE: 'title',
  EMAIL: 'email',
  SALARY: 'salary',
  LOCATION: 'location',
  COMPANY_NAME: 'companyName',
} as const;

export const FILTER_OPERATORS = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  GREATER_THAN: 'gt',
  GREATER_THAN_OR_EQUAL: 'gte',
  LESS_THAN: 'lt',
  LESS_THAN_OR_EQUAL: 'lte',
  IN: 'in',
  NOT_IN: 'not_in',
  BETWEEN: 'between',
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null',
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  EMAIL_SEND_ERROR: 'EMAIL_SEND_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
} as const;

export const SUCCESS_CODES = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
  UPLOADED: 'UPLOADED',
  EMAIL_SENT: 'EMAIL_SENT',
  VERIFIED: 'VERIFIED',
  RESET: 'RESET',
  LOGGED_IN: 'LOGGED_IN',
  LOGGED_OUT: 'LOGGED_OUT',
  REGISTERED: 'REGISTERED',
} as const;
