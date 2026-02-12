import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReconciliation, useAddReconciliationItems, useConfirmReconciliation } from '../../hooks/useReconciliations';
import { FileCheck, ArrowLeft, Plus, CheckCircle, AlertTriangle, XCircle, Package } from 'lucide-react';
import type { AddReconciliationItemInput, ReconciliationItem } from '../../types/reconciliation';

export default function ReconciliationDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, refetch } = useReconciliation(Number(id));
    const addItems = useAddReconciliationItems();
    const confirmRecon = useConfirmReconciliation();

    const recon = data?.data;
    const items: ReconciliationItem[] = recon?.items || [];

    const [showAddForm, setShowAddForm] = useState(false);
    const [newItems, setNewItems] = useState<AddReconciliationItemInput[]>([
        { tracking_number: '', carrier_status: 'delivered', cod_amount: 0, shipping_fee: 0, actual_received: 0 },
    ]);

    const handleAddItems = async () => {
        const validItems = newItems.filter(i => i.tracking_number.trim());
        if (validItems.length === 0) return;

        try {
            await addItems.mutateAsync({ id: Number(id), items: validItems });
            setShowAddForm(false);
            setNewItems([{ tracking_number: '', carrier_status: 'delivered', cod_amount: 0, shipping_fee: 0, actual_received: 0 }]);
            refetch();
        } catch (err: any) {
            alert(err?.response?.data?.error || 'Error adding items');
        }
    };

    const handleConfirm = async () => {
        if (confirm('Confirm this reconciliation? This cannot be undone.')) {
            await confirmRecon.mutateAsync(Number(id));
            refetch();
        }
    };

    const addRow = () => {
        setNewItems([...newItems, { tracking_number: '', carrier_status: 'delivered', cod_amount: 0, shipping_fee: 0, actual_received: 0 }]);
    };

    const updateRow = (index: number, field: string, value: any) => {
        const updated = [...newItems];
        (updated[index] as any)[field] = value;
        setNewItems(updated);
    };

    const removeRow = (index: number) => {
        if (newItems.length <= 1) return;
        setNewItems(newItems.filter((_, i) => i !== index));
    };

    const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    const matchStatusIcon = (status: string) => {
        switch (status) {
            case 'matched': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'discrepancy': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'unmatched': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Package className="w-4 h-4 text-gray-400" />;
        }
    };

    const matchStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            matched: 'bg-green-50 text-green-700 border-green-200',
            discrepancy: 'bg-amber-50 text-amber-700 border-amber-200',
            unmatched: 'bg-red-50 text-red-700 border-red-200',
            pending: 'bg-gray-50 text-gray-700 border-gray-200',
        };
        return colors[status] || colors.pending;
    };

    const statusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-700',
            processing: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            confirmed: 'bg-purple-100 text-purple-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!recon) return <div className="p-8 text-center text-red-500">Reconciliation not found</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/reconciliations')} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <FileCheck className="w-8 h-8 text-purple-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{recon.reconciliation_number}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                                {recon.carrier_code} - {recon.carrier_name}
                            </span>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(recon.status)}`}>
                                {recon.status}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {recon.status !== 'confirmed' && (
                        <>
                            <button onClick={() => setShowAddForm(!showAddForm)} className="btn flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Items
                            </button>
                            <button onClick={handleConfirm} className="btn btn-primary flex items-center gap-2"
                                disabled={confirmRecon.isPending || items.length === 0}>
                                <CheckCircle className="w-4 h-4" /> Confirm
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="card p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase">Total Orders</p>
                    <p className="text-2xl font-bold">{recon.total_orders}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase">Matched</p>
                    <p className="text-2xl font-bold text-green-600">{recon.total_matched}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase">Discrepancy</p>
                    <p className="text-2xl font-bold text-amber-600">{recon.total_discrepancy}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase">COD Total</p>
                    <p className="text-lg font-bold">{formatCurrency(recon.total_cod_actual)}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase">Shipping Fee</p>
                    <p className="text-lg font-bold">{formatCurrency(recon.total_shipping_fee)}</p>
                </div>
            </div>

            {/* Add Items Form */}
            {showAddForm && recon.status !== 'confirmed' && (
                <div className="card p-6 border-2 border-dashed border-purple-200">
                    <h3 className="text-lg font-semibold mb-4">Add Reconciliation Items</h3>
                    <div className="space-y-3">
                        {newItems.map((item, i) => (
                            <div key={i} className="grid grid-cols-6 gap-2 items-end">
                                <div>
                                    <label className="text-xs text-gray-500">Tracking Number</label>
                                    <input type="text" className="input w-full text-sm" placeholder="VN123456789"
                                        value={item.tracking_number} onChange={(e) => updateRow(i, 'tracking_number', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Status</label>
                                    <select className="input w-full text-sm"
                                        value={item.carrier_status} onChange={(e) => updateRow(i, 'carrier_status', e.target.value)}>
                                        <option value="delivered">Delivered</option>
                                        <option value="returned">Returned</option>
                                        <option value="in_transit">In Transit</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">COD Amount</label>
                                    <input type="number" className="input w-full text-sm" step="1000"
                                        value={item.cod_amount} onChange={(e) => updateRow(i, 'cod_amount', Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Shipping Fee</label>
                                    <input type="number" className="input w-full text-sm" step="1000"
                                        value={item.shipping_fee} onChange={(e) => updateRow(i, 'shipping_fee', Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Actual Received</label>
                                    <input type="number" className="input w-full text-sm" step="1000"
                                        value={item.actual_received} onChange={(e) => updateRow(i, 'actual_received', Number(e.target.value))} />
                                </div>
                                <button type="button" onClick={() => removeRow(i)} className="btn text-red-500 text-sm h-9">×</button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4">
                        <button type="button" onClick={addRow} className="btn text-sm flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add Row
                        </button>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setShowAddForm(false)} className="btn text-sm">Cancel</button>
                            <button type="button" onClick={handleAddItems} disabled={addItems.isPending} className="btn btn-primary text-sm">
                                {addItems.isPending ? 'Processing...' : 'Submit Items'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Items Table */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold">Reconciliation Items ({items.length})</h3>
                </div>
                {items.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No items yet. Click "Add Items" to start.</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tracking</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DO Number</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Match</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">COD</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ship Fee</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Received</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Diff</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-sm">{item.tracking_number}</td>
                                    <td className="px-4 py-3 text-sm">{item.do_number || '—'}</td>
                                    <td className="px-4 py-3 text-sm">{item.customer_name || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{item.carrier_status || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${matchStatusColor(item.match_status)}`}>
                                            {matchStatusIcon(item.match_status)}
                                            {item.match_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(item.cod_amount)}</td>
                                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(item.shipping_fee)}</td>
                                    <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(item.actual_received)}</td>
                                    <td className={`px-4 py-3 text-right text-sm font-medium ${item.discrepancy_amount > 0 ? 'text-green-600' : item.discrepancy_amount < 0 ? 'text-red-600' : ''}`}>
                                        {item.discrepancy_amount !== 0 ? formatCurrency(item.discrepancy_amount) : '—'}
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
