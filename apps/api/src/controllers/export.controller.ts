import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';

export const getReportPreview = async (req: Request, res: Response) => {
  try {
    const { orgId } = (req as any).user;
    const { startDate, endDate } = req.query;

    const data = await ReportService.getAggregatedData(
      orgId, 
      startDate as string, 
      endDate as string
    );

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const exportReport = async (req: Request, res: Response) => {
  try {
    const { orgId } = (req as any).user;
    const { startDate, endDate, format } = req.query;

    const data = await ReportService.getAggregatedData(
      orgId, 
      startDate as string, 
      endDate as string
    );

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `taskflow-report-${timestamp}`;

    switch (format) {
      case 'pdf': {
        const buffer = await ReportService.generatePDF(data);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
        return res.send(buffer);
      }
      case 'xlsx': {
        const buffer = await ReportService.generateExcel(data);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
        return res.send(buffer);
      }
      case 'csv': {
        const csv = await ReportService.generateCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
        return res.send(csv);
      }
      case 'docx': {
        const buffer = await ReportService.generateDOCX(data);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.docx`);
        return res.send(buffer);
      }
      default:
        return res.status(400).json({ error: 'Invalid format. Supported: pdf, xlsx, csv, docx' });
    }
  } catch (error: any) {
    console.error('Export Error:', error);
    res.status(500).json({ error: error.message });
  }
};
