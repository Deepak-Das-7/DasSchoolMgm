import { Types } from 'mongoose';
import {
  Student, Teacher, Payment, Attendance, Result, IssuedBook, HostelAllocation,
  AuditLog, Event, Announcement, StudentStatus, PaymentStatus, AttendanceStatus,
} from '../../../database/models';

export class DashboardService {
  private schoolFilter(schoolId: string) {
    return { schoolId: new Types.ObjectId(schoolId), isDeleted: false };
  }

  async getStats(schoolId: string) {
    const filter = this.schoolFilter(schoolId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStudents, totalTeachers, payments, attendanceRecords,
      results, issuedBooks, hostelAllocations,
    ] = await Promise.all([
      Student.countDocuments({ ...filter, status: StudentStatus.ACTIVE }),
      Teacher.countDocuments(filter),
      Payment.find({ ...filter, status: PaymentStatus.PAID }),
      Attendance.find({ ...filter, date: { $gte: monthStart } }),
      Result.find(filter).limit(1000),
      IssuedBook.countDocuments({ ...filter, status: 'issued' }),
      HostelAllocation.countDocuments({ ...filter, checkOutDate: { $exists: false } }),
    ]);

    const totalRevenue = payments.reduce((s, p) => s + (p.paidAmount || 0), 0);
    const monthPayments = payments.filter((p) => p.createdAt >= monthStart);
    const feeCollection = monthPayments.reduce((s, p) => s + (p.paidAmount || 0), 0);

    const presentCount = attendanceRecords.filter((a) => a.status === AttendanceStatus.PRESENT).length;
    const attendancePercent = attendanceRecords.length > 0
      ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;

    const avgMarks = results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.marksObtained, 0) / results.length) : 0;

    return {
      totalStudents, totalTeachers, totalRevenue, feeCollection,
      attendancePercent, avgExamScore: avgMarks,
      libraryUsage: issuedBooks, transportUsage: 0, hostelOccupancy: hostelAllocations,
    };
  }

  async getAdmissionsTrend(schoolId: string) {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      const count = await Student.countDocuments({
        ...this.schoolFilter(schoolId),
        admissionDate: { $gte: start, $lte: end },
      });
      months.push({ month: start.toLocaleString('default', { month: 'short' }), count });
    }
    return months;
  }

  async getRevenueTrend(schoolId: string) {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      const payments = await Payment.find({
        ...this.schoolFilter(schoolId),
        status: PaymentStatus.PAID,
        createdAt: { $gte: start, $lte: end },
      });
      months.push({
        month: start.toLocaleString('default', { month: 'short' }),
        amount: payments.reduce((s, p) => s + (p.paidAmount || 0), 0),
      });
    }
    return months;
  }

  async getAttendanceTrend(schoolId: string) {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const records = await Attendance.find({
        ...this.schoolFilter(schoolId),
        date: { $gte: start, $lte: end },
      });
      const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
      weeks.push({
        week: `Week ${4 - i}`,
        percentage: records.length > 0 ? Math.round((present / records.length) * 100) : 0,
      });
    }
    return weeks;
  }

  async getAcademicPerformance(schoolId: string) {
    const results = await Result.aggregate([
      { $match: { schoolId: new Types.ObjectId(schoolId), isDeleted: false } },
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return results.map((r) => ({ grade: r._id || 'N/A', count: r.count }));
  }

  async getRecentActivity(schoolId: string) {
    return AuditLog.find(this.schoolFilter(schoolId))
      .sort({ createdAt: -1 }).limit(10)
      .populate('userId', 'profile email');
  }

  async getUpcomingEvents(schoolId: string) {
    return Event.find({
      ...this.schoolFilter(schoolId),
      startDate: { $gte: new Date() },
    }).sort({ startDate: 1 }).limit(5);
  }

  async getAnnouncements(schoolId: string) {
    return Announcement.find({
      ...this.schoolFilter(schoolId),
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: new Date() } }],
    }).sort({ publishDate: -1 }).limit(5);
  }
}

export const dashboardService = new DashboardService();
