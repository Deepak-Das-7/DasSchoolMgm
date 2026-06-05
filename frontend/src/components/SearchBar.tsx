import { Search } from 'lucide-react';
import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function SearchBar({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
      <input className="input-field pl-10" placeholder="Search..." {...props} />
    </div>
  );
}
