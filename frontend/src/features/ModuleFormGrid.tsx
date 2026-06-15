interface FieldConfig {
    key: string;
    label: string;
    type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'boolean';
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
    placeholder?: string;
    colSpan?: 1 | 2 | 3;
}

interface ModuleFormGridProps {
    fields: FieldConfig[];
    form: Record<string, any>;
    onChange: (key: string, value: any) => void;
    disabled: boolean;
}

export function ModuleFormGrid({ fields, form, onChange, disabled }: ModuleFormGridProps) {
    return (
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5 pt-2">
            {fields.map((f) => {
                let spanClass = "md:col-span-1";
                if (f.colSpan === 2) spanClass = "md:col-span-2";
                if (f.colSpan === 3) spanClass = "md:col-span-3";

                return (
                    <div key={f.key} className={`space-y-1.5 ${spanClass}`}>
                        {f.type === 'boolean' ? (
                            <div className="flex items-center gap-3 h-full pt-6">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {f.label} {f.required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:ring-offset-slate-800 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
                                    checked={Boolean(form[f.key])}
                                    onChange={(e) => onChange(f.key, e.target.checked)}
                                    disabled={disabled}
                                />
                            </div>
                        ) : (
                            <>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {f.label} {f.required && <span className="text-red-500">*</span>}
                                </label>

                                {f.type === 'select' ? (
                                    <div className="relative">
                                        <select
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 appearance-none"
                                            value={form[f.key] || ''}
                                            onChange={(e) => onChange(f.key, e.target.value)}
                                            disabled={disabled}
                                        >
                                            <option value="">Select options...</option>
                                            {f.options?.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                ) : f.type === 'date' ? (
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                        value={form[f.key] || ''}
                                        onChange={(e) => onChange(f.key, e.target.value)}
                                        disabled={disabled}
                                    />
                                ) : (
                                    <input
                                        type={f.type || 'text'}
                                        placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                        value={form[f.key] || ''}
                                        onChange={(e) => onChange(f.key, e.target.value)}
                                        disabled={disabled}
                                    />
                                )}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}