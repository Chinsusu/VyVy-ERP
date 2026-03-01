import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import FinishedProductForm from '../../components/finished-products/FinishedProductForm';

export default function FinishedProductCreatePage() {
    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/finished-products"
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại Danh Sách Thành Phẩm
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Thêm Thành Phẩm Mới</h1>
                    <p className="text-gray-600 mt-1">Tạo mới một thành phẩm trong hệ thống</p>
                </div>

                {/* Form */}
                <FinishedProductForm />
            </div>
        </div>
    );
}
