import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['admin', 'manager', 'team_head', 'employee']),
  deptId: z.string().uuid().optional(),
});

const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  timezone: z.string().optional(),
  preferences: z.any().optional(),
});

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

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const data = UpdateUserSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data,
      include: { organization: true },
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ error: 'Internal server error' });
  }
};
