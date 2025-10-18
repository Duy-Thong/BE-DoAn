/**
 * Error Codes System
 * Centralized error code definitions for consistent API responses
 */

export enum ErrorCode {
  // Authentication Errors (AUTH_*)
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_ACCOUNT_LOCKED = 'AUTH_002',
  AUTH_ACCOUNT_INACTIVE = 'AUTH_003',
  AUTH_EMAIL_NOT_VERIFIED = 'AUTH_004',
  AUTH_TOKEN_INVALID = 'AUTH_005',
  AUTH_TOKEN_EXPIRED = 'AUTH_006',
  AUTH_TOKEN_MISSING = 'AUTH_007',
  AUTH_REFRESH_TOKEN_INVALID = 'AUTH_008',
  AUTH_REFRESH_TOKEN_EXPIRED = 'AUTH_009',
  AUTH_EMAIL_VERIFICATION_FAILED = 'AUTH_010',
  AUTH_PASSWORD_RESET_FAILED = 'AUTH_011',
  AUTH_PASSWORD_RESET_TOKEN_INVALID = 'AUTH_012',
  AUTH_PASSWORD_RESET_TOKEN_EXPIRED = 'AUTH_013',
  AUTH_SESSION_EXPIRED = 'AUTH_014',
  AUTH_TOO_MANY_ATTEMPTS = 'AUTH_015',

  // Authorization Errors (AUTHZ_*)
  AUTHZ_INSUFFICIENT_PERMISSIONS = 'AUTHZ_001',
  AUTHZ_ROLE_REQUIRED = 'AUTHZ_002',
  AUTHZ_COMPANY_ACCESS_DENIED = 'AUTHZ_003',
  AUTHZ_RESOURCE_ACCESS_DENIED = 'AUTHZ_004',
  AUTHZ_ADMIN_REQUIRED = 'AUTHZ_005',
  AUTHZ_RECRUITER_REQUIRED = 'AUTHZ_006',
  AUTHZ_CANDIDATE_REQUIRED = 'AUTHZ_007',

  // Validation Errors (VAL_*)
  VAL_INVALID_EMAIL = 'VAL_001',
  VAL_INVALID_PASSWORD = 'VAL_002',
  VAL_INVALID_PHONE = 'VAL_003',
  VAL_INVALID_DATE = 'VAL_004',
  VAL_INVALID_GENDER = 'VAL_005',
  VAL_INVALID_ROLE = 'VAL_006',
  VAL_INVALID_TOKEN = 'VAL_007',
  VAL_REQUIRED_FIELD = 'VAL_008',
  VAL_FIELD_TOO_SHORT = 'VAL_009',
  VAL_FIELD_TOO_LONG = 'VAL_010',
  VAL_INVALID_FORMAT = 'VAL_011',
  VAL_INVALID_ENUM = 'VAL_012',
  VAL_INVALID_UUID = 'VAL_013',
  VAL_INVALID_URL = 'VAL_014',
  VAL_INVALID_JSON = 'VAL_015',

  // Business Logic Errors (BIZ_*)
  BIZ_USER_ALREADY_EXISTS = 'BIZ_001',
  BIZ_USER_NOT_FOUND = 'BIZ_002',
  BIZ_COMPANY_NOT_FOUND = 'BIZ_003',
  BIZ_JOB_NOT_FOUND = 'BIZ_004',
  BIZ_CV_NOT_FOUND = 'BIZ_005',
  BIZ_APPLICATION_NOT_FOUND = 'BIZ_006',
  BIZ_EMAIL_ALREADY_VERIFIED = 'BIZ_007',
  BIZ_APPLICATION_ALREADY_EXISTS = 'BIZ_008',
  BIZ_JOB_ALREADY_SAVED = 'BIZ_009',
  BIZ_CV_ALREADY_MAIN = 'BIZ_010',
  BIZ_COMPANY_ALREADY_JOINED = 'BIZ_011',
  BIZ_INVALID_OPERATION = 'BIZ_012',
  BIZ_RESOURCE_LIMIT_EXCEEDED = 'BIZ_013',
  BIZ_DUPLICATE_ENTRY = 'BIZ_014',
  BIZ_CONSTRAINT_VIOLATION = 'BIZ_015',

  // Database Errors (DB_*)
  DB_CONNECTION_FAILED = 'DB_001',
  DB_QUERY_FAILED = 'DB_002',
  DB_TRANSACTION_FAILED = 'DB_003',
  DB_CONSTRAINT_VIOLATION = 'DB_004',
  DB_DUPLICATE_KEY = 'DB_005',
  DB_FOREIGN_KEY_VIOLATION = 'DB_006',
  DB_TIMEOUT = 'DB_007',
  DB_DEADLOCK = 'DB_008',
  DB_PERMISSION_DENIED = 'DB_009',
  DB_TABLE_NOT_FOUND = 'DB_010',

  // External Service Errors (EXT_*)
  EXT_EMAIL_SERVICE_FAILED = 'EXT_001',
  EXT_AI_SERVICE_FAILED = 'EXT_002',
  EXT_FILE_STORAGE_FAILED = 'EXT_003',
  EXT_PAYMENT_SERVICE_FAILED = 'EXT_004',
  EXT_SMS_SERVICE_FAILED = 'EXT_005',
  EXT_ANALYTICS_SERVICE_FAILED = 'EXT_006',
  EXT_THIRD_PARTY_API_FAILED = 'EXT_007',
  EXT_SERVICE_TIMEOUT = 'EXT_008',
  EXT_SERVICE_UNAVAILABLE = 'EXT_009',
  EXT_RATE_LIMIT_EXCEEDED = 'EXT_010',

  // File Upload Errors (FILE_*)
  FILE_TOO_LARGE = 'FILE_001',
  FILE_INVALID_TYPE = 'FILE_002',
  FILE_CORRUPTED = 'FILE_003',
  FILE_UPLOAD_FAILED = 'FILE_004',
  FILE_DELETE_FAILED = 'FILE_005',
  FILE_NOT_FOUND = 'FILE_006',
  FILE_PERMISSION_DENIED = 'FILE_007',
  FILE_QUOTA_EXCEEDED = 'FILE_008',
  FILE_VIRUS_DETECTED = 'FILE_009',
  FILE_INVALID_FORMAT = 'FILE_010',

  // Rate Limiting Errors (RATE_*)
  RATE_LIMIT_EXCEEDED = 'RATE_001',
  RATE_LIMIT_IP_BLOCKED = 'RATE_002',
  RATE_LIMIT_USER_BLOCKED = 'RATE_003',
  RATE_LIMIT_ENDPOINT_BLOCKED = 'RATE_004',
  RATE_LIMIT_GLOBAL_BLOCKED = 'RATE_005',

  // System Errors (SYS_*)
  SYS_INTERNAL_ERROR = 'SYS_001',
  SYS_SERVICE_UNAVAILABLE = 'SYS_002',
  SYS_MAINTENANCE_MODE = 'SYS_003',
  SYS_CONFIGURATION_ERROR = 'SYS_004',
  SYS_DEPENDENCY_FAILED = 'SYS_005',
  SYS_RESOURCE_EXHAUSTED = 'SYS_006',
  SYS_NETWORK_ERROR = 'SYS_007',
  SYS_TIMEOUT = 'SYS_008',
  SYS_MEMORY_ERROR = 'SYS_009',
  SYS_DISK_ERROR = 'SYS_010',

  // Security Errors (SEC_*)
  SEC_SUSPICIOUS_ACTIVITY = 'SEC_001',
  SEC_IP_BLOCKED = 'SEC_002',
  SEC_USER_BLOCKED = 'SEC_003',
  SEC_INVALID_SIGNATURE = 'SEC_004',
  SEC_CSRF_TOKEN_INVALID = 'SEC_005',
  SEC_XSS_ATTEMPT = 'SEC_006',
  SEC_SQL_INJECTION_ATTEMPT = 'SEC_007',
  SEC_BRUTE_FORCE_ATTEMPT = 'SEC_008',
  SEC_ACCOUNT_TAKEOVER_ATTEMPT = 'SEC_009',
  SEC_DATA_BREACH_ATTEMPT = 'SEC_010'
}

/**
 * Error Code Metadata
 */
export interface ErrorCodeMetadata {
  code: ErrorCode;
  message: string;
  statusCode: number;
  category: string;
  isRetryable: boolean;
  requiresLogging: boolean;
}

/**
 * Error Code Registry
 */
export const ERROR_CODE_REGISTRY: Record<ErrorCode, ErrorCodeMetadata> = {
  // Authentication Errors
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: {
    code: ErrorCode.AUTH_INVALID_CREDENTIALS,
    message: 'Invalid credentials',
    statusCode: 401,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTH_ACCOUNT_LOCKED]: {
    code: ErrorCode.AUTH_ACCOUNT_LOCKED,
    message: 'Account is locked',
    statusCode: 423,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTH_ACCOUNT_INACTIVE]: {
    code: ErrorCode.AUTH_ACCOUNT_INACTIVE,
    message: 'Account is inactive',
    statusCode: 401,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: {
    code: ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
    message: 'Email not verified',
    statusCode: 401,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.AUTH_TOKEN_INVALID]: {
    code: ErrorCode.AUTH_TOKEN_INVALID,
    message: 'Invalid token',
    statusCode: 401,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTH_TOKEN_EXPIRED]: {
    code: ErrorCode.AUTH_TOKEN_EXPIRED,
    message: 'Token expired',
    statusCode: 401,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.AUTH_TOKEN_MISSING]: {
    code: ErrorCode.AUTH_TOKEN_MISSING,
    message: 'Token missing',
    statusCode: 401,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.AUTH_REFRESH_TOKEN_INVALID]: {
    code: ErrorCode.AUTH_REFRESH_TOKEN_INVALID,
    message: 'Invalid refresh token',
    statusCode: 401,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTH_REFRESH_TOKEN_EXPIRED]: {
    code: ErrorCode.AUTH_REFRESH_TOKEN_EXPIRED,
    message: 'Refresh token expired',
    statusCode: 401,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.AUTH_EMAIL_VERIFICATION_FAILED]: {
    code: ErrorCode.AUTH_EMAIL_VERIFICATION_FAILED,
    message: 'Email verification failed',
    statusCode: 400,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTH_PASSWORD_RESET_FAILED]: {
    code: ErrorCode.AUTH_PASSWORD_RESET_FAILED,
    message: 'Password reset failed',
    statusCode: 400,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTH_PASSWORD_RESET_TOKEN_INVALID]: {
    code: ErrorCode.AUTH_PASSWORD_RESET_TOKEN_INVALID,
    message: 'Invalid password reset token',
    statusCode: 400,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTH_PASSWORD_RESET_TOKEN_EXPIRED]: {
    code: ErrorCode.AUTH_PASSWORD_RESET_TOKEN_EXPIRED,
    message: 'Password reset token expired',
    statusCode: 400,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.AUTH_SESSION_EXPIRED]: {
    code: ErrorCode.AUTH_SESSION_EXPIRED,
    message: 'Session expired',
    statusCode: 401,
    category: 'authentication',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.AUTH_TOO_MANY_ATTEMPTS]: {
    code: ErrorCode.AUTH_TOO_MANY_ATTEMPTS,
    message: 'Too many authentication attempts',
    statusCode: 429,
    category: 'authentication',
    isRetryable: true,
    requiresLogging: true
  },

  // Authorization Errors
  [ErrorCode.AUTHZ_INSUFFICIENT_PERMISSIONS]: {
    code: ErrorCode.AUTHZ_INSUFFICIENT_PERMISSIONS,
    message: 'Insufficient permissions',
    statusCode: 403,
    category: 'authorization',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTHZ_ROLE_REQUIRED]: {
    code: ErrorCode.AUTHZ_ROLE_REQUIRED,
    message: 'Required role not found',
    statusCode: 403,
    category: 'authorization',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTHZ_COMPANY_ACCESS_DENIED]: {
    code: ErrorCode.AUTHZ_COMPANY_ACCESS_DENIED,
    message: 'Company access denied',
    statusCode: 403,
    category: 'authorization',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTHZ_RESOURCE_ACCESS_DENIED]: {
    code: ErrorCode.AUTHZ_RESOURCE_ACCESS_DENIED,
    message: 'Resource access denied',
    statusCode: 403,
    category: 'authorization',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTHZ_ADMIN_REQUIRED]: {
    code: ErrorCode.AUTHZ_ADMIN_REQUIRED,
    message: 'Admin role required',
    statusCode: 403,
    category: 'authorization',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTHZ_RECRUITER_REQUIRED]: {
    code: ErrorCode.AUTHZ_RECRUITER_REQUIRED,
    message: 'Recruiter role required',
    statusCode: 403,
    category: 'authorization',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.AUTHZ_CANDIDATE_REQUIRED]: {
    code: ErrorCode.AUTHZ_CANDIDATE_REQUIRED,
    message: 'Candidate role required',
    statusCode: 403,
    category: 'authorization',
    isRetryable: false,
    requiresLogging: true
  },

  // Validation Errors
  [ErrorCode.VAL_INVALID_EMAIL]: {
    code: ErrorCode.VAL_INVALID_EMAIL,
    message: 'Invalid email format',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_INVALID_PASSWORD]: {
    code: ErrorCode.VAL_INVALID_PASSWORD,
    message: 'Invalid password format',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_INVALID_PHONE]: {
    code: ErrorCode.VAL_INVALID_PHONE,
    message: 'Invalid phone number format',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_INVALID_DATE]: {
    code: ErrorCode.VAL_INVALID_DATE,
    message: 'Invalid date format',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_INVALID_GENDER]: {
    code: ErrorCode.VAL_INVALID_GENDER,
    message: 'Invalid gender value',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_INVALID_ROLE]: {
    code: ErrorCode.VAL_INVALID_ROLE,
    message: 'Invalid role value',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_INVALID_TOKEN]: {
    code: ErrorCode.VAL_INVALID_TOKEN,
    message: 'Invalid token format',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_REQUIRED_FIELD]: {
    code: ErrorCode.VAL_REQUIRED_FIELD,
    message: 'Required field missing',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_FIELD_TOO_SHORT]: {
    code: ErrorCode.VAL_FIELD_TOO_SHORT,
    message: 'Field too short',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_FIELD_TOO_LONG]: {
    code: ErrorCode.VAL_FIELD_TOO_LONG,
    message: 'Field too long',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_INVALID_FORMAT]: {
    code: ErrorCode.VAL_INVALID_FORMAT,
    message: 'Invalid format',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_INVALID_ENUM]: {
    code: ErrorCode.VAL_INVALID_ENUM,
    message: 'Invalid enum value',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_INVALID_UUID]: {
    code: ErrorCode.VAL_INVALID_UUID,
    message: 'Invalid UUID format',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_INVALID_URL]: {
    code: ErrorCode.VAL_INVALID_URL,
    message: 'Invalid URL format',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.VAL_INVALID_JSON]: {
    code: ErrorCode.VAL_INVALID_JSON,
    message: 'Invalid JSON format',
    statusCode: 400,
    category: 'validation',
    isRetryable: false,
    requiresLogging: false
  },

  // Business Logic Errors
  [ErrorCode.BIZ_USER_ALREADY_EXISTS]: {
    code: ErrorCode.BIZ_USER_ALREADY_EXISTS,
    message: 'User already exists',
    statusCode: 409,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_USER_NOT_FOUND]: {
    code: ErrorCode.BIZ_USER_NOT_FOUND,
    message: 'User not found',
    statusCode: 404,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_COMPANY_NOT_FOUND]: {
    code: ErrorCode.BIZ_COMPANY_NOT_FOUND,
    message: 'Company not found',
    statusCode: 404,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_JOB_NOT_FOUND]: {
    code: ErrorCode.BIZ_JOB_NOT_FOUND,
    message: 'Job not found',
    statusCode: 404,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_CV_NOT_FOUND]: {
    code: ErrorCode.BIZ_CV_NOT_FOUND,
    message: 'CV not found',
    statusCode: 404,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_APPLICATION_NOT_FOUND]: {
    code: ErrorCode.BIZ_APPLICATION_NOT_FOUND,
    message: 'Application not found',
    statusCode: 404,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_EMAIL_ALREADY_VERIFIED]: {
    code: ErrorCode.BIZ_EMAIL_ALREADY_VERIFIED,
    message: 'Email already verified',
    statusCode: 409,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_APPLICATION_ALREADY_EXISTS]: {
    code: ErrorCode.BIZ_APPLICATION_ALREADY_EXISTS,
    message: 'Application already exists',
    statusCode: 409,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_JOB_ALREADY_SAVED]: {
    code: ErrorCode.BIZ_JOB_ALREADY_SAVED,
    message: 'Job already saved',
    statusCode: 409,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_CV_ALREADY_MAIN]: {
    code: ErrorCode.BIZ_CV_ALREADY_MAIN,
    message: 'CV already set as main',
    statusCode: 409,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_COMPANY_ALREADY_JOINED]: {
    code: ErrorCode.BIZ_COMPANY_ALREADY_JOINED,
    message: 'Already joined company',
    statusCode: 409,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_INVALID_OPERATION]: {
    code: ErrorCode.BIZ_INVALID_OPERATION,
    message: 'Invalid operation',
    statusCode: 400,
    category: 'business',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.BIZ_RESOURCE_LIMIT_EXCEEDED]: {
    code: ErrorCode.BIZ_RESOURCE_LIMIT_EXCEEDED,
    message: 'Resource limit exceeded',
    statusCode: 429,
    category: 'business',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.BIZ_DUPLICATE_ENTRY]: {
    code: ErrorCode.BIZ_DUPLICATE_ENTRY,
    message: 'Duplicate entry',
    statusCode: 409,
    category: 'business',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.BIZ_CONSTRAINT_VIOLATION]: {
    code: ErrorCode.BIZ_CONSTRAINT_VIOLATION,
    message: 'Constraint violation',
    statusCode: 400,
    category: 'business',
    isRetryable: false,
    requiresLogging: true
  },

  // Database Errors
  [ErrorCode.DB_CONNECTION_FAILED]: {
    code: ErrorCode.DB_CONNECTION_FAILED,
    message: 'Database connection failed',
    statusCode: 503,
    category: 'database',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.DB_QUERY_FAILED]: {
    code: ErrorCode.DB_QUERY_FAILED,
    message: 'Database query failed',
    statusCode: 500,
    category: 'database',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.DB_TRANSACTION_FAILED]: {
    code: ErrorCode.DB_TRANSACTION_FAILED,
    message: 'Database transaction failed',
    statusCode: 500,
    category: 'database',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.DB_CONSTRAINT_VIOLATION]: {
    code: ErrorCode.DB_CONSTRAINT_VIOLATION,
    message: 'Database constraint violation',
    statusCode: 400,
    category: 'database',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.DB_DUPLICATE_KEY]: {
    code: ErrorCode.DB_DUPLICATE_KEY,
    message: 'Duplicate key violation',
    statusCode: 409,
    category: 'database',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.DB_FOREIGN_KEY_VIOLATION]: {
    code: ErrorCode.DB_FOREIGN_KEY_VIOLATION,
    message: 'Foreign key violation',
    statusCode: 400,
    category: 'database',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.DB_TIMEOUT]: {
    code: ErrorCode.DB_TIMEOUT,
    message: 'Database timeout',
    statusCode: 504,
    category: 'database',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.DB_DEADLOCK]: {
    code: ErrorCode.DB_DEADLOCK,
    message: 'Database deadlock',
    statusCode: 500,
    category: 'database',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.DB_PERMISSION_DENIED]: {
    code: ErrorCode.DB_PERMISSION_DENIED,
    message: 'Database permission denied',
    statusCode: 403,
    category: 'database',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.DB_TABLE_NOT_FOUND]: {
    code: ErrorCode.DB_TABLE_NOT_FOUND,
    message: 'Database table not found',
    statusCode: 500,
    category: 'database',
    isRetryable: false,
    requiresLogging: true
  },

  // External Service Errors
  [ErrorCode.EXT_EMAIL_SERVICE_FAILED]: {
    code: ErrorCode.EXT_EMAIL_SERVICE_FAILED,
    message: 'Email service failed',
    statusCode: 502,
    category: 'external',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.EXT_AI_SERVICE_FAILED]: {
    code: ErrorCode.EXT_AI_SERVICE_FAILED,
    message: 'AI service failed',
    statusCode: 502,
    category: 'external',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.EXT_FILE_STORAGE_FAILED]: {
    code: ErrorCode.EXT_FILE_STORAGE_FAILED,
    message: 'File storage service failed',
    statusCode: 502,
    category: 'external',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.EXT_PAYMENT_SERVICE_FAILED]: {
    code: ErrorCode.EXT_PAYMENT_SERVICE_FAILED,
    message: 'Payment service failed',
    statusCode: 502,
    category: 'external',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.EXT_SMS_SERVICE_FAILED]: {
    code: ErrorCode.EXT_SMS_SERVICE_FAILED,
    message: 'SMS service failed',
    statusCode: 502,
    category: 'external',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.EXT_ANALYTICS_SERVICE_FAILED]: {
    code: ErrorCode.EXT_ANALYTICS_SERVICE_FAILED,
    message: 'Analytics service failed',
    statusCode: 502,
    category: 'external',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.EXT_THIRD_PARTY_API_FAILED]: {
    code: ErrorCode.EXT_THIRD_PARTY_API_FAILED,
    message: 'Third party API failed',
    statusCode: 502,
    category: 'external',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.EXT_SERVICE_TIMEOUT]: {
    code: ErrorCode.EXT_SERVICE_TIMEOUT,
    message: 'External service timeout',
    statusCode: 504,
    category: 'external',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.EXT_SERVICE_UNAVAILABLE]: {
    code: ErrorCode.EXT_SERVICE_UNAVAILABLE,
    message: 'External service unavailable',
    statusCode: 503,
    category: 'external',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.EXT_RATE_LIMIT_EXCEEDED]: {
    code: ErrorCode.EXT_RATE_LIMIT_EXCEEDED,
    message: 'External service rate limit exceeded',
    statusCode: 429,
    category: 'external',
    isRetryable: true,
    requiresLogging: true
  },

  // File Upload Errors
  [ErrorCode.FILE_TOO_LARGE]: {
    code: ErrorCode.FILE_TOO_LARGE,
    message: 'File too large',
    statusCode: 413,
    category: 'file',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.FILE_INVALID_TYPE]: {
    code: ErrorCode.FILE_INVALID_TYPE,
    message: 'Invalid file type',
    statusCode: 400,
    category: 'file',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.FILE_CORRUPTED]: {
    code: ErrorCode.FILE_CORRUPTED,
    message: 'File corrupted',
    statusCode: 400,
    category: 'file',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.FILE_UPLOAD_FAILED]: {
    code: ErrorCode.FILE_UPLOAD_FAILED,
    message: 'File upload failed',
    statusCode: 500,
    category: 'file',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.FILE_DELETE_FAILED]: {
    code: ErrorCode.FILE_DELETE_FAILED,
    message: 'File delete failed',
    statusCode: 500,
    category: 'file',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.FILE_NOT_FOUND]: {
    code: ErrorCode.FILE_NOT_FOUND,
    message: 'File not found',
    statusCode: 404,
    category: 'file',
    isRetryable: false,
    requiresLogging: false
  },
  [ErrorCode.FILE_PERMISSION_DENIED]: {
    code: ErrorCode.FILE_PERMISSION_DENIED,
    message: 'File permission denied',
    statusCode: 403,
    category: 'file',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.FILE_QUOTA_EXCEEDED]: {
    code: ErrorCode.FILE_QUOTA_EXCEEDED,
    message: 'File quota exceeded',
    statusCode: 413,
    category: 'file',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.FILE_VIRUS_DETECTED]: {
    code: ErrorCode.FILE_VIRUS_DETECTED,
    message: 'Virus detected in file',
    statusCode: 400,
    category: 'file',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.FILE_INVALID_FORMAT]: {
    code: ErrorCode.FILE_INVALID_FORMAT,
    message: 'Invalid file format',
    statusCode: 400,
    category: 'file',
    isRetryable: false,
    requiresLogging: false
  },

  // Rate Limiting Errors
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    message: 'Rate limit exceeded',
    statusCode: 429,
    category: 'rate_limit',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.RATE_LIMIT_IP_BLOCKED]: {
    code: ErrorCode.RATE_LIMIT_IP_BLOCKED,
    message: 'IP address blocked',
    statusCode: 429,
    category: 'rate_limit',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.RATE_LIMIT_USER_BLOCKED]: {
    code: ErrorCode.RATE_LIMIT_USER_BLOCKED,
    message: 'User blocked',
    statusCode: 429,
    category: 'rate_limit',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.RATE_LIMIT_ENDPOINT_BLOCKED]: {
    code: ErrorCode.RATE_LIMIT_ENDPOINT_BLOCKED,
    message: 'Endpoint blocked',
    statusCode: 429,
    category: 'rate_limit',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.RATE_LIMIT_GLOBAL_BLOCKED]: {
    code: ErrorCode.RATE_LIMIT_GLOBAL_BLOCKED,
    message: 'Global rate limit exceeded',
    statusCode: 429,
    category: 'rate_limit',
    isRetryable: true,
    requiresLogging: true
  },

  // System Errors
  [ErrorCode.SYS_INTERNAL_ERROR]: {
    code: ErrorCode.SYS_INTERNAL_ERROR,
    message: 'Internal server error',
    statusCode: 500,
    category: 'system',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.SYS_SERVICE_UNAVAILABLE]: {
    code: ErrorCode.SYS_SERVICE_UNAVAILABLE,
    message: 'Service unavailable',
    statusCode: 503,
    category: 'system',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.SYS_MAINTENANCE_MODE]: {
    code: ErrorCode.SYS_MAINTENANCE_MODE,
    message: 'System under maintenance',
    statusCode: 503,
    category: 'system',
    isRetryable: true,
    requiresLogging: false
  },
  [ErrorCode.SYS_CONFIGURATION_ERROR]: {
    code: ErrorCode.SYS_CONFIGURATION_ERROR,
    message: 'Configuration error',
    statusCode: 500,
    category: 'system',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.SYS_DEPENDENCY_FAILED]: {
    code: ErrorCode.SYS_DEPENDENCY_FAILED,
    message: 'Dependency failed',
    statusCode: 503,
    category: 'system',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.SYS_RESOURCE_EXHAUSTED]: {
    code: ErrorCode.SYS_RESOURCE_EXHAUSTED,
    message: 'System resource exhausted',
    statusCode: 503,
    category: 'system',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.SYS_NETWORK_ERROR]: {
    code: ErrorCode.SYS_NETWORK_ERROR,
    message: 'Network error',
    statusCode: 503,
    category: 'system',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.SYS_TIMEOUT]: {
    code: ErrorCode.SYS_TIMEOUT,
    message: 'System timeout',
    statusCode: 504,
    category: 'system',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.SYS_MEMORY_ERROR]: {
    code: ErrorCode.SYS_MEMORY_ERROR,
    message: 'Memory error',
    statusCode: 500,
    category: 'system',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.SYS_DISK_ERROR]: {
    code: ErrorCode.SYS_DISK_ERROR,
    message: 'Disk error',
    statusCode: 500,
    category: 'system',
    isRetryable: true,
    requiresLogging: true
  },

  // Security Errors
  [ErrorCode.SEC_SUSPICIOUS_ACTIVITY]: {
    code: ErrorCode.SEC_SUSPICIOUS_ACTIVITY,
    message: 'Suspicious activity detected',
    statusCode: 403,
    category: 'security',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.SEC_IP_BLOCKED]: {
    code: ErrorCode.SEC_IP_BLOCKED,
    message: 'IP address blocked',
    statusCode: 403,
    category: 'security',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.SEC_USER_BLOCKED]: {
    code: ErrorCode.SEC_USER_BLOCKED,
    message: 'User blocked',
    statusCode: 403,
    category: 'security',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.SEC_INVALID_SIGNATURE]: {
    code: ErrorCode.SEC_INVALID_SIGNATURE,
    message: 'Invalid signature',
    statusCode: 403,
    category: 'security',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.SEC_CSRF_TOKEN_INVALID]: {
    code: ErrorCode.SEC_CSRF_TOKEN_INVALID,
    message: 'Invalid CSRF token',
    statusCode: 403,
    category: 'security',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.SEC_XSS_ATTEMPT]: {
    code: ErrorCode.SEC_XSS_ATTEMPT,
    message: 'XSS attempt detected',
    statusCode: 403,
    category: 'security',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.SEC_SQL_INJECTION_ATTEMPT]: {
    code: ErrorCode.SEC_SQL_INJECTION_ATTEMPT,
    message: 'SQL injection attempt detected',
    statusCode: 403,
    category: 'security',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.SEC_BRUTE_FORCE_ATTEMPT]: {
    code: ErrorCode.SEC_BRUTE_FORCE_ATTEMPT,
    message: 'Brute force attempt detected',
    statusCode: 429,
    category: 'security',
    isRetryable: true,
    requiresLogging: true
  },
  [ErrorCode.SEC_ACCOUNT_TAKEOVER_ATTEMPT]: {
    code: ErrorCode.SEC_ACCOUNT_TAKEOVER_ATTEMPT,
    message: 'Account takeover attempt detected',
    statusCode: 403,
    category: 'security',
    isRetryable: false,
    requiresLogging: true
  },
  [ErrorCode.SEC_DATA_BREACH_ATTEMPT]: {
    code: ErrorCode.SEC_DATA_BREACH_ATTEMPT,
    message: 'Data breach attempt detected',
    statusCode: 403,
    category: 'security',
    isRetryable: false,
    requiresLogging: true
  }
};

/**
 * Error Code Utilities
 */
export class ErrorCodeUtils {
  /**
   * Get error metadata by code
   */
  static getErrorMetadata(code: ErrorCode): ErrorCodeMetadata {
    return ERROR_CODE_REGISTRY[code];
  }

  /**
   * Get error message by code
   */
  static getErrorMessage(code: ErrorCode): string {
    return ERROR_CODE_REGISTRY[code]?.message || 'Unknown error';
  }

  /**
   * Get status code by error code
   */
  static getStatusCode(code: ErrorCode): number {
    return ERROR_CODE_REGISTRY[code]?.statusCode || 500;
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(code: ErrorCode): boolean {
    return ERROR_CODE_REGISTRY[code]?.isRetryable || false;
  }

  /**
   * Check if error requires logging
   */
  static requiresLogging(code: ErrorCode): boolean {
    return ERROR_CODE_REGISTRY[code]?.requiresLogging || false;
  }

  /**
   * Get error category
   */
  static getCategory(code: ErrorCode): string {
    return ERROR_CODE_REGISTRY[code]?.category || 'unknown';
  }

  /**
   * Create error response object
   */
  static createErrorResponse(code: ErrorCode, details?: any): {
    success: false;
    error: string;
    code: ErrorCode;
    details?: any;
  } {
    return {
      success: false,
      error: this.getErrorMessage(code),
      code,
      details
    };
  }

  /**
   * Get all error codes by category
   */
  static getErrorCodesByCategory(category: string): ErrorCode[] {
    return Object.values(ErrorCode).filter(code => 
      ERROR_CODE_REGISTRY[code]?.category === category
    );
  }

  /**
   * Get all retryable error codes
   */
  static getRetryableErrorCodes(): ErrorCode[] {
    return Object.values(ErrorCode).filter(code => 
      ERROR_CODE_REGISTRY[code]?.isRetryable
    );
  }

  /**
   * Get all error codes that require logging
   */
  static getLoggableErrorCodes(): ErrorCode[] {
    return Object.values(ErrorCode).filter(code => 
      ERROR_CODE_REGISTRY[code]?.requiresLogging
    );
  }
}
