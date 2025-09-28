import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../../middlewares/auth.js';
import { prisma } from '../../loaders/prisma.js';
import { z } from 'zod';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Create subdirectories
const cvDir = path.join(uploadDir, 'cvs');
const logoDir = path.join(uploadDir, 'logos');
const avatarDir = path.join(uploadDir, 'avatars');
const documentDir = path.join(uploadDir, 'documents');

[cvDir, logoDir, avatarDir, documentDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.params.type || 'document';
    let targetDir = documentDir;
    
    switch (uploadType) {
      case 'cv':
        targetDir = cvDir;
        break;
      case 'logo':
        targetDir = logoDir;
        break;
      case 'avatar':
        targetDir = avatarDir;
        break;
      default:
        targetDir = documentDir;
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${unique}-${name}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const uploadType = req.params.type || 'document';
  let allowedTypes: string[] = [];
  
  switch (uploadType) {
    case 'cv':
      allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      break;
    case 'logo':
    case 'avatar':
      allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      break;
    default:
      allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp'
      ];
  }
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed for ${uploadType} upload`));
  }
};

const upload = multer({ 
  storage, 
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Max 5 files
  }, 
  fileFilter 
});

const UploadSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(['CV', 'LOGO', 'AVATAR', 'DOCUMENT']).optional()
});

export const uploadsRouter = Router();

// Upload single file
uploadsRouter.post('/:type', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { title, description, category } = UploadSchema.parse(req.body);
    const uploadType = req.params.type;
    const userId = req.user!.id;

    // Save file info to database
    const fileRecord = await prisma.upload.create({
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/${uploadType}/${req.file.filename}`,
        userId,
        title: title || req.file.originalname,
        description,
        category: category || uploadType.toUpperCase() as any
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: fileRecord.id,
        fileName: fileRecord.fileName,
        originalName: fileRecord.originalName,
        url: fileRecord.url,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        title: fileRecord.title,
        description: fileRecord.description,
        category: fileRecord.category,
        createdAt: fileRecord.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
});

// Upload multiple files
uploadsRouter.post('/:type/multiple', requireAuth, upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const { title, description, category } = UploadSchema.parse(req.body);
    const uploadType = req.params.type;
    const userId = req.user!.id;

    const fileRecords = await Promise.all(
      files.map(file => 
        prisma.upload.create({
          data: {
            fileName: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            url: `/uploads/${uploadType}/${file.filename}`,
            userId,
            title: title || file.originalname,
            description,
            category: category || uploadType.toUpperCase() as any
          }
        })
      )
    );

    res.status(201).json({
      success: true,
      data: fileRecords.map(record => ({
        id: record.id,
        fileName: record.fileName,
        originalName: record.originalName,
        url: record.url,
        size: record.size,
        mimeType: record.mimeType,
        title: record.title,
        description: record.description,
        category: record.category,
        createdAt: record.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
});

// Get user uploads
uploadsRouter.get('/my-files', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;

    const where = {
      userId: req.user!.id,
      ...(category && { category: category as any })
    };

    const [files, total] = await Promise.all([
      prisma.upload.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.upload.count({ where })
    ]);

    res.json({
      success: true,
      data: files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch files'
    });
  }
});

// Get file by ID
uploadsRouter.get('/:id', requireAuth, async (req, res) => {
  try {
    const file = await prisma.upload.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch file'
    });
  }
});

// Update file info
uploadsRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;

    const file = await prisma.upload.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      data: {
        title,
        description
      }
    });

    if (file.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      message: 'File updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update file'
    });
  }
});

// Delete file
uploadsRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const file = await prisma.upload.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Delete physical file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete database record
    await prisma.upload.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
});

// Download file
uploadsRouter.get('/:id/download', requireAuth, async (req, res) => {
  try {
    const file = await prisma.upload.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on disk'
      });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
});

