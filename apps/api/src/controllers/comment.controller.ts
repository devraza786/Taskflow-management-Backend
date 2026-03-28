import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';

const CommentSchema = z.object({
  body: z.string().min(1),
  taskId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
});

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { body, taskId, parentId } = CommentSchema.parse(req.body);

    const comment = await prisma.comment.create({
      data: {
        body,
        taskId,
        parentId,
        userId: req.user.userId,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
      const comment = await prisma.comment.findUnique({ where: { id } });
      if (!comment) return res.status(404).json({ error: 'Comment not found' });
  
      if (req.user.role !== 'admin' && comment.userId !== req.user.userId) {
          return res.status(403).json({ error: 'Forbidden' });
      }
  
      await prisma.comment.delete({ where: { id } });
  
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
