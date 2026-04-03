import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { uploadToSupabase } from '../lib/supabase';

const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

const UpdateOrgSchema = z.object({
  name: z.string().optional(),
  settings: z.any().optional(),
});

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['admin', 'manager', 'team_head', 'employee']),
  deptId: z.string().uuid().optional(),
});

const ProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
});

const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  timezone: z.string().optional(),
  preferences: z.any().optional(),
});

const ROLE_WEIGHTS: Record<string, number> = {
  admin: 4,
  manager: 3,
  team_head: 2,
  employee: 1,
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { organization: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Don't send password hash
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const allUsers = await prisma.user.findMany({
      where: { orgId: req.user.orgId },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    });

    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const data = CreateUserSchema.parse(req.body);

    // Role Hierarchy Validation
    const creatorRole = req.user.role;
    const targetRole = data.role;

    // 1. Only admins can create other admins
    if (targetRole === 'admin' && creatorRole !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can create other admin users.' });
    }

    // 2. Cannot assign a role higher than your own
    if (ROLE_WEIGHTS[targetRole] > ROLE_WEIGHTS[creatorRole]) {
      return res.status(403).json({ 
        error: `Insufficient permissions. You cannot assign the '${targetRole}' role because it is higher than your current role of '${creatorRole}'.` 
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        name: data.name,
        role: data.role,
        orgId: req.user.orgId,
      },
    });

    res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params;
    const data = UpdateUserSchema.parse(req.body);
    const targetRole = (req.body as any).role;

    // Permissions Check
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Only admins and managers can update other users.' });
    }

    // Role Hierarchy Validation
    if (targetRole) {
      const creatorRole = req.user.role;

      // 1. Only admins can assign admin role
      if (targetRole === 'admin' && creatorRole !== 'admin') {
        return res.status(403).json({ error: 'Only administrators can assign the admin role.' });
      }

      // 2. Cannot assign a role higher than your own
      if (ROLE_WEIGHTS[targetRole] > ROLE_WEIGHTS[creatorRole]) {
        return res.status(403).json({ 
          error: `Insufficient permissions. You cannot assign the '${targetRole}' role because it is higher than your current role of '${creatorRole}'.` 
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id, orgId: req.user.orgId },
      data: {
        ...data,
        role: targetRole || undefined,
        // Ensure preferences is handled as an object
        preferences: data.preferences ? (typeof data.preferences === 'string' ? JSON.parse(data.preferences) : data.preferences) : undefined
      },
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const data = UpdateUserSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...data,
        preferences: data.preferences ? (typeof data.preferences === 'string' ? JSON.parse(data.preferences) : data.preferences) : undefined
      },
      include: { organization: true },
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.file) {
        return res.status(400).json({ error: 'No image provided' });
    }

    const path = `profile-${req.user.userId}-${Date.now()}`;
    const publicUrl = await uploadToSupabase(req.file, path);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        avatarUrl: publicUrl,
      },
      include: { organization: true }
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error('Avatar Update Error:', error);
    res.status(500).json({ error: 'Failed to update avatar', details: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.passwordHash) {
      return res.status(400).json({ error: 'User does not have a local password set.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash as string);
    if (!isMatch) return res.status(401).json({ error: 'Invalid current password' });

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { passwordHash: newHashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Only admins can update organization settings' });
      }
  
      const data = UpdateOrgSchema.parse(req.body);
  
      const updatedOrg = await prisma.organization.update({
        where: { id: req.user.orgId },
        data: {
            name: data.name,
            settings: data.settings ? (typeof data.settings === 'string' ? JSON.parse(data.settings) : data.settings) : undefined
        }
      });
  
      res.json(updatedOrg);
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      res.status(500).json({ error: 'Failed to update organization' });
    }
};
