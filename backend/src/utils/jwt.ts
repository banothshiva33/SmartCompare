import jwt from 'jsonwebtoken';
import { getEnvConfig } from '../config/env';

interface TokenPayload {
  userId: string;
  email: string;
  affiliateId: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const envConfig = getEnvConfig();
  return jwt.sign(payload, envConfig.JWT_SECRET, {
    expiresIn: envConfig.JWT_EXPIRE,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  const envConfig = getEnvConfig();
  return jwt.verify(token, envConfig.JWT_SECRET) as TokenPayload;
};

export const generateRefreshToken = (userId: string): string => {
  const envConfig = getEnvConfig();
  return jwt.sign({ userId }, envConfig.JWT_SECRET, {
    expiresIn: '30d',
  });
};
