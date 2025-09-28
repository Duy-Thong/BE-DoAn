import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../loaders/prisma.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/http.js';

export const authRouter = Router();

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
  role: z.enum(['CANDIDATE', 'RECRUITER', 'ADMIN']).default('CANDIDATE')
});

// Login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, 'Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, 'Invalid credentials');
    
    const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '30d' });
    
    res.json({ 
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// Register
authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, phoneNumber, role } = RegisterSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpError(409, 'User already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phoneNumber,
        role
      }
    });
    
    // Generate tokens
    const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '30d' });
    
    res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// Refresh Token
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new HttpError(401, 'Refresh token required');
    }
    
    const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    
    if (!user) {
      throw new HttpError(401, 'Invalid refresh token');
    }
    
    const newToken = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
    const newRefreshToken = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (err) {
    next(err);
  }
});

// Logout (client-side token removal)
authRouter.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

