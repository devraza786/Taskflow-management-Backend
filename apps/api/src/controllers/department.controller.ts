import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';

const DepartmentSchema = z.object({
  name: z.string().min(2),
  managerId: z.string().uuid().optional(),
  parentDeptId: z.string().uuid().optional(),
});

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, managerId, parentDeptId } = DepartmentSchema.parse(req.body);

    const dept = await prisma.department.create({
      data: {
        name,
        orgId: req.user.orgId,
        managerId,
        parentDeptId,
      },
    });

    res.status(201).json(dept);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const depts = await prisma.department.findMany({
      where: { orgId: req.user.orgId },
      include: {
        manager: { select: { id: true, name: true, avatarUrl: true } },
        _count: {
          select: {
            teams: true,
            projects: true,
            subDepartments: true,
          },
        },
      },
    });

    res.json(depts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const data = DepartmentSchema.partial().parse(req.body);

    const updatedDept = await prisma.department.update({
      where: { id, orgId: req.user.orgId },
      data,
    });

    res.json(updatedDept);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    await prisma.department.delete({
      where: { id, orgId: req.user.orgId },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
