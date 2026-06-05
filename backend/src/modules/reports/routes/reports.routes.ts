import { Router } from 'express';
import { Types } from 'mongoose';
import { Student, Attendance, Payment, Payroll, Result, AttendanceStatus, PaymentStatus } from '../../../database/models';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { generatePdf, attendanceReportPdf, payrollReportPdf } from '../../../utils/pdfGenerator';
import { generateExcel } from '../../../utils/excelGenerator';
import { generateCsv } from '../../../utils/csvGenerator';

const router = Router();
router.use(authenticate, requireSchoolContext);

function schoolFilter(schoolId: string) {
  return { schoolId: new Types.ObjectId(schoolId), isDeleted: false };
}

router.get('/academic', requirePermission('reports:read'), async (req, res) => {
  const format = (req.query.format as string) || 'json';
  const results = await Result.find(schoolFilter(req.user!.schoolId!)).populate('studentId', 'firstName lastName').limit(500);
  const rows = results.map((r) => ({
    student: `${(r.studentId as { firstName?: string })?.firstName || ''} ${(r.studentId as { lastName?: string })?.lastName || ''}`,
    marks: r.marksObtained,
    grade: r.grade,
  }));

  if (format === 'excel') {
    await generateExcel(res, 'academic-report.xlsx', 'Academic', [
      { header: 'Student', key: 'student', width: 30 },
      { header: 'Marks', key: 'marks', width: 10 },
      { header: 'Grade', key: 'grade', width: 10 },
    ], rows);
    return;
  }
  if (format === 'csv') {
    generateCsv(res, 'academic-report.csv', ['Student', 'Marks', 'Grade'], rows.map((r) => [r.student, String(r.marks), r.grade || '']));
    return;
  }
  res.json({ success: true, data: rows });
});

router.get('/attendance', requirePermission('reports:read'), async (req, res) => {
  const format = (req.query.format as string) || 'json';
  const records = await Attendance.find(schoolFilter(req.user!.schoolId!)).limit(1000);
  const grouped = new Map<string, { present: number; absent: number }>();

  for (const r of records) {
    const key = r.entityId.toString();
    if (!grouped.has(key)) grouped.set(key, { present: 0, absent: 0 });
    const g = grouped.get(key)!;
    if (r.status === AttendanceStatus.PRESENT) g.present++;
    else g.absent++;
  }

  const rows = Array.from(grouped.entries()).map(([id, g]) => ({
    name: id,
    present: g.present,
    absent: g.absent,
    percentage: Math.round((g.present / (g.present + g.absent)) * 100),
  }));

  if (format === 'pdf') {
    generatePdf(res, 'attendance-report.pdf', attendanceReportPdf({ title: 'Attendance Report', rows }));
    return;
  }
  if (format === 'excel') {
    await generateExcel(res, 'attendance-report.xlsx', 'Attendance', [
      { header: 'Entity', key: 'name', width: 25 },
      { header: 'Present', key: 'present', width: 10 },
      { header: 'Absent', key: 'absent', width: 10 },
      { header: '%', key: 'percentage', width: 10 },
    ], rows);
    return;
  }
  res.json({ success: true, data: rows });
});

router.get('/financial', requirePermission('reports:financial'), async (req, res) => {
  const format = (req.query.format as string) || 'json';
  const payments = await Payment.find({ ...schoolFilter(req.user!.schoolId!), status: PaymentStatus.PAID });
  const rows = payments.map((p) => ({
    receiptNo: p.receiptNo,
    amount: p.paidAmount,
    method: p.paymentMethod,
    date: p.createdAt.toISOString().split('T')[0],
  }));

  if (format === 'excel') {
    await generateExcel(res, 'financial-report.xlsx', 'Payments', [
      { header: 'Receipt', key: 'receiptNo', width: 15 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Method', key: 'method', width: 15 },
      { header: 'Date', key: 'date', width: 12 },
    ], rows);
    return;
  }
  res.json({ success: true, data: rows, total: rows.reduce((s, r) => s + r.amount, 0) });
});

router.get('/payroll', requirePermission('reports:read'), async (req, res) => {
  const format = (req.query.format as string) || 'json';
  const payrolls = await Payroll.find(schoolFilter(req.user!.schoolId!));
  const rows = payrolls.map((p) => ({
    employeeId: p.employeeId.toString(),
    month: p.month,
    year: p.year,
    netSalary: p.netSalary,
  }));

  if (format === 'pdf' && payrolls[0]) {
    generatePdf(res, 'payroll-report.pdf', payrollReportPdf({
      employeeName: payrolls[0].employeeId.toString(),
      month: payrolls[0].month,
      year: payrolls[0].year,
      netSalary: payrolls[0].netSalary,
      basicSalary: payrolls[0].basicSalary,
    }));
    return;
  }
  if (format === 'excel') {
    await generateExcel(res, 'payroll-report.xlsx', 'Payroll', [
      { header: 'Employee', key: 'employeeId', width: 25 },
      { header: 'Month', key: 'month', width: 8 },
      { header: 'Year', key: 'year', width: 8 },
      { header: 'Net Salary', key: 'netSalary', width: 12 },
    ], rows);
    return;
  }
  res.json({ success: true, data: rows });
});

export default router;
