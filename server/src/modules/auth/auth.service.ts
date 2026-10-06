import { User, IUser, UserRole } from '../users/users.model.js';
import { generateDevToken } from '../../config/firebase.js';
import { AppError } from '../../middleware/errorHandler.js';
import { sendEmail } from '../notifications/email.service.js';

export class AuthService {
  static async onboardUser(
    authUid: string,
    email: string,
    data: {
      name: string;
      role: UserRole;
      college?: string;
      collegeEmail?: string;
      businessName?: string;
      bio?: string;
      skills?: Array<{ name: string; level: number }>;
    }
  ): Promise<{ user: IUser; token: string }> {
    let user = await User.findOne({ uid: authUid });

    if (user) {
      throw new AppError('User already onboarded with this account.', 400, 'ALREADY_EXISTS');
    }

    // Check if email is already taken by another account
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new AppError('Email is already registered.', 409, 'EMAIL_IN_USE');
    }

    user = new User({
      uid: authUid,
      email,
      name: data.name,
      role: data.role,
      college: data.college,
      collegeEmail: data.collegeEmail,
      collegeVerified: false,
      businessName: data.businessName,
      businessVerified: data.role === 'admin',
      bio: data.bio || '',
      skills: data.skills || [],
      trustScore: data.role === 'admin' ? 100 : 80,
    });

    await user.save();

    const token = generateDevToken({ uid: user.uid, email: user.email, role: user.role });
    return { user, token };
  }

  static async devLogin(email: string, role?: UserRole, name?: string): Promise<{ user: IUser; token: string }> {
    let user = await User.findOne({ email });

    if (!user) {
      const generatedUid = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      user = new User({
        uid: generatedUid,
        email,
        name: name || email.split('@')[0],
        role: role || 'student',
        collegeVerified: role === 'student' && email.includes('.edu'),
        businessVerified: role === 'local_business' || role === 'company',
        trustScore: 90,
      });
      await user.save();
    }

    const token = generateDevToken({ uid: user.uid, email: user.email, role: user.role });
    return { user, token };
  }

  static async sendCollegeVerification(userId: string, collegeEmail: string): Promise<{ message: string; code?: string }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404, 'NOT_FOUND');
    }

    if (user.role !== 'student') {
      throw new AppError('Only student accounts can verify college emails.', 400, 'INVALID_ROLE');
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.collegeEmail = collegeEmail;
    user.collegeVerificationToken = code;
    user.collegeVerificationExpires = expires;
    await user.save();

    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Verify your SkillBridge Student Status</h2>
        <p>Hello ${user.name},</p>
        <p>Your 6-digit verification code is:</p>
        <h1 style="color: #4B2FC4; letter-spacing: 4px;">${code}</h1>
        <p>This code will expire in 15 minutes.</p>
      </div>
    `;

    await sendEmail(collegeEmail, 'SkillBridge College Verification Code', htmlContent);

    return {
      message: `Verification code sent to ${collegeEmail}`,
      code: process.env.NODE_ENV !== 'production' ? code : undefined, // included in dev for seamless testing
    };
  }

  static async verifyCollegeEmail(userId: string, collegeEmail: string, code: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404, 'NOT_FOUND');
    }

    if (!user.collegeVerificationToken || !user.collegeVerificationExpires) {
      throw new AppError('No verification code requested or already used.', 400, 'NO_CODE');
    }

    if (new Date() > user.collegeVerificationExpires) {
      throw new AppError('Verification code has expired. Please request a new one.', 400, 'EXPIRED_CODE');
    }

    if (user.collegeVerificationToken !== code) {
      throw new AppError('Invalid verification code. Please check and try again.', 400, 'INVALID_CODE');
    }

    user.collegeVerified = true;
    user.collegeVerificationToken = undefined;
    user.collegeVerificationExpires = undefined;
    user.trustScore = Math.min(100, user.trustScore + 10); // Reward verification
    await user.save();

    return user;
  }

  static async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User profile not found.', 404, 'NOT_FOUND');
    }
    return user;
  }
}
