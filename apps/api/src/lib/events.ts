import prisma from './prisma';

export const logAction = async (params: {
  orgId: string;
  actorId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        orgId: params.orgId,
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValue: params.oldValue,
        newValue: params.newValue,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};

export const createNotification = async (params: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: any;
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        data: params.data || {},
      },
    });
    // In a real app, emit a socket.io event here
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};
