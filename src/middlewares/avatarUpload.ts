import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configure multer for avatar upload
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Only allow image files
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Loại file không được hỗ trợ. Chỉ chấp nhận PNG, JPEG, JPG, WEBP'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Only 1 file
  },
  fileFilter
});

// Middleware for single avatar upload
export const uploadAvatar = upload.single('avatar');

// Error handler for multer
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File quá lớn. Kích thước tối đa là 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Chỉ được tải lên 1 file'
      });
    }
  }
  
  if (error.message.includes('Loại file không được hỗ trợ')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
};
