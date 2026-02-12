import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTransfer, usePostTransfer, useCancelTransfer } from '../../hooks/useInventory';
import { useAuthStore } from '../../stores/authStore';
import {
    ArrowLeft, Clock, CheckCircle2, XCircle,
    Printer, Send, Ban, Package, Warehouse,
    FileText, Calendar, User, Home, LogOut, ArrowRightLeft,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { StockTransferItem } from '../../types/inventory';

export default function TransferDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const transferId = parseInt(id || '0');

    const { data: st, isLoading, error } = useTransfer(transferId);
    const postMutation = usePostTransfer();
    const cancelMutation = useCancelTransfer();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handlePost = async () => {
        if (!window.confirm('Are you sure you want to post this transfer? This will deduct stock from source and add to destination.')) return;
        try {
            await postMutation.mutateAsync(transferId);
            toast.success('Transfer balances updated successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to post transfer');
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this transfer?')) return;
        try {
            await cancelMutation.mutateAsync(transferId);
            toast.success('Transfer cancelled');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to cancel transfer');
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
            case 'in_transit':
                return <span className="badge badge-primary flex items-center gap-1.5"><ArrowRightLeft className="w-4 h-4 animate-pulse" /> In Transit</span>;
            default:
                return <span className="badge bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    if (error || !st) return <div className="p-8 text-center text-red-500">Error loading transfer data.</div>;

    return (
        <div className="animate-fade-in text-slate-900">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className=" px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="text-gray-500 hover:text-primary-600 transition-colors">
                                <Home className="w-5 h-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-primary-600">Inventory & Stock</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-500" />
                                <div className="text-sm hidden sm:block">
                                    <p className="font-medium text-gray-900">{user?.full_name}</p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="btn-outline py-1.5">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className=" px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/inventory/transfers')} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-gray-200 transition-all">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900">{st.transfer_number}</h2>
                                {getStatusBadge(st.status)}
                            </div>
                            <p className="text-sm text-gray-500">Initiated on {format(new Date(st.created_at), 'MMMM dd, yyyy HH:mm')}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="btn-outline">
                            <Printer className="w-4 h-4" />
                            Print Label
                        </button>
                        {st.status === 'draft' && (
                            <>
                                <button
                                    onClick={handlePost}
                                    disabled={postMutation.isPending}
                                    className="btn-primary"
                                >
                                    <Send className="w-4 h-4" />
                                    Post Transfer
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelMutation.isPending}
                                    className="btn-outline text-red-600 hover:bg-red-50"
                                >
                                    <Ban className="w-4 h-4" />
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-6 border-t-4 border-t-primary-600">
                            <div className="flex items-center justify-between mb-8">
                                <div className="text-center flex-1">
                                    <p className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">SOURCE</p>
                                    <div className="bg-primary-50 p-4 rounded-xl inline-block mb-3">
                                        <Warehouse className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <p className="font-bold text-gray-900">{st.from_warehouse_name}</p>
                                </div>
                                <div className="flex flex-col items-center px-4">
                                    <div className="h-px bg-gray-200 w-16 sm:w-32 relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1">
                                            <ArrowRightLeft className="w-5 h-5 text-gray-300" />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center flex-1">
                                    <p className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">DESTINATION</p>
                                    <div className="bg-green-50 p-4 rounded-xl inline-block mb-3">
                                        <Warehouse className="w-8 h-8 text-green-600" />
                                    </div>
                                    <p className="font-bold text-gray-900">{st.to_warehouse_name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" /> Requested Date
                                    </p>
                                    <p className="font-medium">{format(new Date(st.transfer_date), 'MMMM dd, yyyy')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                                        <FileText className="w-4 h-4" /> Reference / Notes
                                    </p>
                                    <p className="font-medium">{st.notes || 'Inter-warehouse movement'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">Remarks</p>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md italic">
                                        {st.notes || 'No remarks provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary-600" />
                                <h3 className="text-lg font-semibold">Transfer Items</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Item</th>
                                            <th className="px-6 py-4">From Location</th>
                                            <th className="px-6 py-4">To Location</th>
                                            <th className="px-6 py-4 text-center">Quantity</th>
                                            <th className="px-6 py-4 text-right">Unit Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {st.items.map((item: StockTransferItem) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{item.item_name}</span>
                                                        <span className="text-xs text-gray-500">{item.item_code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {item.from_location_code || 'Main'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {item.to_location_code || 'Main'}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold">
                                                    {item.quantity}
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

                    <div className="space-y-6">
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-600" />
                                Transfer Timeline
                            </h3>
                            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-gray-200">
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-primary-600 border-4 border-white shadow-sm ring-1 ring-primary-600/10"></div>
                                    <p className="text-sm font-semibold">Requested</p>
                                    <p className="text-xs text-gray-500">{st.created_by_name} • {format(new Date(st.created_at), 'MMM dd, HH:mm')}</p>
                                </div>
                                {st.is_posted && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm ring-1 ring-green-500/10"></div>
                                        <p className="text-sm font-semibold">Stock Moved</p>
                                        <p className="text-xs text-gray-500">{st.posted_by_name} • {format(new Date(st.posted_at || st.created_at), 'MMM dd, HH:mm')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card p-6 bg-slate-900 text-white shadow-xl">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-400" />
                                Transit Info
                            </h3>
                            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                                Moving stock between warehouses affects ledger balances for both locations simultaneously upon posting.
                            </p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Shipment Weight:</span>
                                    <span>Calculating...</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Carrier:</span>
                                    <span>Internal Fleet</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
