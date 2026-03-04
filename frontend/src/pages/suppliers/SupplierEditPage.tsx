import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useSupplier } from '../../hooks/useSuppliers';
import SupplierForm from '../../components/suppliers/SupplierForm';

export default function SupplierEditPage() {
    const { id } = useParams<{ id: string }>();
    const supplierId = parseInt(id || '0', 10);

    const { data: supplier, isLoading, error } = useSupplier(supplierId);

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Đang tải nhà cung cấp...</div>
                </div>
            </div>
        );
    }

    if (error || !supplier) {
        return (
            <div className="animate-fade-in p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error ? `Lỗi: ${(error as Error).message}` : 'Không tìm thấy nhà cung cấp'}
                </div>
                <Link to="/suppliers" className="text-primary hover:underline flex items-center gap-2 mt-4">
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <Link
                    to={`/suppliers/${supplierId}`}
                    className="text-primary hover:underline flex items-center gap-2 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại chi tiết nhà cung cấp
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Chỉnh Sửa Nhà Cung Cấp</h1>
                <p className="text-gray-600 mt-1">
                    Cập nhật thông tin của {supplier.name} ({supplier.code})
                </p>
            </div>

            {/* SupplierForm renders SupplierDocuments above action buttons internally */}
            <SupplierForm supplier={supplier} />
        </div>
    );
}
