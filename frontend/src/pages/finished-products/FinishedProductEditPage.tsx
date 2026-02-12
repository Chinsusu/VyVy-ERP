import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useFinishedProduct } from '../../hooks/useFinishedProducts';
import FinishedProductForm from '../../components/finished-products/FinishedProductForm';

export default function FinishedProductEditPage() {
    const { t } = useTranslation('finishedProducts');
    const { t: tc } = useTranslation('common');
    const { id } = useParams<{ id: string }>();
    const productId = parseInt(id || '0', 10);

    const { data: product, isLoading, error } = useFinishedProduct(productId);

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading product...</div>
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
                        {error ? `Error: ${(error as Error).message}` : 'Product not found'}
                    </div>
                    <Link
                        to="/finished-products"
                        className="text-primary hover:underline flex items-center gap-2 mt-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Finished Products
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
                        Back to Product Details
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Finished Product</h1>
                    <p className="text-gray-600 mt-1">
                        Update information for {product.name} ({product.code})
                    </p>
                </div>

                {/* Form */}
                <FinishedProductForm product={product} />
            </div>
        </div>
    );
}
