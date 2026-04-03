import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';

const ProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  deptId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role === 'employee') return res.status(403).json({ error: 'Forbidden' });

    const data = ProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        ...data,
        orgId: req.user.orgId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const projects = await prisma.project.findMany({
      where: { orgId: req.user.orgId },
      include: {
        department: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, avatarUrl: true } },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const project = await prisma.project.findUnique({
      where: { id, orgId: req.user.orgId },
      include: {
        department: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, avatarUrl: true } },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const data = ProjectSchema.partial().parse(req.body);

    const updatedProject = await prisma.project.update({
      where: { id, orgId: req.user.orgId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    res.json(updatedProject);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.project.delete({
      where: { id, orgId: req.user.orgId },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
