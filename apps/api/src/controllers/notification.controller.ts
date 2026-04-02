import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { id: userId } = (req as any).user;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id: userId } = (req as any).user;
    const { notificationId } = req.params;

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId
      },
      data: {
        isRead: true
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createNotification = async (userId: string, title: string, body: string, type: string) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
      }
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};
