import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pino from 'pino';
import { getEnvConfig } from '../config/env';

const logger = pino();

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'No authorization token provided',
      });
    }

    const envConfig = getEnvConfig();
    const decoded = jwt.verify(token, envConfig.JWT_SECRET) as any;

    req.userId = decoded.userId;
    req.user = decoded;

    next();
  } catch (error: any) {
    logger.warn(`JWT verification failed: ${error.message}`);
    res.status(401).json({
      error: 'Invalid or expired token',
    });
  }
};
