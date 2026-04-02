import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';

const TeamSchema = z.object({
  name: z.string().min(2),
  deptId: z.string().uuid().optional(),
  teamHeadId: z.string().uuid().optional(),
  description: z.string().optional(),
});

const TeamMemberSchema = z.object({
  userId: z.string().uuid(),
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
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
