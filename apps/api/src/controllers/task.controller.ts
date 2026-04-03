import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'review', 'blocked', 'done', 'archived']).default('todo'),
  dueDate: z.string().optional().or(z.date()),
  startDate: z.string().optional().or(z.date()),
  projectId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  estimatedHours: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

const UpdateStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'review', 'blocked', 'done', 'archived']),
});

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const data = TaskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        orgId: req.user.orgId,
        createdBy: req.user.userId,
        assignedTo: data.assignedTo,
        projectId: data.projectId,
        teamId: data.teamId,
        parentTaskId: data.parentTaskId,
        estimatedHours: data.estimatedHours,
        tags: data.tags || [],
      },
      include: {
          assignee: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    let where: any = { orgId: req.user.orgId, deletedAt: null };

    // Basic filtering
    if (req.query.projectId) where.projectId = req.query.projectId as string;
    if (req.query.teamId) where.teamId = req.query.teamId as string;
    if (req.query.status) where.status = req.query.status as TaskStatus;

    if (req.user.role === 'employee') {
      where.OR = [
          { assignedTo: req.user.userId },
          { createdBy: req.user.userId }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true } },
        _count: { select: { subTasks: true, comments: true } }
      },
      orderBy: { position: 'asc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          assignee: { select: { id: true, name: true, avatarUrl: true } },
          creator: { select: { id: true, name: true } },
          subTasks: {
              include: { assignee: { select: { id: true, name: true, avatarUrl: true } } }
          },
          comments: {
              include: { user: { select: { id: true, name: true, avatarUrl: true } } },
              orderBy: { createdAt: 'asc' }
          },
          attachments: true,
          dependencies: { include: { dependsOnTask: true } },
          project: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } }
        }
      });
  
      if (!task || task.orgId !== req.user.orgId) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      res.json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

export const updateTask = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
      const data = TaskSchema.partial().parse(req.body);
  
      const task = await prisma.task.findUnique({ where: { id } });
      if (!task || task.orgId !== req.user.orgId) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      // Basic permission check: only creator or admin or assignee can update
      if (req.user.role === 'employee' && task.createdBy !== req.user.userId && task.assignedTo !== req.user.userId) {
          return res.status(403).json({ error: 'Forbidden' });
      }
  
      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          completedAt: data.status === 'done' ? new Date() : undefined,
        },
      });
  
      res.json(updatedTask);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params;
    const { status } = UpdateStatusSchema.parse(req.body);

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.orgId !== req.user.orgId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role === 'employee' && task.assignedTo !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { 
          status,
          completedAt: status === 'done' ? new Date() : task.completedAt
      },
    });

    res.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.orgId !== req.user.orgId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only admin, manager, team_head or creator can delete
    if (req.user.role === 'employee' && task.createdBy !== req.user.userId) {
      return res.status(403).json({ error: 'Insuficient permissions to delete this task.' });
    }

    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
