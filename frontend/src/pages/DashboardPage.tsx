import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, DollarSign, ClipboardCheck, BookOpen, Bus,
  TrendingUp, Activity,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  feeCollection: number;
  attendancePercent: number;
  avgExamScore: number;
  libraryUsage: number;
  hostelOccupancy: number;
}

const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B'];

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className={`rounded-lg p-3 ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [admissions, setAdmissions] = useState<Array<{ month: string; count: number }>>([]);
  const [revenue, setRevenue] = useState<Array<{ month: string; amount: number }>>([]);
  const [attendance, setAttendance] = useState<Array<{ week: string; percentage: number }>>([]);
  const [academic, setAcademic] = useState<Array<{ grade: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardStats>('/dashboard/stats'),
      api.get<Array<{ month: string; count: number }>>('/dashboard/charts/admissions'),
      api.get<Array<{ month: string; amount: number }>>('/dashboard/charts/revenue'),
      api.get<Array<{ week: string; percentage: number }>>('/dashboard/charts/attendance'),
      api.get<Array<{ grade: string; count: number }>>('/dashboard/charts/academic'),
    ]).then(([s, a, r, at, ac]) => {
      setStats(s);
      setAdmissions(a);
      setRevenue(r);
      setAttendance(at);
      setAcademic(ac);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)]">Overview of your school performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Total Students" value={stats?.totalStudents ?? 0} color="bg-primary-600" />
        <StatCard icon={Users} label="Total Teachers" value={stats?.totalTeachers ?? 0} color="bg-violet-600" />
        <StatCard icon={DollarSign} label="Fee Collection" value={`₹${(stats?.feeCollection ?? 0).toLocaleString()}`} color="bg-emerald-600" />
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${stats?.attendancePercent ?? 0}%`} color="bg-cyan-600" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString()}`} color="bg-amber-600" />
        <StatCard icon={Activity} label="Avg Exam Score" value={stats?.avgExamScore ?? 0} color="bg-rose-600" />
        <StatCard icon={BookOpen} label="Library Usage" value={stats?.libraryUsage ?? 0} color="bg-indigo-600" />
        <StatCard icon={Bus} label="Hostel Occupancy" value={stats?.hostelOccupancy ?? 0} color="bg-teal-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Admissions Trend</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={admissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="amount" fill="#7C3AED" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader><CardTitle>Attendance Trend</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={attendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="percentage" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader><CardTitle>Academic Performance</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={academic} dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={90} label>
                {academic.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
