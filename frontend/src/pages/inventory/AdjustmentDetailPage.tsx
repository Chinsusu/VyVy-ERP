import { useNavigate, useParams } from 'react-router-dom';
import { useAdjustment, usePostAdjustment, useCancelAdjustment } from '../../hooks/useInventory';
import {
    ArrowLeft, Clock, CheckCircle2, XCircle,
    Printer, Send, Ban, Package, Warehouse,
    FileText, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { StockAdjustmentItem } from '../../types/inventory';

export default function AdjustmentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const adjustmentId = parseInt(id || '0');

    const { data: sa, isLoading, error } = useAdjustment(adjustmentId);
    const postMutation = usePostAdjustment();
    const cancelMutation = useCancelAdjustment();


    const handlePost = async () => {
        if (!window.confirm('Are you sure you want to post this adjustment? This will update stock levels.')) return;
        try {
            await postMutation.mutateAsync(adjustmentId);
            toast.success('Adjustment posted successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to post adjustment');
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this adjustment?')) return;
        try {
            await cancelMutation.mutateAsync(adjustmentId);
            toast.success('Adjustment cancelled');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to cancel adjustment');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'posted':
                return <span className="badge badge-success flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Posted</span>;
            case 'cancelled':
                return <span className="badge badge-error flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Cancelled</span>;
            case 'draft':
                return <span className="badge badge-warning flex items-center gap-1.5"><Clock className="w-4 h-4" /> Draft</span>;
            case 'approved':
                return <span className="badge badge-primary flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Approved</span>;
            default:
                return <span className="badge bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    if (error || !sa) return <div className="p-8 text-center text-red-500">Error loading adjustment data.</div>;

    return (
        <div className="animate-fade-in text-slate-900">

            <main className=" px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/inventory/adjustments')} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-gray-200 transition-all">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-slate-900">{sa.adjustment_number}</h1>
                                {getStatusBadge(sa.status)}
                            </div>
                            <p className="text-premium-sm text-gray-500">Created on {format(new Date(sa.created_at), 'MMMM dd, yyyy HH:mm')}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="btn btn-outline">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        {sa.status === 'draft' && (
                            <>
                                <button
                                    onClick={handlePost}
                                    disabled={postMutation.isPending}
                                    className="btn btn-primary"
                                >
                                    <Send className="w-4 h-4" />
                                    Post Adjustment
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelMutation.isPending}
                                    className="btn btn-outline text-red-600 hover:bg-red-50"
                                >
                                    <Ban className="w-4 h-4" />
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-6">
                            <h3 className="font-bold text-gray-400 uppercase text-premium-3xs tracking-widest flex items-center gap-2 border-b pb-2 mb-6">
                                <FileText className="w-3 h-3" /> General Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <p className="text-premium-3xs text-gray-500 mb-1 flex items-center gap-1.5 uppercase font-bold tracking-wider">
                                        <Warehouse className="w-3 h-3" /> Warehouse
                                    </p>
                                    <p className="font-medium text-sm">{sa.warehouse_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" /> Adjustment Date
                                    </p>
                                    <p className="font-medium">{format(new Date(sa.adjustment_date), 'MMMM dd, yyyy')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Adjustment Type</p>
                                    <p className="font-medium capitalize">{sa.adjustment_type.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Reason</p>
                                    <p className="font-medium">{sa.reason}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 italic">
                                        {sa.notes || 'No extra notes provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card p-0 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                                <Package className="w-4 h-4 text-gray-400" />
                                <h3 className="text-sm font-bold">Adjustment Items</h3>
                            </div>
                            <div className="table-container">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white text-gray-500 text-premium-3xs uppercase font-bold border-b">
                                            <th className="px-6 py-4">Item</th>
                                            <th className="px-6 py-4">Location</th>
                                            <th className="px-6 py-4 text-center">Prev Qty</th>
                                            <th className="px-6 py-4 text-center">Adj Qty</th>
                                            <th className="px-6 py-4 text-center">New Qty</th>
                                            <th className="px-6 py-4 text-right">Unit Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {sa.items.map((item: StockAdjustmentItem) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{item.item_name}</span>
                                                        <span className="text-xs text-gray-500">{item.item_code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {item.location_code || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-center">{item.previous_quantity}</td>
                                                <td className={`px-6 py-4 text-center font-medium ${item.adjustment_quantity > 0 ? 'text-green-600' : item.adjustment_quantity < 0 ? 'text-red-600' : ''}`}>
                                                    {item.adjustment_quantity > 0 ? `+${item.adjustment_quantity}` : item.adjustment_quantity}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold bg-blue-50/30">
                                                    {item.new_quantity}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {item.unit_cost.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Audit */}
                    <div className="space-y-6">
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-600" />
                                Status History
                            </h3>
                            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-gray-200">
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-primary-600 border-4 border-white shadow-sm ring-1 ring-primary-600/10"></div>
                                    <p className="text-sm font-semibold">Created</p>
                                    <p className="text-xs text-gray-500">{sa.created_by_name} • {format(new Date(sa.created_at), 'MMM dd, HH:mm')}</p>
                                </div>
                                {sa.approved_at && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm ring-1 ring-blue-500/10"></div>
                                        <p className="text-sm font-semibold">Approved</p>
                                        <p className="text-xs text-gray-500">{sa.approved_by_name} • {format(new Date(sa.approved_at), 'MMM dd, HH:mm')}</p>
                                    </div>
                                )}
                                {sa.is_posted && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm ring-1 ring-green-500/10"></div>
                                        <p className="text-sm font-semibold">Posted</p>
                                        <p className="text-xs text-gray-500">{sa.posted_by_name} • {format(new Date(sa.posted_at || sa.created_at), 'MMM dd, HH:mm')}</p>
                                    </div>
                                )}
                                {sa.status === 'cancelled' && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm ring-1 ring-red-500/10"></div>
                                        <p className="text-sm font-semibold">Cancelled</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card p-6 bg-primary-900 text-white">
                            <h3 className="text-lg font-bold mb-4">Need help?</h3>
                            <p className="text-sm text-primary-100 mb-6 leading-relaxed">
                                Stock adjustments are permanent once posted. Ensure you've verified physical counts before final submission.
                            </p>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded font-medium transition-colors">
                                View Guidelines
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
