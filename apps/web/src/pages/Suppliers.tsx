import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/useAuth';
import {
  Button,
  Card,
  CardContent,
  Modal,
  Input,
  Select,
  Badge,
  TableActionButton,
} from '../components/ui';

interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string | null;
  phone: string | null;
  location: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default function Suppliers() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Supplier | null>(null);
  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    location: '',
    status: 'ACTIVE',
  });
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.get<Supplier[]>('/suppliers'),
  });
  const suppliers = data?.data ?? [];

  const create = useMutation({
    mutationFn: (body: typeof form) => api.post<Supplier>('/suppliers', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setModalOpen(false);
      resetForm();
    },
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<typeof form> }) =>
      api.put<Supplier>(`/suppliers/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setModalOpen(false);
      setEditing(null);
      resetForm();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setDeleteConfirm(null);
    },
  });

  function resetForm() {
    setForm({
      companyName: '',
      contactPerson: '',
      phone: '',
      location: '',
      status: 'ACTIVE',
    });
  }

  function openEdit(s: Supplier) {
    setEditing(s);
    setForm({
      companyName: s.companyName,
      contactPerson: s.contactPerson ?? '',
      phone: s.phone ?? '',
      location: s.location ?? '',
      status: s.status,
    });
    setModalOpen(true);
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      update.mutate({ id: editing.id, body: form });
    } else {
      create.mutate(form);
    }
  }

  return (
    <div className="page-container space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-semibold text-app-primary">{t('suppliers.title')}</h1>
        {isAdmin && (
          <Button onClick={openCreate} className="w-full sm:w-auto min-h-[48px]">{t('suppliers.addSupplier')}</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {suppliers.map((s) => (
          <Card key={s.id} className="p-0">
            <CardContent className="flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-app-primary truncate">{s.companyName}</h3>
                  <p className="text-app-secondary text-sm mt-0.5">{s.contactPerson || '—'}</p>
                  <p className="text-app-muted text-sm">{s.phone || '—'}</p>
                  <div className="mt-2">
                    <Badge variant={s.status === 'ACTIVE' ? 'success' : 'default'}>
                      {s.status === 'ACTIVE' ? t('status.active') : t('status.inactive')}
                    </Badge>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 shrink-0">
                    <TableActionButton onClick={() => openEdit(s)} aria-label={t('common.edit')}>
                      <span className="text-app-gold"><IconEdit /></span>
                    </TableActionButton>
                    <TableActionButton onClick={() => setDeleteConfirm(s)} aria-label={t('common.delete')}>
                      <span className="text-app-danger"><IconTrash /></span>
                    </TableActionButton>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdmin && (
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? t('suppliers.editSupplier') : t('suppliers.addSupplier')}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalOpen(false); setEditing(null); }} className="flex-1 sm:flex-initial min-h-[48px]">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              form="supplier-form"
              disabled={create.isPending || update.isPending}
              className="flex-1 sm:flex-initial min-h-[48px] w-full sm:w-auto"
            >
              {editing ? t('common.update') : t('common.create')}
            </Button>
          </>
        }
      >
        <form id="supplier-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app-secondary mb-1.5">{t('suppliers.companyName')} *</label>
            <Input
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app-secondary mb-1.5">{t('suppliers.contactPerson')}</label>
            <Input
              value={form.contactPerson}
              onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app-secondary mb-1.5">{t('suppliers.phone')}</label>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app-secondary mb-1.5">{t('suppliers.location')}</label>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          {editing && (
            <div>
              <label className="block text-sm font-medium text-app-secondary mb-1.5">{t('common.status')}</label>
              <Select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="ACTIVE">{t('status.active')}</option>
                <option value="INACTIVE">{t('status.inactive')}</option>
              </Select>
            </div>
          )}
        </form>
      </Modal>
      )}

      {isAdmin && (
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={t('suppliers.deleteSupplier')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1 sm:flex-initial min-h-[48px]">{t('common.cancel')}</Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirm && remove.mutate(deleteConfirm.id)}
              className="flex-1 sm:flex-initial min-h-[48px] w-full sm:w-auto"
            >
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <p className="text-app-secondary">
          {t('suppliers.deleteConfirm', { name: deleteConfirm?.companyName ?? '' })}
        </p>
      </Modal>
      )}
    </div>
  );
}
