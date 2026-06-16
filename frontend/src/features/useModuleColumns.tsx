import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// 1. Update your configuration interface so TypeScript knows about types and options
interface FieldConfig {
    key: string;
    label: string;
    table?: boolean;
    type?: string;
    options?: Array<{ value: string | number; label: string }>;
}

interface UseModuleColumnsProps<T> {
    fields: FieldConfig[];
    idKey: string;
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
}

export function useModuleColumns<T extends Record<string, unknown>>({
    fields,
    idKey,
    onEdit,
    onDelete,
}: UseModuleColumnsProps<T>) {
    return useMemo<ColumnDef<T, unknown>[]>(() => {
        const fieldColumns: ColumnDef<T, unknown>[] = fields
            .filter((f) => f.table !== false)
            .map((f) => ({
                // Keep the key pointing to the raw data property (e.g., 'sessionId')
                accessorKey: f.key,
                header: f.label,
                cell: (info) => {
                    let val = info.getValue();

                    // 2. If it's a select field, swap the raw value (ID) with the display label
                    if (f.type === 'select' && f.options) {
                        const matchedOption = f.options.find(opt => opt.value === val);
                        if (matchedOption) {
                            val = matchedOption.label;
                        }
                    }

                    console.log(`Rendering cell for field "${f.key}" with value:`, val);

                    return (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {val !== undefined && val !== null && val !== '' ? String(val) : (
                                <span className="text-slate-400 italic text-xs flex items-center gap-1">
                                    <Info className="h-3 w-3" /> empty
                                </span>
                            )}
                        </span>
                    );
                },
            }));

        const actionColumn: ColumnDef<T, unknown> = {
            id: 'actions',
            header: () => <span className="text-right block pr-4">Actions</span>,
            cell: (info) => (
                <div className="flex items-center justify-end gap-1.5 pr-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        onClick={() => onEdit(info.row.original)}
                        title="Edit Item"
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => onDelete(String(info.row.original[idKey]))}
                        title="Delete Item"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        };

        return [...fieldColumns, actionColumn];
    }, [fields, idKey, onEdit, onDelete]);
}