import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SupplierForm from '../../components/suppliers/SupplierForm';

export default function SupplierCreatePage() {
    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/suppliers"
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Thêm Nhà Cung Cấp Mới</h1>
                    <p className="text-gray-600 mt-1">Thêm nhà cung cấp mới vào hệ thống</p>
                </div>

                {/* Form */}
                <SupplierForm />
            </div>
        </div>
    );
}
