import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PurchaseOrderForm from '../../components/purchase-orders/PurchaseOrderForm';

export default function PurchaseOrderCreatePage() {
    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/purchase-orders"
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại Đơn Mua Hàng
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tạo Đơn Mua Hàng</h1>
                    <p className="text-gray-600 mt-1">Nhập thông tin chi tiết để tạo đơn mua hàng mới</p>
                </div>

                {/* Form */}
                <PurchaseOrderForm />
            </div>
        </div>
    );
}
