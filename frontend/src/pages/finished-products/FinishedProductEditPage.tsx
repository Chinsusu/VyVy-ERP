import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useFinishedProduct } from '../../hooks/useFinishedProducts';
import FinishedProductForm from '../../components/finished-products/FinishedProductForm';

export default function FinishedProductEditPage() {
    const { id } = useParams<{ id: string }>();
    const productId = parseInt(id || '0', 10);

    const { data: product, isLoading, error } = useFinishedProduct(productId);

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Đang tải sản phẩm...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error ? `Lỗi: ${(error as Error).message}` : 'Không tìm thấy sản phẩm'}
                    </div>
                    <Link
                        to="/finished-products"
                        className="text-primary hover:underline flex items-center gap-2 mt-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại Danh Sách Thành Phẩm
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
                        to={`/finished-products/${productId}`}
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại Chi Tiết Sản Phẩm
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Chỉnh Sửa Thành Phẩm</h1>
                    <p className="text-gray-600 mt-1">
                        Cập nhật thông tin cho {product.name} ({product.code})
                    </p>
                </div>

                {/* Form */}
                <FinishedProductForm product={product} />
            </div>
        </div>
    );
}
