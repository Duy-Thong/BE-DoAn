// Extend NodeJS.ProcessEnv if needed later
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'test' | 'production';
    PORT?: string;
    LOG_LEVEL?: string;
    JWT_SECRET?: string;
    DATABASE_URL?: string;
  }
}

declare namespace Express {
  interface Request {
    user?: { id: string; role: import('../generated/prisma').UserRole };
  }
}

