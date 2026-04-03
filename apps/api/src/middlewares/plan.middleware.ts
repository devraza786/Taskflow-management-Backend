import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { PrismaClient } from '@taskflow/database';

const prisma = new PrismaClient();

export const checkPlan = (requiredPlans: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.orgId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const organization = await prisma.organization.findUnique({
        where: { id: req.user.orgId },
        select: { plan: true }
      });

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      if (!requiredPlans.includes(organization.plan)) {
        return res.status(403).json({
          error: 'Feature Locked',
          message: `This feature requires a ${requiredPlans.join(' or ')} plan. Please upgrade to access AI insights.`,
          currentPlan: organization.plan
        });
      }

      next();
    } catch (error) {
      console.error('Plan Check Error:', error);
      res.status(500).json({ error: 'Internal server error during plan verification' });
    }
  };
};
