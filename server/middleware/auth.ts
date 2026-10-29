import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'edupulse_jwt_secret_key_2026_super_secure_vault';

export interface AuthUser {
  id: string;
  name: string;
  role: 'admin' | 'faculty' | 'student' | 'tpo';
  student_id?: string;
  email?: string;
  department?: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Generate signed JWT token for user session
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Authentication middleware that extracts and validates Bearer token
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);
  if (!authHeader) {
    return next();
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  if (!token) {
    return next();
  }

  // Support institutional mock/demo tokens seamlessly
  if (token === 'mock_admin_token_demo') {
    req.user = {
      id: 'admin_root_1',
      name: 'Dean of Academic Affairs',
      role: 'admin',
      email: 'admin@edupulse.edu',
      department: 'Institutional Governance',
    };
    return next();
  }

  if (token === 'mock_faculty_token_demo') {
    req.user = {
      id: 'fac_advisor_1',
      name: 'Faculty Advisor',
      role: 'faculty',
      email: 'faculty@edupulse.edu',
      department: 'Computer Science',
    };
    return next();
  }

  if (token === 'mock_tpo_token_demo') {
    req.user = {
      id: 'tpo_officer_1',
      name: 'Prof. Vikram Malhotra',
      role: 'tpo',
      email: 'tpo@edupulse.edu',
      department: 'Corporate Relations & Placement Cell',
    };
    return next();
  }

  if (token.startsWith('mock_student_token')) {
    req.user = {
      id: 'student_user_1',
      name: 'Student User',
      role: 'student',
      student_id: 'STU001',
      email: 'student@edupulse.edu',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
  } catch (err: any) {
    // Expired or invalid token, req.user remains undefined
  }
  next();
}

/**
 * Guard: Require authenticated user
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in with valid institutional credentials.',
    });
  }
  next();
}

/**
 * Guard: Require specific role(s)
 */
export function requireRole(allowedRoles: ('admin' | 'faculty' | 'student' | 'tpo')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role "${req.user.role}" does not have permission to access this resource. Requires: ${allowedRoles.join(' or ')}.`,
      });
    }

    next();
  };
}
