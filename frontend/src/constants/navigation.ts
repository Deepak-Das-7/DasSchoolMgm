import {
  LayoutDashboard, Users, GraduationCap, UserCheck, BookOpen, Calendar,
  ClipboardList, DollarSign, Library, Bus, Building, Package, Wallet,
  MessageSquare, CalendarDays, BarChart3, Settings, School, Clock,
  FileText, Heart,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  permission?: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard:read' },
  {
    label: 'School Setup', path: '/school', icon: School, permission: 'school:read',
    children: [
      { label: 'Profile', path: '/school/profile', icon: School },
      { label: 'Sessions', path: '/school/sessions', icon: Calendar },
      { label: 'Branches', path: '/school/branches', icon: Building },
      { label: 'Departments', path: '/school/departments', icon: Building },
    ],
  },
  { label: 'Students', path: '/students', icon: GraduationCap, permission: 'students:read' },
  { label: 'Parents', path: '/parents', icon: Heart, permission: 'parents:read' },
  { label: 'Teachers', path: '/teachers', icon: UserCheck, permission: 'teachers:read' },
  { label: 'Employees', path: '/employees', icon: Users, permission: 'employees:read' },
  { label: 'Attendance', path: '/attendance', icon: ClipboardList, permission: 'attendance:read' },
  {
    label: 'Academics', path: '/academics', icon: BookOpen, permission: 'academics:read',
    children: [
      { label: 'Classes', path: '/academics/classes', icon: BookOpen },
      { label: 'Sections', path: '/academics/sections', icon: BookOpen },
      { label: 'Subjects', path: '/academics/subjects', icon: BookOpen },
      { label: 'Syllabus', path: '/academics/syllabus', icon: FileText },
      { label: 'Lesson Plans', path: '/academics/lesson-plans', icon: FileText },
    ],
  },
  { label: 'Timetable', path: '/timetable', icon: Clock, permission: 'timetable:read' },
  { label: 'Examinations', path: '/exams', icon: FileText, permission: 'exams:read' },
  { label: 'Fees', path: '/fees', icon: DollarSign, permission: 'fees:read' },
  { label: 'Library', path: '/library', icon: Library, permission: 'library:read' },
  { label: 'Transport', path: '/transport', icon: Bus, permission: 'transport:read' },
  { label: 'Hostel', path: '/hostel', icon: Building, permission: 'hostel:read' },
  { label: 'Inventory', path: '/inventory', icon: Package, permission: 'inventory:read' },
  { label: 'Payroll', path: '/payroll', icon: Wallet, permission: 'payroll:read' },
  { label: 'Communication', path: '/communication', icon: MessageSquare, permission: 'communication:read' },
  { label: 'Events', path: '/events', icon: CalendarDays, permission: 'events:read' },
  { label: 'Reports', path: '/reports', icon: BarChart3, permission: 'reports:read' },
  { label: 'Settings', path: '/settings', icon: Settings, permission: 'settings:read' },
];
