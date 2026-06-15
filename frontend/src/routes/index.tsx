import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const StudentsPage = lazy(() => import('@/pages/students/StudentsPage').then((m) => ({ default: m.StudentsPage })));
const TeachersPage = lazy(() => import('@/pages/teachers/TeachersPage').then((m) => ({ default: m.TeachersPage })));
const ParentsPage = lazy(() => import('@/pages/parents/ParentsPage').then((m) => ({ default: m.ParentsPage })));
const EmployeesPage = lazy(() => import('@/pages/employees/EmployeesPage').then((m) => ({ default: m.EmployeesPage })));
const AttendancePage = lazy(() => import('@/pages/attendance/AttendancePage').then((m) => ({ default: m.AttendancePage })));
const ClassesPage = lazy(() => import('@/pages/academics/ClassesPage').then((m) => ({ default: m.ClassesPage })));
const SectionsPage = lazy(() => import('@/pages/academics/SectionsPage').then((m) => ({ default: m.SectionsPage })));
const SubjectsPage = lazy(() => import('@/pages/academics/SubjectsPage').then((m) => ({ default: m.SubjectsPage })));
const TimetablePage = lazy(() => import('@/pages/timetable/TimetablePage').then((m) => ({ default: m.TimetablePage })));
const ExamsPage = lazy(() => import('@/pages/exams/ExamsPage').then((m) => ({ default: m.ExamsPage })));
const FeesPage = lazy(() => import('@/pages/fees/FeesPage').then((m) => ({ default: m.FeesPage })));
const LibraryPage = lazy(() => import('@/pages/library/LibraryPage').then((m) => ({ default: m.LibraryPage })));
const TransportPage = lazy(() => import('@/pages/transport/TransportPage').then((m) => ({ default: m.TransportPage })));
const HostelPage = lazy(() => import('@/pages/hostel/HostelPage').then((m) => ({ default: m.HostelPage })));
const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage').then((m) => ({ default: m.InventoryPage })));
const PayrollPage = lazy(() => import('@/pages/payroll/PayrollPage').then((m) => ({ default: m.PayrollPage })));
const CommunicationPage = lazy(() => import('@/pages/communication/CommunicationPage').then((m) => ({ default: m.CommunicationPage })));
const EventsPage = lazy(() => import('@/pages/events/EventsPage').then((m) => ({ default: m.EventsPage })));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const SchoolProfilePage = lazy(() => import('@/pages/school/ProfilePage').then((m) => ({ default: m.SchoolProfilePage })));
const SchoolSessionPage = lazy(() => import('@/pages/school/SessionPage').then((m) => ({ default: m.SchoolSessionPage })));
const SchoolBranchPage = lazy(() => import('@/pages/school/BranchPage').then((m) => ({ default: m.SchoolBranchPage })));
function PageLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <LazyPage><DashboardPage /></LazyPage> },
      { path: 'students', element: <LazyPage><StudentsPage /></LazyPage> },
      { path: 'teachers', element: <LazyPage><TeachersPage /></LazyPage> },
      { path: 'parents', element: <LazyPage><ParentsPage /></LazyPage> },
      { path: 'employees', element: <LazyPage><EmployeesPage /></LazyPage> },
      { path: 'attendance', element: <LazyPage><AttendancePage /></LazyPage> },
      { path: 'academics/classes', element: <LazyPage><ClassesPage /></LazyPage> },
      { path: 'academics/sections', element: <LazyPage><SectionsPage /></LazyPage> },
      { path: 'academics/subjects', element: <LazyPage><SubjectsPage /></LazyPage> },
      { path: 'academics/syllabus', element: <LazyPage><SubjectsPage /></LazyPage> },
      { path: 'academics/lesson-plans', element: <LazyPage><SubjectsPage /></LazyPage> },
      { path: 'timetable', element: <LazyPage><TimetablePage /></LazyPage> },
      { path: 'exams', element: <LazyPage><ExamsPage /></LazyPage> },
      { path: 'fees', element: <LazyPage><FeesPage /></LazyPage> },
      { path: 'library', element: <LazyPage><LibraryPage /></LazyPage> },
      { path: 'transport', element: <LazyPage><TransportPage /></LazyPage> },
      { path: 'hostel', element: <LazyPage><HostelPage /></LazyPage> },
      { path: 'inventory', element: <LazyPage><InventoryPage /></LazyPage> },
      { path: 'payroll', element: <LazyPage><PayrollPage /></LazyPage> },
      { path: 'communication', element: <LazyPage><CommunicationPage /></LazyPage> },
      { path: 'events', element: <LazyPage><EventsPage /></LazyPage> },
      { path: 'reports', element: <LazyPage><ReportsPage /></LazyPage> },
      { path: 'settings', element: <LazyPage><SettingsPage /></LazyPage> },
      { path: 'school/profile', element: <LazyPage><SchoolProfilePage /></LazyPage> },
      { path: 'school/sessions', element: <LazyPage><SchoolSessionPage /></LazyPage> },
      { path: 'school/branches', element: <LazyPage><SchoolBranchPage /></LazyPage> },
      { path: 'school/departments', element: <LazyPage><SchoolProfilePage /></LazyPage> },
    ],
  },
  {
    element: <PublicRoute><AuthLayout /></PublicRoute>,
    children: [
      { path: '/login', element: <LazyPage><LoginPage /></LazyPage> },
      { path: '/forgot-password', element: <LazyPage><ForgotPasswordPage /></LazyPage> },
    ],
  },
]);
