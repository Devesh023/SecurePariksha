import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_12345';

export class AuthService {
  static async registerStudent(data: { name: string; email: string; passwordHash: string; rollNumber: string }) {
    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already registered.');
    }

    // Check if roll number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { rollNumber: data.rollNumber },
    });

    if (existingStudent) {
      throw new Error('Roll number already exists.');
    }

    // Retrieve Student Role
    const studentRole = await prisma.role.findUnique({
      where: { name: 'STUDENT' },
    });

    if (!studentRole) {
      throw new Error('Internal Configuration Error: Student role not found.');
    }

    const hashedPassword = bcrypt.hashSync(data.passwordHash, 10);

    // Create User, Student, and initial notification
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        roleId: studentRole.id,
        student: {
          create: {
            name: data.name,
            rollNumber: data.rollNumber,
          },
        },
        notifications: {
          create: {
            message: `Welcome to SecurePariksha, ${data.name}! Your student registration is successful.`,
          },
        },
      },
      include: {
        student: true,
        role: true,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        details: `Student registered with email: ${user.email} and roll number: ${data.rollNumber}`,
      },
    });

    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        student: user.student,
      },
      token,
      refreshToken,
    };
  }

  static async login(email: string, passwordHash: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        admin: true,
        student: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = bcrypt.compareSync(passwordHash, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        details: `User logged in with email: ${user.email}`,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        admin: user.admin,
        student: user.student,
      },
      token,
      refreshToken,
    };
  }

  static generateToken(userId: string) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' }); // Standard 1 day expiration
  }

  static generateRefreshToken(userId: string) {
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  }
}
