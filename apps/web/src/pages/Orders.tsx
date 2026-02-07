import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import {
  Card,
  Button,
  Input,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Badge,
} from '../components/ui';
import { formatMKD } from '../lib/formatMKD';


interface OrderRow {
  id: string;
  orderNumber: string;
  orderDate: string;
  supplierName: string;
  status: string;
  totalAmount: number;
  hasReconciliation: boolean;
  orderItems?: Array<{ id: string; name: string; unit: string; price: number; quantity: number }>;
}

interface OrdersResponse {
  list: OrderRow[];
  summary: { totalSpendMkd: number; totalCount: number };
}

function statusTr(s: string, t: (key: string) => string): string {
  if (s === 'PENDING') return t('status.pending');
  if (s === 'DELIVERED') return t('status.delivered');
  if (s === 'RECONCILED') return t('status.reconciled');
  return s;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('tr-TR', { dateStyle: 'medium' });
}

export default function Orders() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'list', qs],
    queryFn: () => api.get<OrdersResponse>(`/orders${qs ? `?${qs}` : ''}`),
  });

  const response = data?.data;
  const orders = response && 'list' in response ? response.list : [];
  const summary = response && 'summary' in response ? response.summary : { totalSpendMkd: 0, totalCount: 0 };

  async function openPdf(orderId: string) {
    try {
      const blob = await api.blob(`/orders/${orderId}/pdf`);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
    } catch {
      // silent fail or toast
    }
  }

  return (
    <div className="page-container space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold text-app-primary">{t('orders.title')}</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <Card className="p-4">
          <p className="text-sm font-medium text-app-secondary">{t('orders.totalSpendMkd')}</p>
          <p className="text-2xl font-semibold text-app-gold mt-1">{formatMKD(Number(summary.totalSpendMkd))}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-app-secondary">{t('orders.orderCount')}</p>
          <p className="text-2xl font-semibold text-app-primary mt-1">{summary.totalCount}</p>
        </Card>
      </div>

      {/* Search & filters */}
      <Card className="p-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-app-secondary mb-1">{t('orders.searchOrders')}</label>
            <Input
              placeholder={t('orders.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="max-w-md"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-secondary mb-1">{t('orders.filterFrom')}</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-app-secondary mb-1">{t('orders.filterTo')}</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-app-secondary text-sm">{t('common.loading')}</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-app-secondary text-sm">{t('orders.noOrders')}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableHead>{t('orders.orderNumber')}</TableHead>
                <TableHead>{t('orders.supplier')}</TableHead>
                <TableHead>{t('orders.date')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('orders.total')}</TableHead>
                <TableHead>{t('orders.reconciliation')}</TableHead>
                <TableHead className="text-right">{t('orders.pdf')}</TableHead>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium text-app-primary">{o.orderNumber}</TableCell>
                    <TableCell className="text-app-secondary">{o.supplierName}</TableCell>
                    <TableCell className="text-app-secondary">{formatDate(o.orderDate)}</TableCell>
                    <TableCell>
                      <Badge variant={o.status === 'RECONCILED' ? 'success' : o.status === 'DELIVERED' ? 'default' : 'default'}>
                        {statusTr(o.status, t)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-app-gold font-medium">{formatMKD(Number(o.totalAmount))}</TableCell>
                    <TableCell>
                      {o.hasReconciliation ? (
                        <Badge variant="success">{t('orders.reconciled')}</Badge>
                      ) : (
                        <Badge variant="default">{t('orders.pending')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openPdf(o.id)}
                        className="min-h-[36px]"
                      >
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
