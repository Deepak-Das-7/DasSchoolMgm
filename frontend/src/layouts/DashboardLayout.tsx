import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, Menu, X, Bell } from 'lucide-react';
import { navigation, NavItem } from '@/constants/navigation';
import { useAuthStore } from '@/stores/authStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/utils/cn';
import { useNotificationStore } from '@/stores/notificationStore';

function NavLinkItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
            </>
          )}
        </button>
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden pl-8">
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) =>
                    cn('block rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive ? 'bg-primary-600/10 text-primary-600 font-medium' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )
                  }
                >
                  {child.label}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
          isActive ? 'bg-primary-600/10 text-primary-600 font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { toasts, removeToast } = useNotificationStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)] transition-all duration-300 lg:static',
        sidebarOpen ? 'w-64' : 'w-16',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex h-16 items-center gap-3 border-b border-[var(--border)] px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">SE</div>
          {sidebarOpen && <span className="font-semibold">School ERP</span>}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navigation.map((item) => (
            <NavLinkItem key={item.path} item={item} collapsed={!sidebarOpen} />
          ))}
        </nav>
        <div className="border-t border-[var(--border)] p-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 px-4 backdrop-blur-lg lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 hover:bg-[var(--bg-tertiary)] lg:hidden">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden rounded-lg p-2 hover:bg-[var(--bg-tertiary)] lg:block">
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative rounded-lg p-2 hover:bg-[var(--bg-tertiary)]">
              <Bell className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{user?.profile.firstName} {user?.profile.lastName}</p>
                <p className="text-xs text-[var(--text-secondary)] capitalize">{user?.role.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-medium text-white">
                {user?.profile.firstName?.[0]}{user?.profile.lastName?.[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={cn(
                'rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg',
                toast.type === 'success' && 'bg-green-600',
                toast.type === 'error' && 'bg-red-600',
                toast.type === 'warning' && 'bg-amber-500',
                toast.type === 'info' && 'bg-primary-600'
              )}
              onClick={() => removeToast(toast.id)}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
