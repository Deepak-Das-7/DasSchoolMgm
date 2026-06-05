import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, School, SchoolStatus } from './models/index';
import { UserRole, ROLE_PERMISSIONS } from '../shared/constants/roles';
import { hashPassword } from '../utils/password';
import { Types } from 'mongoose';

async function seed() {
  await connectDatabase();

  const existingSuperAdmin = await User.findOne({ role: UserRole.SUPER_ADMIN, isDeleted: false });
  if (existingSuperAdmin) {
    console.log('Super admin already exists:', existingSuperAdmin.email);
    await disconnectDatabase();
    return;
  }

  const superAdmin = await User.create({
    email: 'superadmin@schoolerp.com',
    password: await hashPassword('SuperAdmin@123'),
    role: UserRole.SUPER_ADMIN,
    permissions: ROLE_PERMISSIONS[UserRole.SUPER_ADMIN],
    profile: { firstName: 'Super', lastName: 'Admin', phone: '+910000000000' },
    schoolId: null,
    isActive: true,
    refreshTokens: [],
    loginHistory: [],
    createdBy: new Types.ObjectId(),
    updatedBy: new Types.ObjectId(),
  });

  const demoSchool = await School.create({
    name: 'Demo International School',
    code: 'DIS001',
    email: 'admin@demoschool.edu',
    phone: '+911234567890',
    address: { street: '123 Education Lane', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001' },
    subscription: { plan: 'enterprise', status: 'active', startDate: new Date(), endDate: new Date(Date.now() + 365 * 86400000) },
    branding: { logo: '', primaryColor: '#4F46E5', secondaryColor: '#7C3AED', tagline: 'Excellence in Education' },
    domain: 'demo.schoolerp.local',
    settings: { timezone: 'Asia/Kolkata', dateFormat: 'DD/MM/YYYY', currency: 'INR', language: 'en' },
    status: SchoolStatus.ACTIVE,
    createdBy: superAdmin._id,
    updatedBy: superAdmin._id,
  });

  const schoolAdmin = await User.create({
    email: 'admin@demoschool.edu',
    password: await hashPassword('SchoolAdmin@123'),
    role: UserRole.SCHOOL_ADMIN,
    permissions: ROLE_PERMISSIONS[UserRole.SCHOOL_ADMIN],
    profile: { firstName: 'School', lastName: 'Admin', phone: '+911234567890' },
    schoolId: demoSchool._id,
    isActive: true,
    refreshTokens: [],
    loginHistory: [],
    createdBy: superAdmin._id,
    updatedBy: superAdmin._id,
  });

  console.log('Seed completed successfully!');
  console.log('Super Admin: superadmin@schoolerp.com / SuperAdmin@123');
  console.log('School Admin: admin@demoschool.edu / SchoolAdmin@123');
  console.log('Demo School ID:', demoSchool._id.toString());

  await disconnectDatabase();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
