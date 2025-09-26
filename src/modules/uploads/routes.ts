import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../../middlewares/auth.js';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ok = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
  ].includes(file.mimetype);
  if (ok) cb(null, true);
  else cb(null, false);
};

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });

export const uploadsRouter = Router();

uploadsRouter.post('/cv', requireAuth, upload.single('file'), (req, res) => {
  res.status(201).json({ url: `/uploads/${req.file!.filename}` });
});

uploadsRouter.post('/logo', requireAuth, upload.single('file'), (req, res) => {
  res.status(201).json({ url: `/uploads/${req.file!.filename}` });
});

