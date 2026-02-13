import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    CheckCircle,
    XCircle,
    Trash2,
    Truck,
    Building2,
    Calendar,
    FileText,
    User,
    Package
} from 'lucide-react';
import {
    usePurchaseOrder,
    useApprovePurchaseOrder,
    useCancelPurchaseOrder,
    useDeletePurchaseOrder
} from '../../hooks/usePurchaseOrders';
import type { PurchaseOrderItem } from '../../types/purchaseOrder';

export default function PurchaseOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const poId = parseInt(id || '0', 10);

    const { data: po, isLoading, error } = usePurchaseOrder(poId);

    const approveMutation = useApprovePurchaseOrder();
    const cancelMutation = useCancelPurchaseOrder();
    const deleteMutation = useDeletePurchaseOrder();

    const [showConfirmModal, setShowConfirmModal] = useState<'approve' | 'cancel' | 'delete' | null>(null);

    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center">
                <div className="text-gray-500">Loading order details...</div>
            </div>
        );
    }

    if (error || !po) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error ? `Error: ${(error as Error).message}` : 'Order not found'}
                    </div>
                    <Link to="/purchase-orders" className="btn btn-secondary mt-4">
                        Back to List
                    </Link>
                </div>
            </div>
        );
    }

    const handleApprove = async () => {
        try {
            await approveMutation.mutateAsync(poId);
            setShowConfirmModal(null);
        } catch (err) {
            alert('Approval failed');
        }
    };

    const handleCancel = async () => {
        try {
            await cancelMutation.mutateAsync(poId);
            setShowConfirmModal(null);
        } catch (err) {
            alert('Cancellation failed');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(poId);
            navigate('/purchase-orders');
        } catch (err) {
            alert('Deletion failed');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <span className="badge badge-secondary py-1.5 px-3 text-sm">Draft</span>;
            case 'approved': return <span className="badge badge-success py-1.5 px-3 text-sm">Approved</span>;
            case 'cancelled': return <span className="badge badge-danger py-1.5 px-3 text-sm">Cancelled</span>;
            default: return <span className="badge py-1.5 px-3 text-sm">{status}</span>;
        }
    };

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header and Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link to="/purchase-orders" className="text-primary hover:underline flex items-center gap-2 mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to List
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold text-gray-900">{po.po_number}</h1>
                            {getStatusBadge(po.status)}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {po.status === 'draft' && (
                            <>
                                <Link to={`/purchase-orders/${poId}/edit`} className="btn btn-secondary flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => setShowConfirmModal('approve')}
                                    className="btn btn-success flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve Order
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal('delete')}
                                    className="btn btn-danger flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </>
                        )}
                        {po.status === 'approved' && (
                            <button
                                onClick={() => setShowConfirmModal('cancel')}
                                className="btn btn-warning flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancel Order
                            </button>
                        )}
                    </div>
                </div>

                {/* PO Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Info */}
                        <div className="card grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2 border-b pb-2">
                                    <Truck className="w-4 h-4" /> Supplier
                                </h3>
                                <div className="space-y-2">
                                    <p className="font-bold text-lg text-primary">{po.supplier?.name}</p>
                                    <p className="text-sm text-gray-600">Code: {po.supplier?.code}</p>
                                    <p className="text-sm text-gray-600">{po.supplier?.email}</p>
                                    <p className="text-sm text-gray-600">{po.supplier?.phone}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2 border-b pb-2">
                                    <Building2 className="w-4 h-4" /> Warehouse / Delivery
                                </h3>
                                <div className="space-y-2">
                                    <p className="font-bold text-lg">{po.warehouse?.name}</p>
                                    <p className="text-sm text-gray-600">Code: {po.warehouse?.code}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Order Date: {new Date(po.order_date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    {po.expected_delivery_date && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Exp. Delivery: {new Date(po.expected_delivery_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="card p-0 overflow-hidden">
                            <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Order Items
                                </h3>
                                <span className="text-sm text-gray-500">{(po.items || []).length} items</span>
                            </div>
                            <div className="table-container">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-600 border-b">
                                            <th className="py-3 px-6 text-left">Material</th>
                                            <th className="py-3 px-6 text-right">Quantity</th>
                                            <th className="py-3 px-6 text-right">Unit Price</th>
                                            <th className="py-3 px-6 text-right">Tax (%)</th>
                                            <th className="py-3 px-6 text-right">Line Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(po.items || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-gray-500 italic">
                                                    No items found in this order.
                                                </td>
                                            </tr>
                                        ) : (
                                            po.items.map((item: PurchaseOrderItem) => (
                                                <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6 text-left">
                                                        <p className="font-bold">{item.material?.trading_name}</p>
                                                        <p className="text-xs text-gray-500">{item.material?.code}</p>
                                                        {item.notes && <p className="text-xs text-gray-400 mt-1">Note: {item.notes}</p>}
                                                    </td>
                                                    <td className="py-4 px-6 text-right font-medium">{item.quantity}</td>
                                                    <td className="py-4 px-6 text-right">{item.unit_price.toLocaleString('vi-VN')}</td>
                                                    <td className="py-4 px-6 text-right text-gray-500">{item.tax_rate}%</td>
                                                    <td className="py-4 px-6 text-right font-bold text-primary">
                                                        {item.line_total.toLocaleString('vi-VN')}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {po.notes && (
                            <div className="card space-y-4">
                                <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2 border-b pb-2">
                                    <FileText className="w-4 h-4" /> Notes
                                </h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{po.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Totals & Metadata Sidebar */}
                    <div className="space-y-8">
                        <div className="card bg-primary/5 border-primary/20">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-primary">
                                Order Summary
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{po.subtotal.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax Total</span>
                                    <span>{po.tax_amount.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Discount Total</span>
                                    <span>- {po.discount_amount.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="border-t border-primary/20 pt-4 mt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-gray-700">Grand Total</span>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-primary leading-tight">
                                                {po.total_amount.toLocaleString('vi-VN')}
                                            </p>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">VND</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card space-y-6 bg-white">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                    <User className="w-3 h-3" /> System Audit
                                </h4>
                                <div className="text-xs space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Created At</span>
                                        <span className="font-medium text-gray-800">{new Date(po.created_at).toLocaleString('vi-VN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Last Updated</span>
                                        <span className="font-medium text-gray-800">{new Date(po.updated_at).toLocaleString('vi-VN')}</span>
                                    </div>
                                    {po.approved_at && (
                                        <div className="flex justify-between pt-3 border-t">
                                            <span className="text-gray-500">Approved At</span>
                                            <span className="font-bold text-success-700">{new Date(po.approved_at).toLocaleString('vi-VN')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {po.payment_terms && (
                                <div className="space-y-2 pt-2 border-t">
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Payment Terms</h4>
                                    <p className="text-sm font-medium text-gray-700">{po.payment_terms}</p>
                                </div>
                            )}
                            {po.shipping_method && (
                                <div className="space-y-2 pt-2 border-t">
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Shipping Method</h4>
                                    <p className="text-sm font-medium text-gray-700">{po.shipping_method}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modals */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 space-y-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900 capitalize">
                                {showConfirmModal} Order?
                            </h3>
                            <p className="text-gray-500">
                                Are you sure you want to {showConfirmModal} this Purchase Order (<strong>{po.po_number}</strong>)?
                                {showConfirmModal === 'delete' && " This action cannot be undone."}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConfirmModal(null)}
                                className="btn btn-secondary flex-1"
                                disabled={approveMutation.isPending || cancelMutation.isPending || deleteMutation.isPending}
                            >
                                Go Back
                            </button>
                            <button
                                onClick={
                                    showConfirmModal === 'approve' ? handleApprove :
                                        showConfirmModal === 'cancel' ? handleCancel :
                                            handleDelete
                                }
                                className={`btn flex-1 ${showConfirmModal === 'delete' ? 'btn-danger' :
                                    showConfirmModal === 'approve' ? 'btn-success' : 'btn-warning'
                                    }`}
                                disabled={approveMutation.isPending || cancelMutation.isPending || deleteMutation.isPending}
                            >
                                {approveMutation.isPending || cancelMutation.isPending || deleteMutation.isPending ? 'Processing...' : `Yes, ${showConfirmModal}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
