import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

import authRoutes from './modules/auth/routes/auth.routes';
import schoolsRoutes from './modules/schools/routes/schools.routes';
import studentsRoutes from './modules/students/routes/students.routes';
import parentsRoutes from './modules/parents/routes/parents.routes';
import teachersRoutes from './modules/teachers/routes/teachers.routes';
import employeesRoutes from './modules/employees/routes/employees.routes';
import academicsRoutes from './modules/academics/routes/academics.routes';
import attendanceRoutes from './modules/attendance/routes/attendance.routes';
import timetableRoutes from './modules/timetable/routes/timetable.routes';
import examRoutes from './modules/exams/routes/exam.routes';
import feeRoutes from './modules/fees/routes/fee.routes';
import libraryRoutes from './modules/library/routes/library.routes';
import transportRoutes from './modules/transport/routes/transport.routes';
import hostelRoutes from './modules/hostel/routes/hostel.routes';
import inventoryRoutes from './modules/inventory/routes/inventory.routes';
import payrollRoutes from './modules/payroll/routes/payroll.routes';
import communicationRoutes from './modules/communication/routes/communication.routes';
import eventsRoutes from './modules/events/routes/events.routes';
import dashboardRoutes from './modules/dashboard/routes/dashboard.routes';
import reportsRoutes from './modules/reports/routes/reports.routes';
import settingsRoutes from './modules/settings/routes/settings.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 100 : 1000,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

app.use('/uploads', express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

const api = express.Router();
api.use('/auth', authRoutes);
api.use('/schools', schoolsRoutes);
api.use('/students', studentsRoutes);
api.use('/parents', parentsRoutes);
api.use('/teachers', teachersRoutes);
api.use('/employees', employeesRoutes);
api.use('/academics', academicsRoutes);
api.use('/attendance', attendanceRoutes);
api.use('/timetable', timetableRoutes);
api.use('/exams', examRoutes);
api.use('/fees', feeRoutes);
api.use('/library', libraryRoutes);
api.use('/transport', transportRoutes);
api.use('/hostel', hostelRoutes);
api.use('/inventory', inventoryRoutes);
api.use('/payroll', payrollRoutes);
api.use('/communication', communicationRoutes);
api.use('/events', eventsRoutes);
api.use('/dashboard', dashboardRoutes);
api.use('/reports', reportsRoutes);
api.use('/settings', settingsRoutes);

api.get('/health', (_req, res) => {
  res.json({ success: true, message: 'School ERP API is running', timestamp: new Date().toISOString() });
});

app.use('/api/v1', api);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
