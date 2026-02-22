import { Router, Request, Response } from 'express';
import Joi from 'joi';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import pino from 'pino';

const router = Router();
const logger = pino();

// Validation schemas
const signupSchema = Joi.object({
  name: Joi.string().required().max(50),
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().required().min(6),
  phone: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().required(),
});

// Sign up
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, phone } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      affiliateId: user.affiliateId,
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        affiliateId: user.affiliateId,
      },
    });
  } catch (error: any) {
    logger.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      affiliateId: user.affiliateId,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        affiliateId: user.affiliateId,
        commissionRate: user.commissionRate,
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        affiliateId: user.affiliateId,
        commissionRate: user.commissionRate,
        bankAccount: user.bankAccount,
      },
    });
  } catch (error: any) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const updateSchema = Joi.object({
      name: Joi.string().max(50).optional(),
      phone: Joi.string().optional(),
      bankAccount: Joi.object({
        accountName: Joi.string().required(),
        accountNumber: Joi.string().required(),
        ifscCode: Joi.string().required(),
      }).optional(),
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await User.findByIdAndUpdate(req.userId, value, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bankAccount: user.bankAccount,
      },
    });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
