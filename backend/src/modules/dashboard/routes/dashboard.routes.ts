import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { sendSuccess } from '../../../utils/apiResponse';
import { dashboardService } from '../services/dashboard.service';

const router = Router();
router.use(authenticate, requireSchoolContext, requirePermission('dashboard:read'));

router.get('/stats', async (req, res) => {
  sendSuccess(res, await dashboardService.getStats(req.user!.schoolId!));
});
router.get('/charts/admissions', async (req, res) => {
  sendSuccess(res, await dashboardService.getAdmissionsTrend(req.user!.schoolId!));
});
router.get('/charts/revenue', async (req, res) => {
  sendSuccess(res, await dashboardService.getRevenueTrend(req.user!.schoolId!));
});
router.get('/charts/attendance', async (req, res) => {
  sendSuccess(res, await dashboardService.getAttendanceTrend(req.user!.schoolId!));
});
router.get('/charts/academic', async (req, res) => {
  sendSuccess(res, await dashboardService.getAcademicPerformance(req.user!.schoolId!));
});
router.get('/recent-activity', async (req, res) => {
  sendSuccess(res, await dashboardService.getRecentActivity(req.user!.schoolId!));
});
router.get('/upcoming-events', async (req, res) => {
  sendSuccess(res, await dashboardService.getUpcomingEvents(req.user!.schoolId!));
});
router.get('/announcements', async (req, res) => {
  sendSuccess(res, await dashboardService.getAnnouncements(req.user!.schoolId!));
});

export default router;
