import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReconciliations } from '../../hooks/useReconciliations';
import { useCarriers } from '../../hooks/useCarriers';
import { FileCheck, Plus, Eye } from 'lucide-react';
import type { ShippingReconciliation, ReconciliationFilter } from '../../types/reconciliation';

export default function ReconciliationListPage() {
    const [filter, setFilter] = useState<ReconciliationFilter>({ limit: 20, offset: 0 });
    const { data, isLoading } = useReconciliations(filter);
    const { data: carriersData } = useCarriers({ is_active: true });

    const reconciliations: ShippingReconciliation[] = data?.data || [];
    const total = data?.total || 0;
    const carriers = carriersData?.data || [];

    const statusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-700',
            processing: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            confirmed: 'bg-purple-100 text-purple-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileCheck className="w-8 h-8 text-purple-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Shipping Reconciliation</h1>
                        <p className="text-sm text-gray-500">{total} reconciliation(s)</p>
                    </div>
                </div>
                <Link to="/reconciliations/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Reconciliation
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4 flex flex-wrap gap-4">
                <select className="input" value={filter.carrier_id || ''}
                    onChange={(e) => setFilter({ ...filter, carrier_id: e.target.value ? Number(e.target.value) : undefined, offset: 0 })}>
                    <option value="">All Carriers</option>
                    {carriers.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                </select>
                <select className="input" value={filter.status || ''}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined, offset: 0 })}>
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="confirmed">Confirmed</option>
                </select>
            </div>

            {/* Table */}
            <div className="table-container">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : reconciliations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No reconciliations found</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th>Number</th>
                                <th>Carrier</th>
                                <th>Period</th>
                                <th>Status</th>
                                <th className="text-right">Orders</th>
                                <th className="text-right">Matched</th>
                                <th className="text-right">Discrepancy</th>
                                <th className="text-right">COD</th>
                                <th className="text-right">Ship Fee</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {reconciliations.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-sm font-semibold">{r.reconciliation_number}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                                            {r.carrier_code || r.carrier_name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {r.period_start ? new Date(r.period_start).toLocaleDateString('vi-VN') : '—'}{' — '}
                                        {r.period_end ? new Date(r.period_end).toLocaleDateString('vi-VN') : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">{r.total_orders}</td>
                                    <td className="px-4 py-3 text-right text-sm text-green-600 font-medium">{r.total_matched}</td>
                                    <td className="px-4 py-3 text-right text-sm text-red-600 font-medium">{r.total_discrepancy}</td>
                                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(r.total_cod_actual)}</td>
                                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(r.total_shipping_fee)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Link to={`/reconciliations/${r.id}`} className="p-1.5 hover:bg-blue-50 rounded text-blue-600 inline-flex" title="View">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
