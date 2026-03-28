import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';

import { logAction } from '../lib/events';

const UpdateOrgSchema = z.object({
  name: z.string().min(2).optional(),
  logoUrl: z.string().url().optional(),
  settings: z.record(z.any()).optional(),
});

export const getOrganization = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const org = await prisma.organization.findUnique({
      where: { id: req.user.orgId },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
            departments: true,
            teams: true,
          },
        },
      },
    });

    if (!org) return res.status(404).json({ error: 'Organization not found' });

    res.json(org);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    // Only Admin can update org settings
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update organization settings' });
    }

    const data = UpdateOrgSchema.parse(req.body);

    const oldOrg = await prisma.organization.findUnique({ where: { id: req.user.orgId } });

    const updatedOrg = await prisma.organization.update({
      where: { id: req.user.orgId },
      data: {
        name: data.name,
        logoUrl: data.logoUrl,
        settings: data.settings || undefined,
      },
    });

    // Audit Log
    await logAction({
        orgId: req.user.orgId,
        actorId: req.user.userId,
        action: 'UPDATE_ORGANIZATION',
        entityType: 'Organization',
        entityId: req.user.orgId,
        oldValue: oldOrg,
        newValue: updatedOrg,
    });

    res.json(updatedOrg);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrgAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ error: 'Forbidden' });
      }
  
      const logs = await prisma.auditLog.findMany({
        where: { orgId: req.user.orgId },
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
  
      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
