import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { usePurchaseOrder } from '../../hooks/usePurchaseOrders';
import PurchaseOrderForm from '../../components/purchase-orders/PurchaseOrderForm';
import PODocuments from '../../components/purchase-orders/PODocuments';

export default function PurchaseOrderEditPage() {
    const { id } = useParams<{ id: string }>();
    const poId = parseInt(id || '0', 10);

    const { data: po, isLoading, error } = usePurchaseOrder(poId);

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6 flex items-center justify-center">
                <div className="text-gray-500 text-lg">Loading order details...</div>
            </div>
        );
    }

    if (error || !po) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error ? `Error: ${(error as Error).message}` : 'Purchase Order not found'}
                    </div>
                    <Link
                        to="/purchase-orders"
                        className="text-primary hover:underline flex items-center gap-2 mt-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Purchase Orders
                    </Link>
                </div>
            </div>
        );
    }

    // Block editing for cancelled POs only (draft and approved can be edited)
    if (po.status === 'cancelled') {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-amber-800">
                        <h2 className="text-xl font-bold mb-2">Order Not Editable</h2>
                        <p>Purchase Orders with status <strong>{po.status}</strong> cannot be edited.</p>
                    </div>
                    <Link
                        to={`/purchase-orders/${poId}`}
                        className="btn btn-primary mt-6 flex items-center gap-2 w-max"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        View Order Details
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to={`/purchase-orders/${poId}`}
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Details
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Purchase Order</h1>
                    <p className="text-gray-600 mt-1">Updating {po.po_number}</p>
                </div>

                {/* Form */}
                <PurchaseOrderForm initialData={po} isEdit />

                {/* Chứng từ đơn hàng */}
                <div className="mt-8">
                    <PODocuments poId={poId} />
                </div>
            </div>
        </div>
    );
}
