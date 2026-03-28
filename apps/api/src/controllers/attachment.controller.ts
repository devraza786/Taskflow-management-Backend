import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { z } from 'zod';

const AttachmentSchema = z.object({
  filename: z.string(),
  fileUrl: z.string().url(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  taskId: z.string().uuid(),
});

export const createAttachment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { filename, fileUrl, fileSize, mimeType, taskId } = AttachmentSchema.parse(req.body);

    const attachment = await prisma.attachment.create({
      data: {
        filename,
        fileUrl,
        fileSize: fileSize ? BigInt(fileSize) : null,
        mimeType,
        taskId,
        uploadedBy: req.user.userId,
      },
    });

    res.status(201).json(attachment);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAttachment = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
      const attachment = await prisma.attachment.findUnique({ where: { id } });
      if (!attachment) return res.status(404).json({ error: 'Attachment not found' });
  
      if (req.user.role !== 'admin' && attachment.uploadedBy !== req.user.userId) {
          return res.status(403).json({ error: 'Forbidden' });
      }
  
      await prisma.attachment.delete({ where: { id } });
  
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
