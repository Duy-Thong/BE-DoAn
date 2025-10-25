import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configure multer for template file uploads
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept HTML files for 'html' field
  if (file.fieldname === 'html') {
    if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
      cb(null, true);
    } else {
      cb(new Error('File HTML phải có định dạng .html'));
    }
  }
  // Accept images for 'preview' field
  else if (file.fieldname === 'preview') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('File preview phải là ảnh (JPG, PNG, WebP)'));
    }
  }
  else {
    cb(new Error('Field không hợp lệ'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
});

// Middleware for template creation with HTML and preview image
export const uploadTemplateFiles = upload.fields([
  { name: 'html', maxCount: 1 },
  { name: 'preview', maxCount: 1 }
]);

// Error handler for multer
export const handleTemplateUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File quá lớn. Kích thước tối đa: 5MB',
      });
    }
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  next();
};

