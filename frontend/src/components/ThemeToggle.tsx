import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/utils/cn';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const options = [
    { value: 'light' as const, icon: Sun },
    { value: 'dark' as const, icon: Moon },
    { value: 'system' as const, icon: Monitor },
  ];

  return (
    <div className="flex rounded-lg border border-[var(--border)] p-1">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            theme === value ? 'bg-primary-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
