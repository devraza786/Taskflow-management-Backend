import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../lib/jwt';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  orgName: z.string().min(2), // For MVP, first user creates the org
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, orgName } = RegisterSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Generate unique slug
    let slug = orgName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if organization slug exists
    const existingOrg = await prisma.organization.findUnique({ where: { slug } });
    if (existingOrg) {
      // If taken, append random suffix for MVP or just error
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create org and admin user (first user)
    // In a real SaaS, org creation might be a separate flow, but for MVP:
    const result = await prisma.$transaction(async (tx: any) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug, // Use the generated/checked slug
          plan: 'free',
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name,
          role: 'admin',
          orgId: org.id,
        },
      });

      return { user, org };
    });

    const accessToken = generateAccessToken(result.user.id, result.user.role, result.user.orgId);
    const refreshToken = generateRefreshToken(result.user.id);

    res.status(201).json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        orgId: result.user.orgId,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]?.message || 'Invalid input data';
      return res.status(400).json({ 
        error: firstError,
        errors: error.errors 
      });
    }

    // Handle Prisma Unique Constraint Errors (P2002)
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(400).json({ 
        error: `A record with this ${field} already exists.` 
      });
    }

    console.error('Registration Error Details:', error);
    res.status(500).json({ error: 'Internal server error during registration. Please try again later.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.id, user.role, user.orgId);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};
