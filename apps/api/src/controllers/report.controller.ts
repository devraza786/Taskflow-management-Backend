import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import openai from '../lib/openai';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import { format } from 'date-fns';

export const exportReport = async (req: Request, res: Response) => {
  try {
    const { orgId } = (req as any).user;
    const { format: exportFormat, startDate, endDate } = req.query;

    const [projects, tasks, teams] = await Promise.all([
      prisma.project.findMany({
        where: { orgId },
        include: { _count: { select: { tasks: true } } }
      }),
      prisma.task.findMany({
        where: { 
            orgId,
            ...(startDate || endDate ? {
                createdAt: {
                  ...(startDate ? { gte: new Date(startDate as string) } : {}),
                  ...(endDate ? { lte: new Date(endDate as string) } : {})
                }
              } : {})
        },
        include: { project: true, assignee: true }
      }),
      prisma.team.findMany({
        where: { orgId },
        include: { _count: { select: { members: true, tasks: true } } }
      })
    ]);

    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    const fileName = `Taskflow-Report-${timestamp}`;

    if (exportFormat === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
      doc.pipe(res);

      doc.fontSize(25).text('Taskflow Analytics Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
      doc.moveDown();

      doc.fontSize(18).text('Project Summary');
      projects.forEach(p => {
        doc.fontSize(12).text(`- ${p.name}: ${p.status} (${p._count.tasks} tasks)`);
      });
      doc.moveDown();

      doc.fontSize(18).text('Task Details');
      tasks.forEach(t => {
        doc.fontSize(10).text(`- ${t.title} [${t.status}] - Project: ${t.project?.name || 'N/A'}`);
      });

      doc.end();
      return;
    }

    if (exportFormat === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Tasks');
      
      sheet.columns = [
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Project', key: 'project', width: 20 },
        { header: 'Assignee', key: 'assignee', width: 20 },
        { header: 'Created At', key: 'createdAt', width: 20 },
      ];

      tasks.forEach(t => {
        sheet.addRow({
          title: t.title,
          status: t.status,
          project: t.project?.name || 'N/A',
          assignee: t.assignee?.name || 'Unassigned',
          createdAt: t.createdAt.toISOString(),
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
      await workbook.xlsx.write(res);
      return res.end();
    }

    if (exportFormat === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);

      const csvData = tasks.map(t => ({
        title: t.title,
        status: t.status,
        project: t.project?.name || 'N/A',
        assignee: t.assignee?.name || 'Unassigned',
        createdAt: t.createdAt.toISOString()
      }));

      // Writing to a temporary buffer or string might be easier for direct response
      const header = 'Title,Status,Project,Assignee,Created At\n';
      const rows = csvData.map(d => `"${d.title}","${d.status}","${d.project}","${d.assignee}","${d.createdAt}"`).join('\n');
      return res.send(header + rows);
    }

    res.status(400).json({ error: 'Unsupported format' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const { orgId } = (req as any).user;
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    const stats = await prisma.project.findMany({
      where: { orgId, ...dateFilter },
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
        orgId,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate as string) } : {}),
            ...(endDate ? { lte: new Date(endDate as string) } : {})
          }
        } : {})
      },
      _count: true
    });

    // Custom aggregation for Velocity and KPIs
    const allTasks = await prisma.task.findMany({
      where: { 
          orgId,
          ...(startDate || endDate ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate as string) } : {}),
              ...(endDate ? { lte: new Date(endDate as string) } : {})
            }
          } : {})
      },
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
    const { startDate, endDate } = req.query;

    const teamStats = await prisma.team.findMany({
      where: { orgId },
      include: {
        _count: {
          select: {
            members: true,
            tasks: {
                where: {
                    ...(startDate || endDate ? {
                        createdAt: {
                          ...(startDate ? { gte: new Date(startDate as string) } : {}),
                          ...(endDate ? { lte: new Date(endDate as string) } : {})
                        }
                      } : {})
                }
            }
          }
        }
      }
    });

    res.json(teamStats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAIInsights = async (req: Request, res: Response) => {
  try {
    const { orgId } = (req as any).user;

    // 1. Check Organization Plan Tier
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true }
    });

    const isPremium = organization?.plan === 'business' || organization?.plan === 'enterprise';

    if (!isPremium) {
      return res.status(403).json({ 
        error: 'AI Insights is a Premium Feature',
        message: 'Please upgrade your organization plan to access advanced AI-driven project analytics.'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          error: 'AI Service Unavailable',
          message: 'The AI service is currently not configured. Please contact support.'
        });
    }

    // 2. Fetch context for AI
    const [taskStats, projects, teams] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where: { orgId },
        _count: true
      }),
      prisma.project.findMany({
        where: { orgId },
        select: { name: true, status: true, _count: { select: { tasks: true } } }
      }),
      prisma.team.findMany({
        where: { orgId },
        select: { name: true, _count: { select: { members: true, tasks: true } } }
      })
    ]);

    const context = {
      taskDistribution: taskStats,
      projectsSummary: projects,
      teamStats: teams
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert project management AI. Analyze the provided project data and return 3 actionable insights in JSON format. Each insight must have: title, description, type (positive, warning, or suggestion), and a color theme (emerald, amber, or indigo)."
        },
        {
          role: "user",
          content: `Data: ${JSON.stringify(context)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const body = JSON.parse(completion.choices[0].message.content || '{}');
    res.json(body.insights || body);
  } catch (error: any) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ error: 'Failed to generate AI insights' });
  }
};
