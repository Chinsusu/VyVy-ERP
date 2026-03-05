import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import GrnForm from '../../components/grns/GrnForm';

export default function GrnCreatePage() {
    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/grns"
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại Danh Sách Lệnh Nhập Kho
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tạo Lệnh Nhập Kho</h1>
                    <p className="text-gray-600 mt-1">Ghi nhận hàng nhập kho từ đơn mua hàng đã được duyệt</p>
                </div>

                {/* Form */}
                <GrnForm />
            </div>
        </div>
    );
}
