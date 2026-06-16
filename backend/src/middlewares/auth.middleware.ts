import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_12345';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  adminId?: string;
  studentId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Authorization header missing or malformed.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
        admin: true,
        student: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      adminId: user.admin?.id,
      studentId: user.student?.id,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

export function authorize(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.` });
    }

    return next();
  };
}
