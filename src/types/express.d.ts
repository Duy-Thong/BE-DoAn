import { CompanyMember, Job, CV, Application, Company, Notification, Upload } from '../generated/prisma/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
      companyMember?: CompanyMember;
      job?: Job;
      cv?: CV;
      application?: Application;
      company?: Company;
      notification?: Notification;
      upload?: Upload;
    }
  }
}

export {};
