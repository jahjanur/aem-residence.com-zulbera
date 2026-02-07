import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Input,
  Select,
  Textarea,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableActionButton,
} from '../components/ui';
import { formatMKD } from '../lib/formatMKD';
import { useAuth } from '../lib/useAuth';
import { useToast } from '../context/ToastContext';

interface Supplier {
  id: string;
  companyName: string;
  status: string;
}
interface Product {
  id: string;
  name: string;
  category: string;
  measurementUnit: string;
  price: number | string;
  status: string;
}
interface OrderItemRow {
  productId: string | null;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}
interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  supplierName: string;
  totalAmount: number | string;
  status: string;
  orderItems: Array<{ id: string; name: string; unit: string; price: number | string; quantity: number }>;
}

const DEBOUNCE_MS = 300;

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

export default function CreateOrder() {
  const [supplierId, setSupplierId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<OrderItemRow[]>([]);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchInput.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: suppliersData } = useQuery({ queryKey: ['suppliers'], queryFn: () => api.get<Supplier[]>('/suppliers') });
  const { data: recentData } = useQuery({
    queryKey: ['products', 'recent'],
    queryFn: () => api.get<Product[]>('/products/recent?limit=5&mode=created'),
  });
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['products', 'search', debouncedQ],
    queryFn: () => api.get<Product[]>(`/products/search?q=${encodeURIComponent(debouncedQ)}&limit=20`),
    enabled: debouncedQ.length >= 2,
  });

  const suppliers = (suppliersData?.data ?? []).filter((s) => s.status === 'ACTIVE');
  const recentProducts = recentData?.data ?? [];
  const searchResults = searchData?.data ?? [];

  const createOrder = useMutation({
    mutationFn: (body: { supplierId: string; orderDate: string; items: OrderItemRow[]; notes?: string }) =>
      api.post<Order>('/orders', body),
    onSuccess: (res) => {
      if (res.data) {
        setCreatedOrder(res.data);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['products', 'recent'] });
        queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
      }
    },
  });

  const total = useMemo(() => rows.reduce((s, r) => s + r.price * r.quantity, 0), [rows]);

  const canSubmit = supplierId && rows.length > 0 && !createOrder.isPending;

  function addProduct(p: Product) {
    const unit = p.measurementUnit ?? (p as unknown as { unit?: string }).unit ?? 'adet';
    setRows((prev) => {
      const existing = prev.find((r) => r.productId === p.id);
      if (existing) {
        return prev.map((r) =>
          r.productId === p.id ? { ...r, quantity: r.quantity + 1 } : r
        );
      }
      return [...prev, { productId: p.id, name: p.name, unit, price: Number(p.price), quantity: 1 }];
    });
    setSearchInput('');
    setSearchOpen(false);
  }

  function updateRow(index: number, field: 'quantity', value: number) {
    setRows((prev) =>
      prev.map((r, i) => (i !== index ? r : { ...r, [field]: Math.max(0, value) }))
    );
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const orderDateStr = orderDate.includes('T') ? orderDate : `${orderDate}T12:00:00.000Z`;
    createOrder.mutate({ supplierId, orderDate: orderDateStr, items: rows, notes: notes || undefined });
  }

  function openPdf() {
    if (!createdOrder?.id) return;
    const base = import.meta.env.VITE_API_BASE ?? '/api';
    const url = `${base}/orders/${createdOrder.id}/pdf`;
    const pdfWindow = window.open('', '_blank');
    fetch(url, { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.text();
          let msg = t('createOrder.pdfError');
          try {
            const json = JSON.parse(body);
            if (json?.error) msg = json.error;
          } catch {
            if (body) msg = body.slice(0, 80);
          }
          throw new Error(msg);
        }
        return r.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        if (pdfWindow && !pdfWindow.closed) {
          pdfWindow.location.href = blobUrl;
        } else {
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `order-${createdOrder.orderNumber}.pdf`;
          a.click();
          URL.revokeObjectURL(blobUrl);
        }
      })
      .catch((err) => {
        if (pdfWindow && !pdfWindow.closed) pdfWindow.close();
        toast.show(err instanceof Error ? err.message : t('createOrder.pdfError'));
      });
  }

  if (!isAdmin) {
    return (
      <div className="page-container space-y-4 md:space-y-6">
        <h1 className="text-xl md:text-2xl font-semibold text-app-primary">{t('createOrder.title')}</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-app-secondary">{t('createOrder.viewerNoCreate')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`page-container space-y-4 md:space-y-6 md:pb-0 ${rows.length > 0 ? 'pb-52' : 'pb-24'}`}>
      <h1 className="text-xl md:text-2xl font-semibold text-app-primary">{t('createOrder.title')}</h1>

      {createdOrder ? (
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-app-gold mb-2">{t('createOrder.orderCreated', { orderNumber: createdOrder.orderNumber })}</h2>
            <p className="text-app-secondary mb-4">
              {t('createOrder.supplierTotal', { supplier: createdOrder.supplierName, total: formatMKD(Number(createdOrder.totalAmount)) })}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={openPdf} className="w-full sm:w-auto min-h-[48px]">{t('createOrder.viewDownloadPdf')}</Button>
              <Button variant="secondary" onClick={() => { setCreatedOrder(null); setRows([]); setNotes(''); }} className="w-full sm:w-auto min-h-[48px]">
                {t('createOrder.createAnother')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <Card>
                  <CardContent>
                    <label className="block text-sm font-medium text-app-secondary mb-1.5">{t('createOrder.supplierRequired')}</label>
                    <Select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      required
                      className="min-h-[48px]"
                    >
                      <option value="">{t('createOrder.selectSupplier')}</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.companyName}</option>
                      ))}
                    </Select>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <label className="block text-sm font-medium text-app-secondary mb-1.5">{t('createOrder.orderDateRequired')}</label>
                    <Input
                      type="date"
                      value={orderDate.slice(0, 10)}
                      onChange={(e) => setOrderDate(e.target.value)}
                      required
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-app-primary">{t('createOrder.addProducts')}</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentProducts.length > 0 && (
                    <div className="sticky top-0 z-10 bg-app-surface-1 -mx-1 px-1 pt-1 pb-2">
                      <p className="text-xs font-medium text-app-muted mb-2">{t('createOrder.recentProducts')}</p>
                      <div className="flex flex-wrap gap-2">
                        {recentProducts.map((p) => (
                          <Button
                            key={p.id}
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => addProduct(p)}
                            className="!min-h-[44px] !py-2.5 !px-4 text-sm"
                          >
                            {p.name} ({(p as Product).measurementUnit ?? (p as unknown as { unit?: string }).unit ?? 'adet'})
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative" ref={searchRef}>
                    <label className="block text-xs font-medium text-app-muted mb-1.5">{t('createOrder.searchByNameOrCategory')}</label>
                    <Input
                      type="text"
                      placeholder={t('common.search')}
                      value={searchInput}
                      onChange={(e) => { setSearchInput(e.target.value); setSearchOpen(true); }}
                      onFocus={() => debouncedQ.length >= 2 && setSearchOpen(true)}
                      onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                      className="min-h-[48px]"
                    />
                    {searchOpen && debouncedQ.length >= 2 && (
                      <div className="absolute z-10 mt-1 w-full rounded-xl border border-[var(--border)] bg-app-surface-2 shadow-modal max-h-56 overflow-auto">
                        {searchLoading ? (
                          <div className="p-3 text-app-muted text-sm">{t('common.searching')}</div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-3 text-app-muted text-sm">{t('createOrder.noResults')}</div>
                        ) : (
                          <ul className="py-1">
                            {searchResults.map((p) => (
                              <li key={p.id}>
                                <button
                                  type="button"
                                  className="w-full text-left px-4 py-3 min-h-[48px] text-base text-app-primary hover:bg-white/10 flex justify-between items-center gap-2"
                                  onClick={() => addProduct(p)}
                                >
                                  <span className="truncate">{p.name} ({(p as Product).measurementUnit ?? (p as unknown as { unit?: string }).unit ?? 'adet'})</span>
                                  <span className="text-app-gold shrink-0">{formatMKD(Number(p.price))}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mobile: item cards */}
                  <div className="md:hidden space-y-3">
                    {rows.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-[var(--border)] bg-app-surface-2 p-4 flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-app-primary">{r.name}</p>
                            <p className="text-app-secondary text-sm">{r.unit} · {formatMKD(r.price)}</p>
                          </div>
                          <TableActionButton onClick={() => removeRow(i)} aria-label={t('createOrder.remove')}>
                            <span className="text-app-danger"><IconTrash /></span>
                          </TableActionButton>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-sm text-app-secondary">{t('createOrder.qty')}</label>
                          <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={r.quantity}
                            onChange={(e) => updateRow(i, 'quantity', parseInt(e.target.value, 10) || 0)}
                            className="w-20 rounded-xl border border-[var(--border)] bg-app-bg/50 px-3 py-2.5 text-right text-app-primary text-base min-h-[44px] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-app-gold/20 focus:outline-none"
                          />
                        </div>
                        <p className="text-app-gold font-semibold text-right">{t('createOrder.total')}: {formatMKD(r.price * r.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: table */}
                  <div className="hidden md:block overflow-x-auto rounded-lg border border-[var(--border)]">
                    <Table>
                      <TableHeader>
                        <TableHead>{t('createOrder.item')}</TableHead>
                        <TableHead>{t('createOrder.unit')}</TableHead>
                        <TableHead className="text-right">{t('products.price')}</TableHead>
                        <TableHead className="text-right">{t('createOrder.qty')}</TableHead>
                        <TableHead className="text-right">{t('createOrder.total')}</TableHead>
                        <TableHead className="w-12" />
                      </TableHeader>
                      <TableBody>
                        {rows.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-app-primary">{r.name}</TableCell>
                            <TableCell>{r.unit}</TableCell>
                            <TableCell className="text-right text-app-gold">{formatMKD(r.price)}</TableCell>
                            <TableCell className="text-right">
                              <input
                                type="number"
                                min={0}
                                inputMode="numeric"
                                value={r.quantity}
                                onChange={(e) => updateRow(i, 'quantity', parseInt(e.target.value, 10) || 0)}
                                className="w-16 rounded-lg border border-[var(--border)] bg-app-bg/50 px-2 py-1.5 text-right text-app-primary text-sm focus:border-app-border-focus focus:ring-2 focus:ring-app-gold/20 focus:outline-none min-h-[44px]"
                              />
                            </TableCell>
                            <TableCell className="text-right text-app-gold">{formatMKD(r.price * r.quantity)}</TableCell>
                            <TableCell>
                              <TableActionButton onClick={() => removeRow(i)} aria-label={t('createOrder.remove')}>
                                <span className="text-app-danger"><IconTrash /></span>
                              </TableActionButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <label className="block text-sm font-medium text-app-secondary mb-1.5">{t('createOrder.notes')}</label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="" />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              {/* Mobile: sticky summary bar above bottom nav (bottom nav is ~64px + safe area) */}
              {rows.length > 0 && (
                <div className="md:hidden fixed left-0 right-0 z-40 bg-app-surface-1 border-t border-[var(--border)] p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] bottom-20"
                >
                  <div className="page-container flex flex-col gap-3">
                    <div className="flex justify-between text-app-primary font-semibold text-base">
                      <span>{t('createOrder.total')}</span>
                      <span className="text-app-gold">{formatMKD(total)}</span>
                    </div>
                    <Button
                      type="submit"
                      className="w-full min-h-[48px]"
                      disabled={!canSubmit}
                    >
                      {createOrder.isPending ? t('common.loading') : t('createOrder.submitOrder')}
                    </Button>
                    {!supplierId && (
                      <p className="text-xs text-app-muted text-center">{t('createOrder.selectSupplierFirst')}</p>
                    )}
                  </div>
                </div>
              )}
              {/* Mobile: hint when no items yet */}
              {rows.length === 0 && (
                <p className="md:hidden text-app-muted text-sm text-center py-2">{t('createOrder.addFromRecentOrSearch')}</p>
              )}
              {/* Desktop: sidebar summary */}
              <Card className="lg:sticky lg:top-6 hidden md:block">
                <CardHeader>
                  <h3 className="text-sm font-semibold text-app-primary">{t('createOrder.title')}</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rows.length === 0 ? (
                    <p className="text-app-secondary text-sm">{t('createOrder.addFromRecentOrSearch')}</p>
                  ) : (
                    <>
                      <ul className="space-y-2 text-sm text-app-secondary">
                        {rows.map((r, i) => (
                          <li key={i} className="flex justify-between gap-2">
                            <span className="truncate">{r.name} × {r.quantity} {r.unit}</span>
                            <span className="text-app-gold shrink-0">{formatMKD(r.price * r.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-[var(--border)] pt-3 flex justify-between text-app-primary font-semibold">
                        <span>{t('createOrder.total')}</span>
                        <span className="text-app-gold">{formatMKD(total)}</span>
                      </div>
                      <Button
                        type="submit"
                        className="w-full min-h-[48px]"
                        disabled={!canSubmit}
                      >
                        {createOrder.isPending ? t('common.loading') : t('createOrder.submitOrder')}
                      </Button>
                      {rows.length === 0 || !supplierId ? (
                        <p className="text-xs text-app-muted text-center">{t('createOrder.addFromRecentOrSearch')}</p>
                      ) : null}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
