export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',
  PRINCIPAL = 'principal',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  ACCOUNTANT = 'accountant',
  RECEPTIONIST = 'receptionist',
  LIBRARIAN = 'librarian',
  TRANSPORT_MANAGER = 'transport_manager',
  HOSTEL_MANAGER = 'hostel_manager',
  HR_MANAGER = 'hr_manager',
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.SCHOOL_ADMIN]: [
    'school:*', 'users:*', 'students:*', 'parents:*', 'teachers:*',
    'employees:*', 'attendance:*', 'academics:*', 'timetable:*',
    'exams:*', 'fees:*', 'library:*', 'transport:*', 'hostel:*',
    'inventory:*', 'payroll:*', 'communication:*', 'events:*',
    'reports:*', 'settings:*', 'dashboard:*',
  ],
  [UserRole.PRINCIPAL]: [
    'students:read', 'teachers:read', 'attendance:*', 'academics:*',
    'timetable:*', 'exams:*', 'reports:*', 'dashboard:read',
    'communication:*', 'events:*',
  ],
  [UserRole.TEACHER]: [
    'students:read', 'attendance:write', 'academics:read',
    'timetable:read', 'exams:write', 'communication:read',
  ],
  [UserRole.STUDENT]: [
    'students:read:own', 'attendance:read:own', 'exams:read:own',
    'fees:read:own', 'timetable:read', 'library:read:own',
    'communication:read',
  ],
  [UserRole.PARENT]: [
    'students:read:children', 'attendance:read:children',
    'exams:read:children', 'fees:read:children', 'fees:pay',
    'communication:read',
  ],
  [UserRole.ACCOUNTANT]: [
    'fees:*', 'payroll:*', 'inventory:read', 'reports:financial',
    'dashboard:read',
  ],
  [UserRole.RECEPTIONIST]: [
    'students:write', 'parents:write', 'admissions:*',
    'communication:read',
  ],
  [UserRole.LIBRARIAN]: [
    'library:*', 'students:read',
  ],
  [UserRole.TRANSPORT_MANAGER]: [
    'transport:*', 'students:read',
  ],
  [UserRole.HOSTEL_MANAGER]: [
    'hostel:*', 'students:read',
  ],
  [UserRole.HR_MANAGER]: [
    'employees:*', 'teachers:read', 'payroll:*', 'attendance:read',
  ],
};

export function hasPermission(userPermissions: string[], required: string): boolean {
  if (userPermissions.includes('*')) return true;

  const [resource, action] = required.split(':');
  const wildcardResource = `${resource}:*`;
  const wildcardAction = `*:${action}`;

  return (
    userPermissions.includes(required) ||
    userPermissions.includes(wildcardResource) ||
    userPermissions.includes(wildcardAction)
  );
}
