import { useState, useEffect, useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { api } from '@/services/api';
import { DataTable } from '@/components/DataTable';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useNotificationStore } from '@/stores/notificationStore';
import { useDebounce } from '@/hooks/useDebounce';

interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; totalPages: number; total: number };
}

interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date' | 'select';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  table?: boolean;
}

interface ModuleListPageProps<T extends Record<string, unknown>> {
  title: string;
  description: string;
  endpoint: string;
  fields: FieldConfig[];
  idKey?: string;
}

export function ModuleListPage<T extends Record<string, unknown>>({
  title, description, endpoint, fields, idKey = 'id',
}: ModuleListPageProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const { addToast } = useNotificationStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get<PaginatedResponse<T>>(endpoint, { page, limit: 20, search: debouncedSearch || undefined });
      setData(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, debouncedSearch, addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = useMemo<ColumnDef<T, unknown>[]>(() => {
    const fieldColumns: ColumnDef<T, unknown>[] = fields.filter((f) => f.table !== false).map((f) => ({
      accessorKey: f.key,
      header: f.label,
      cell: (info) => String(info.getValue() ?? '-'),
    }));

    const actionColumn: ColumnDef<T, unknown> = {
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(info.row.original); }}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteId(String(info.row.original[idKey])); }}>Delete</Button>
        </div>
      ),
    };

    return [...fieldColumns, actionColumn];
  }, [fields, idKey]);

  const openCreate = () => {
    setEditing(null);
    setForm({});
    setModalOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    const formData: Record<string, string> = {};
    fields.forEach((f) => { formData[f.key] = String(item[f.key] ?? ''); });
    setForm(formData);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      fields.forEach((f) => {
        const val = form[f.key];
        if (val) body[f.key] = f.type === 'number' ? Number(val) : val;
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add New</Button>
      </div>

      <SearchBar value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />

      <DataTable data={data} columns={columns} isLoading={loading} />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${title}` : `Add ${title}`}>
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">{f.label}</label>
              {f.type === 'select' ? (
                <select
                  className="input-field"
                  value={form[f.key] || ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                >
                  <option value="">Select...</option>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  type={f.type || 'text'}
                  className="input-field"
                  value={form[f.key] || ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
