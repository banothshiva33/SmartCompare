import jwt, { SignOptions } from 'jsonwebtoken';
import { getEnvConfig } from '../config/env';

interface TokenPayload {
  userId: string;
  email: string;
  affiliateId: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const envConfig = getEnvConfig();
  const options: SignOptions = {
    expiresIn: envConfig.JWT_EXPIRE as any,
  };
  return jwt.sign(payload, envConfig.JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
  const envConfig = getEnvConfig();
  return jwt.verify(token, envConfig.JWT_SECRET) as TokenPayload;
};

export const generateRefreshToken = (userId: string): string => {
  const envConfig = getEnvConfig();
  const options: SignOptions = {
    expiresIn: '30d',
  };
  return jwt.sign({ userId }, envConfig.JWT_SECRET, options);
};
