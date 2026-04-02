import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const { orgId } = (req as any).user;

    const stats = await prisma.project.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        status: true,
        _count: {
          select: {
            tasks: true,
          }
        }
      }
    });

    const taskStatusCounts = await prisma.task.groupBy({
      by: ['status'],
      where: {
        orgId
      },
      _count: true
    });

    // Custom aggregation for Velocity and KPIs
    const allTasks = await prisma.task.findMany({
      where: { orgId },
      select: { status: true, createdAt: true, completedAt: true }
    });

    const completedTasks = allTasks.filter(t => t.status === 'done');
    let avgDays = 0;
    const completedWithDates = completedTasks.filter(t => t.completedAt);
    if (completedWithDates.length > 0) {
      const totalMs = completedWithDates.reduce((acc, t) => acc + (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()), 0);
      avgDays = totalMs / completedWithDates.length / (1000 * 60 * 60 * 24);
    }

    const velocity = [];
    for(let i=5; i>=0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i+1)*7);
      const end = new Date();
      end.setDate(end.getDate() - i*7);
      
      const createdUpToNow = allTasks.filter(t => new Date(t.createdAt) <= end);
      const doneThisWeek = allTasks.filter(t => t.status === 'done' && t.completedAt && new Date(t.completedAt) >= start && new Date(t.completedAt) <= end);
      
      velocity.push({
        name: `Week ${6-i}`,
        completed: doneThisWeek.length,
        total: createdUpToNow.length
      });
    }

    res.json({
      projects: stats,
      taskDistribution: taskStatusCounts,
      metrics: {
        completed: completedTasks.length,
        avgDays: avgDays.toFixed(1),
        velocity
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTeamPerformance = async (req: Request, res: Response) => {
  try {
    const { orgId } = (req as any).user;

    const teamStats = await prisma.team.findMany({
      where: {
        orgId
      },
      include: {
        _count: {
          select: {
            members: true,
            tasks: true
          }
        }
      }
    });

    res.json(teamStats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
