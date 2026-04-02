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
        project: {
          orgId
        }
      },
      _count: true
    });

    res.json({
      projects: stats,
      taskDistribution: taskStatusCounts
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
