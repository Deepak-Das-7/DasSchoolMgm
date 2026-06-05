import PDFDocument from 'pdfkit';
import { Response } from 'express';

export function generatePdf(res: Response, filename: string, build: (doc: PDFKit.PDFDocument) => void) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  build(doc);
  doc.end();
}

export function feeReceiptPdf(data: {
  schoolName: string;
  studentName: string;
  receiptNo: string;
  amount: number;
  date: string;
  paymentMethod: string;
}) {
  return (doc: PDFKit.PDFDocument) => {
    doc.fontSize(20).text(data.schoolName, { align: 'center' });
    doc.moveDown().fontSize(16).text('Fee Receipt', { align: 'center' });
    doc.moveDown().fontSize(12);
    doc.text(`Receipt No: ${data.receiptNo}`);
    doc.text(`Student: ${data.studentName}`);
    doc.text(`Amount: ₹${data.amount.toLocaleString()}`);
    doc.text(`Payment Method: ${data.paymentMethod}`);
    doc.text(`Date: ${data.date}`);
    doc.moveDown().text('Thank you for your payment.', { align: 'center' });
  };
}

export function attendanceReportPdf(data: { title: string; rows: Array<{ name: string; present: number; absent: number; percentage: number }> }) {
  return (doc: PDFKit.PDFDocument) => {
    doc.fontSize(18).text(data.title, { align: 'center' });
    doc.moveDown();
    data.rows.forEach((row) => {
      doc.fontSize(10).text(`${row.name} - Present: ${row.present}, Absent: ${row.absent}, ${row.percentage}%`);
    });
  };
}

export function payrollReportPdf(data: { employeeName: string; month: number; year: number; netSalary: number; basicSalary: number }) {
  return (doc: PDFKit.PDFDocument) => {
    doc.fontSize(18).text('Payslip', { align: 'center' });
    doc.moveDown().fontSize(12);
    doc.text(`Employee: ${data.employeeName}`);
    doc.text(`Period: ${data.month}/${data.year}`);
    doc.text(`Basic Salary: ₹${data.basicSalary}`);
    doc.text(`Net Salary: ₹${data.netSalary}`);
  };
}

export function reportCardPdf(data: { studentName: string; className: string; subjects: Array<{ name: string; marks: number; grade: string }> }) {
  return (doc: PDFKit.PDFDocument) => {
    doc.fontSize(18).text('Report Card', { align: 'center' });
    doc.moveDown().text(`Student: ${data.studentName}`);
    doc.text(`Class: ${data.className}`);
    doc.moveDown();
    data.subjects.forEach((s) => doc.text(`${s.name}: ${s.marks} (${s.grade})`));
  };
}
