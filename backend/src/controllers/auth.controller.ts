import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, rollNumber } = req.body;

      if (!name || !email || !password || !rollNumber) {
        return res.status(400).json({ message: 'Name, email, password, and roll number are required.' });
      }

      const result = await AuthService.registerStudent({
        name,
        email,
        passwordHash: password,
        rollNumber,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const result = await AuthService.login(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    // Under token authentication, client simply discards the token.
    // We can also insert an audit log if the user was authenticated.
    return res.status(200).json({ message: 'Logged out successfully.' });
  }

  static async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          role: true,
          admin: true,
          student: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role.name,
          admin: user.admin,
          student: user.student,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required.' });
      }

      const decoded = AuthService.verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true, admin: true, student: true },
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid token user.' });
      }

      const token = AuthService.generateToken(user.id);
      const newRefreshToken = AuthService.generateRefreshToken(user.id);

      return res.status(200).json({
        token,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role.name,
          admin: user.admin,
          student: user.student,
        },
      });
    } catch (error: any) {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Return 200 for security, preventing account enumeration
        return res.status(200).json({ message: 'If the email exists, a password reset link has been dispatched.' });
      }

      // Generate a short reset token valid for 1 hour
      const resetToken = AuthService.generateToken(user.id);

      // In production, send email. For demo/dev: print to log and return mock details.
      console.log(`[FORGOT PASSWORD] Reset token for ${email}: ${resetToken}`);

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'FORGOT_PASSWORD_REQUEST',
          details: `Requested reset token for ${email}`,
        },
      });

      return res.status(200).json({
        message: 'If the email exists, a password reset link has been dispatched.',
        resetToken, // for ease of testing in front-end
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required.' });
      }

      const decoded = AuthService.verifyToken(token);
      const hashedPassword = bcrypt.hashSync(password, 10);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash: hashedPassword },
      });

      await prisma.auditLog.create({
        data: {
          userId: decoded.userId,
          action: 'RESET_PASSWORD',
          details: `Successfully reset password`,
        },
      });

      return res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error: any) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }
  }
}
