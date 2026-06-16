import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export class UserController {
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        include: {
          role: true,
          admin: true,
          student: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async createAdmin(req: AuthRequest, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered.' });
      }

      const examAdminRole = await prisma.role.findUnique({
        where: { name: 'EXAM_ADMIN' },
      });

      if (!examAdminRole) {
        return res.status(500).json({ message: 'Exam Admin role configuration is missing.' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          roleId: examAdminRole.id,
          admin: {
            create: { name },
          },
        },
        include: {
          role: true,
          admin: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'CREATE_ADMIN',
          details: `Created new Exam Admin user with email: ${email}`,
        },
      });

      return res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role.name,
          admin: user.admin,
        },
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (id === req.user?.id) {
        return res.status(400).json({ message: 'You cannot delete your own account.' });
      }

      const userToDelete = await prisma.user.findUnique({
        where: { id },
        include: { role: true },
      });

      if (!userToDelete) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Prevent deleting the seeded superadmin directly for system integrity
      if (userToDelete.email === 'superadmin@securepariksha.com') {
        return res.status(400).json({ message: 'System owner account cannot be deleted.' });
      }

      await prisma.user.delete({
        where: { id },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'DELETE_USER',
          details: `Deleted user: ${userToDelete.email} (Role: ${userToDelete.role.name})`,
        },
      });

      return res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
