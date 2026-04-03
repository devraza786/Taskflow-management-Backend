import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendInvitationEmail } from '../lib/email';

const TeamSchema = z.object({
  name: z.string().min(2),
  deptId: z.string().uuid().optional(),
  teamHeadId: z.string().uuid().optional(),
  description: z.string().optional(),
});

const TeamMemberSchema = z.object({
  userId: z.string().uuid(),
});

const InvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'team_head', 'employee']).default('employee'),
});

export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role === 'employee') return res.status(403).json({ error: 'Forbidden' });

    const { name, deptId, teamHeadId, description } = TeamSchema.parse(req.body);

    const team = await prisma.team.create({
      data: {
        name,
        orgId: req.user.orgId,
        deptId,
        teamHeadId,
        description,
      },
    });

    res.status(201).json(team);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeams = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const teams = await prisma.team.findMany({
      where: { orgId: req.user.orgId },
      include: {
        department: { select: { id: true, name: true } },
        teamHead: { select: { id: true, name: true, avatarUrl: true } },
        _count: {
          select: { members: true, tasks: true },
        },
      },
    });

    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeamById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const team = await prisma.team.findUnique({
      where: { id, orgId: req.user.orgId },
      include: {
        department: { select: { id: true, name: true } },
        teamHead: { select: { id: true, name: true, avatarUrl: true } },
        _count: {
          select: { members: true, tasks: true },
        },
      },
    });

    if (!team) return res.status(404).json({ error: 'Team not found' });

    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id: teamId } = req.params;
    const { userId } = TeamMemberSchema.parse(req.body);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Verify team belongs to org
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.orgId !== req.user.orgId) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const membership = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
      },
    });

    res.status(201).json(membership);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeamMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { id: teamId } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
      },
    });

    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const data = TeamSchema.partial().parse(req.body);

    const updatedTeam = await prisma.team.update({
      where: { id, orgId: req.user.orgId },
      data,
    });

    res.json(updatedTeam);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role === 'employee') return res.status(403).json({ error: 'Forbidden' });

    await prisma.team.delete({
      where: { id, orgId: req.user.orgId },
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id: teamId, userId } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role === 'employee') return res.status(403).json({ error: 'Forbidden' });

    // Verify team belongs to org
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.orgId !== req.user.orgId) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const inviteTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id: teamId } = req.params;
    const { email, role } = InvitationSchema.parse(req.body);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Verify team exists and belongs to org
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { organization: true }
    });

    if (!team || team.orgId !== req.user.orgId) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user already in team
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        user: { email }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this team' });
    }

    // Check if there's a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        teamId,
        email,
        status: 'pending',
        expiresAt: { gt: new Date() }
      }
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'An active invitation already exists for this email' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        teamId,
        orgId: req.user.orgId,
        inviterId: req.user.userId,
        token,
        expiresAt,
        status: 'pending'
      }
    });

    // Send Email
    await sendInvitationEmail(
      email,
      req.user.name || 'A team member',
      team.organization.name,
      token
    );

    res.status(201).json({ message: 'Invitation sent successfully', invitation });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error('Invitation Error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
};
