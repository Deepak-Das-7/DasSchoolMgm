import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Check, X } from 'lucide-react';
import { api } from '@/services/api';
import { DataTable } from '@/components/DataTable';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useNotificationStore } from '@/stores/notificationStore';
import { useDebounce } from '@/hooks/useDebounce';

// Sub-components
import { useModuleColumns } from './useModuleColumns';
import { ModuleFormGrid } from './ModuleFormGrid';

interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; totalPages: number; total: number };
}

interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  table?: boolean;
  placeholder?: string;
  colSpan?: 1 | 2 | 3;
}

interface ModuleListPageProps<T extends Record<string, unknown>> {
  title: string;
  description: string;
  endpoint: string;
  fields: FieldConfig[];
  idKey?: string;
}

export function ModuleListPage<T extends Record<string, unknown>>({
  title,
  description,
  endpoint,
  fields,
  idKey = 'id',
}: ModuleListPageProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const { addToast } = useNotificationStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get<PaginatedResponse<T>>(endpoint, {
        page,
        limit: 15,
        search: debouncedSearch || undefined,
      });
      setData(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, debouncedSearch, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({});
    setModalOpen(true);
  };

  const openEdit = useCallback((item: T) => {
    setEditing(item);
    const formData: Record<string, any> = {};

    fields.forEach((f) => {
      let val = item[f.key];
      if (f.type === 'date' && val) {
        const dateObj = new Date(String(val));
        if (!isNaN(dateObj.getTime())) {
          val = dateObj.toISOString().split('T')[0];
        }
      }
      formData[f.key] = val ?? '';
    });

    setForm(formData);
    setModalOpen(true);
  }, [fields]);

  const handleFormFieldChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const columns = useModuleColumns({
    fields,
    idKey,
    onEdit: openEdit,
    onDelete: setDeleteId,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      fields.forEach((f) => {
        const val = form[f.key];
        if (val !== undefined && val !== '') {
          body[f.key] = f.type === 'number' ? Number(val) : val;
        }
      });

      if (editing) {
        await api.put(`${endpoint}/${editing[idKey]}`, body);
        addToast('success', 'Updated successfully');
      } else {
        await api.post(endpoint, body);
        addToast('success', 'Created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`${endpoint}/${deleteId}`);
      addToast('success', 'Deleted successfully');
      setDeleteId(null);
      fetchData();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-4 mx-auto px-4 py-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <SearchBar value={search} onChange={handleSearchChange} className="max-w-md w-full shadow-sm" placeholder="Search records..." />
          <Button onClick={openCreate} className="shadow-sm inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors w-full">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add New Record</span>
          </Button>
        </div>
      </div>

      {/* Main Table Layout */}
      <DataTable data={data} columns={columns} isLoading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Input Modal System */}
      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editing ? `Update ${title}` : `Create New ${title}`}>
        <ModuleFormGrid fields={fields} form={form} onChange={handleFormFieldChange} disabled={saving} />

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving} className="gap-2 border border-slate-200 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Check className="h-4 w-4" /> {editing ? 'Update Changes' : 'Save Record'}</>
            )}
          </Button>
        </div>
      </Modal>

      {/* Delete Dialog warning system */}
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Confirm Destruction" message="Are you completely sure you want to drop this record? This continuous sync modification strategy cannot be rolled back safely." confirmLabel="Delete Permanently" />
    </div>
  );
}