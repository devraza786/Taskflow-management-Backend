import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToCSV = (data: any[], fileName: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
};

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any[], title: string, fileName: string) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  
  const headers = Object.keys(data[0]);
  const body = data.map(row => headers.map(header => row[header]));

  (doc as any).autoTable({
    head: [headers],
    body: body,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [14, 165, 233] }
  });

  doc.save(`${fileName}.pdf`);
};

// Simple Word export using HTML blob
export const exportToWord = (data: any[], title: string, fileName: string) => {
  const headers = Object.keys(data[0]);
  const tableHtml = `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        <h1>${title}</h1>
        <table border="1">
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.map(row => `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  const blob = new Blob([tableHtml], { type: 'application/msword' });
  saveAs(blob, `${fileName}.doc`);
};
