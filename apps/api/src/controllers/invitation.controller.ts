import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { mailService } from '../services/mail.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export const createInvitation = async (req: Request, res: Response) => {
  const { email, role, teamId } = req.body;
  const user = (req as any).user;

  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role are required' });
  }

  // Phase 5: Role-based security check
  // Only admins can invite other admins
  if (role === 'admin' && user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Unauthorized', 
      message: 'Only administrators can invite other administrators.' 
    });
  }

  try {
    // Check if user already exists in organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        orgId: user.orgId,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User is already a member of this organization' });
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        orgId: user.orgId,
        teamId: teamId || null,
        inviterId: user.id,
        token,
        expiresAt,
      },
      include: {
        organization: true,
        inviter: true,
      },
    });

    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invitation/${token}`;
    
    await mailService.sendInvitation(
      email,
      invitation.inviter.name,
      invitation.organization.name,
      inviteUrl
    );

    res.status(201).json({ 
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (error) {
    console.error('Invitation Controller: Failed to create invitation', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
};

export const getInvitation = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          }
        },
        inviter: {
          select: {
            name: true,
            avatarUrl: true,
          }
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: `Invitation is already ${invitation.status}` });
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      });
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    res.json(invitation);
  } catch (error) {
    console.error('Invitation Controller: Failed to fetch invitation', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptInvitation = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password, name } = req.body;

  if (!password || !name) {
    return res.status(400).json({ error: 'Name and password are required' });
  }

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.status !== 'pending' || new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired invitation' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Use transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          name,
          passwordHash,
          role: invitation.role,
          orgId: invitation.orgId,
          status: 'active',
        }
      });

      // 2. Add to Team if applicable
      if (invitation.teamId) {
        await tx.teamMember.create({
          data: {
            teamId: invitation.teamId,
            userId: user.id,
          }
        });
      }

      // 3. Mark invitation as accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
        }
      });

      return user;
    });

    // Generate JWT for immediate login
    const accessToken = jwt.sign(
      { userId: result.id, email: result.email, role: result.role, orgId: result.orgId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { userId: result.id },
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Invitation accepted successfully',
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        orgId: result.orgId
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Invitation Controller: Failed to accept invitation', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
};
