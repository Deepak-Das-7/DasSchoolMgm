import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-primary-600 p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-lg font-bold">SE</div>
            <span className="text-xl font-semibold">School ERP</span>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="mb-4 text-4xl font-bold leading-tight">
            Manage your school<br />with confidence
          </h1>
          <p className="text-lg text-white/80">
            Enterprise-grade school management platform for modern institutions.
          </p>
        </motion.div>
        <p className="text-sm text-white/60">&copy; {new Date().getFullYear()} School ERP. All rights reserved.</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
