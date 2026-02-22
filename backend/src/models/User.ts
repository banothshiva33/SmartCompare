import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  affiliateId: string;
  commissionRate: number;
  bankAccount?: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
  };
  paymentHistory: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
    },
    affiliateId: {
      type: String,
      unique: true,
      sparse: true,
    },
    commissionRate: {
      type: Number,
      default: 5, // 5% commission
    },
    bankAccount: {
      accountName: String,
      accountNumber: String,
      ifscCode: String,
    },
    paymentHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Generate unique affiliate ID
userSchema.pre<IUser>('save', function (next) {
  if (!this.affiliateId) {
    this.affiliateId = `aff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcryptjs.compare(password, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
