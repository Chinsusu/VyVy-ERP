import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { usePurchaseOrder } from '../../hooks/usePurchaseOrders';
import PurchaseOrderForm from '../../components/purchase-orders/PurchaseOrderForm';

export default function PurchaseOrderEditPage() {
    const { id } = useParams<{ id: string }>();
    const poId = parseInt(id || '0', 10);

    const { data: po, isLoading, error } = usePurchaseOrder(poId);

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6 flex items-center justify-center">
                <div className="text-gray-500 text-lg">Đang tải thông tin đơn hàng...</div>
            </div>
        );
    }

    if (error || !po) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error ? `Lỗi: ${(error as Error).message}` : 'Không tìm thấy đơn mua hàng'}
                    </div>
                    <Link
                        to="/purchase-orders"
                        className="text-primary hover:underline flex items-center gap-2 mt-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách
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
                        <h2 className="text-xl font-bold mb-2">Đơn hàng không thể chỉnh sửa</h2>
                        <p>Đơn mua hàng có trạng thái <strong>{po.status}</strong> không thể chỉnh sửa.</p>
                    </div>
                    <Link
                        to={`/purchase-orders/${poId}`}
                        className="btn btn-primary mt-6 flex items-center gap-2 w-max"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Xem chi tiết đơn hàng
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
                        Quay lại chi tiết đơn
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Chỉnh Sửa Đơn Mua Hàng</h1>
                    <p className="text-gray-600 mt-1">Đang cập nhật {po.po_number}</p>
                </div>

                {/* Form */}
                <PurchaseOrderForm initialData={po} isEdit />

            </div>
        </div>
    );
}
