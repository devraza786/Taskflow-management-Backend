import { PrismaClient } from '@taskflow/database';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { createObjectCsvStringifier } from 'csv-writer';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';

const prisma = new PrismaClient();

export interface ReportData {
  projects: any[];
  taskDistribution: any[];
  metrics: {
    completed: number;
    avgDays: string;
    totalTasks: number;
    completionRate: string;
  };
  teams: any[];
}

export class ReportService {
  static async getAggregatedData(orgId: string, startDate?: string, endDate?: string): Promise<ReportData> {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    const [projects, tasks, teams] = await Promise.all([
      prisma.project.findMany({
        where: { orgId, ...dateFilter },
        select: { id: true, name: true, status: true, _count: { select: { tasks: true } } }
      }),
      prisma.task.findMany({
        where: { orgId, ...dateFilter },
        select: { status: true, createdAt: true, completedAt: true }
      }),
      prisma.team.findMany({
        where: { orgId },
        include: {
          _count: {
            select: { members: true, tasks: { where: { orgId, ...dateFilter } } }
          }
        }
      })
    ]);

    const taskDistribution = await prisma.task.groupBy({
      by: ['status'],
      where: { orgId, ...dateFilter },
      _count: true
    });

    const completedTasks = tasks.filter(t => t.status === 'done');
    let avgDays = 0;
    const completedWithDates = completedTasks.filter(t => t.completedAt);
    if (completedWithDates.length > 0) {
      const totalMs = completedWithDates.reduce((acc, t) => acc + (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()), 0);
      avgDays = totalMs / completedWithDates.length / (1000 * 60 * 60 * 24);
    }

    return {
      projects,
      taskDistribution,
      metrics: {
        completed: completedTasks.length,
        avgDays: avgDays.toFixed(1),
        totalTasks: tasks.length,
        completionRate: tasks.length > 0 ? ((completedTasks.length / tasks.length) * 100).toFixed(1) : '0'
      },
      teams
    };
  }

  static async generatePDF(data: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: any[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(25).text('Taskflow Performance Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);

      // Summary Metrics
      doc.fontSize(18).text('Executive Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12)
         .text(`Total Tasks: ${data.metrics.totalTasks}`)
         .text(`Completed Tasks: ${data.metrics.completed}`)
         .text(`Completion Rate: ${data.metrics.completionRate}%`)
         .text(`Average Cycle Time: ${data.metrics.avgDays} days`);
      doc.moveDown(2);

      // Project Table
      doc.fontSize(18).text('Project Breakdown', { underline: true });
      doc.moveDown();
      data.projects.forEach(p => {
        doc.fontSize(12).text(`${p.name} - Status: ${p.status} - Tasks: ${p._count.tasks}`);
      });

      doc.end();
    });
  }

  static async generateExcel(data: ReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Taskflow Report');

    sheet.columns = [
      { header: 'Project Name', key: 'name', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Task Count', key: 'tasks', width: 15 }
    ];

    data.projects.forEach(p => {
      sheet.addRow({
        name: p.name,
        status: p.status,
        tasks: p._count.tasks
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  static async generateCSV(data: ReportData): Promise<string> {
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Project Name' },
        { id: 'status', title: 'Status' },
        { id: 'tasks', title: 'Task Count' }
      ]
    });

    const records = data.projects.map(p => ({
      name: p.name,
      status: p.status,
      tasks: p._count.tasks
    }));

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
  }

  static async generateDOCX(data: ReportData): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Taskflow Performance Report",
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({ text: `Generated: ${new Date().toLocaleDateString()}` }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
                new TextRun({ text: "Summary Statistics", bold: true, size: 24 })
            ]
          }),
          new Paragraph({ text: `Total Tasks: ${data.metrics.totalTasks}` }),
          new Paragraph({ text: `Completion Rate: ${data.metrics.completionRate}%` }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Project Name")] }),
                  new TableCell({ children: [new Paragraph("Status")] }),
                  new TableCell({ children: [new Paragraph("Tasks")] }),
                ],
              }),
              ...data.projects.map(p => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(p.name)] }),
                  new TableCell({ children: [new Paragraph(p.status)] }),
                  new TableCell({ children: [new Paragraph(p._count.tasks.toString())] }),
                ],
              }))
            ],
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer as Buffer;
  }
}
