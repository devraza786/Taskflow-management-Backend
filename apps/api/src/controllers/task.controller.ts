import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  dueDate: z.string().datetime().optional(),
  projectId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
});

const UpdateStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'review', 'blocked', 'done', 'archived']),
});

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    // Validate role: Employee cannot create/assign tasks
    if (req.user.role === 'employee') {
      return res.status(403).json({ error: 'Employees cannot create tasks' });
    }

    const data = CreateTaskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        orgId: req.user.orgId,
        createdBy: req.user.userId,
        assignedTo: data.assignedTo,
        projectId: data.projectId,
        teamId: data.teamId,
      },
      include: {
          assignee: { select: { id: true, name: true, email: true } }
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

    // Role-based scoping
    if (req.user.role === 'employee') {
      where.OR = [
          { assignedTo: req.user.userId },
          { createdBy: req.user.userId }
      ];
    } else if (req.user.role === 'team_head') {
      // In a full implementation, we'd filter by user's teams
      // For MVP basic, team_head sees all team tasks in their org/dept
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
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

    // Role-based lifecycle enforcement
    // Employee: can move their tasks from Todo -> In Progress -> Review
    if (req.user.role === 'employee' && task.assignedTo !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    // If employee, restrict status transitions
    if (req.user.role === 'employee') {
        const allowed = ['todo', 'in_progress', 'review'];
        if (!allowed.includes(status)) {
            return res.status(403).json({ error: 'Employees cannot move tasks to this status' });
        }
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
