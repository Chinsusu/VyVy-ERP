import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Package,
    FileText,
    DollarSign,
    Scale,
    Calendar,
} from 'lucide-react';
import { useFinishedProduct, useDeleteFinishedProduct } from '../../hooks/useFinishedProducts';

export default function FinishedProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const productId = parseInt(id || '0', 10);

    const { data: product, isLoading, error } = useFinishedProduct(productId);
    const deleteProduct = useDeleteFinishedProduct();

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteProduct.mutateAsync(productId);
            navigate('/finished-products');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

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
                        to="/finished-products"
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Finished Products
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                                {product.is_active ? (
                                    <span className="badge badge-success">Active</span>
                                ) : (
                                    <span className="badge badge-secondary">Inactive</span>
                                )}
                            </div>
                            <p className="text-gray-600">Code: {product.code}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                to={`/finished-products/${productId}/edit`}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </Link>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="btn btn-danger flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Code</label>
                            <p className="text-gray-900 font-medium">{product.code}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Name (English)</label>
                            <p className="text-gray-900">{product.name}</p>
                        </div>
                        {product.name_en && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Name (Local)</label>
                                <p className="text-gray-900">{product.name_en}</p>
                            </div>
                        )}
                        {product.category && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Category</label>
                                <p className="text-gray-900">{product.category}</p>
                            </div>
                        )}
                        {product.sub_category && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Sub-category</label>
                                <p className="text-gray-900">{product.sub_category}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-600">Unit</label>
                            <p className="text-gray-900">{product.unit}</p>
                        </div>
                        {product.barcode && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Barcode</label>
                                <p className="text-gray-900 font-mono">{product.barcode}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Specifications */}
                {(product.net_weight || product.gross_weight || product.volume) && (
                    <div className="card mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Scale className="w-5 h-5 text-primary" />
                            Specifications
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {product.net_weight && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Net Weight</label>
                                    <p className="text-gray-900">{product.net_weight} kg</p>
                                </div>
                            )}
                            {product.gross_weight && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Gross Weight</label>
                                    <p className="text-gray-900">{product.gross_weight} kg</p>
                                </div>
                            )}
                            {product.volume && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Volume</label>
                                    <p className="text-gray-900">{product.volume} m³</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Stock Management */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Stock Management
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {product.min_stock_level !== undefined && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Min Stock Level</label>
                                <p className="text-gray-900">{product.min_stock_level}</p>
                            </div>
                        )}
                        {product.max_stock_level !== undefined && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Max Stock Level</label>
                                <p className="text-gray-900">{product.max_stock_level}</p>
                            </div>
                        )}
                        {product.reorder_point !== undefined && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Reorder Point</label>
                                <p className="text-gray-900">{product.reorder_point}</p>
                            </div>
                        )}
                        {product.shelf_life_days && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Shelf Life</label>
                                <p className="text-gray-900">{product.shelf_life_days} days</p>
                            </div>
                        )}
                        {product.storage_conditions && (
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-600">Storage Conditions</label>
                                <p className="text-gray-900 whitespace-pre-wrap">{product.storage_conditions}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pricing */}
                {(product.standard_cost || product.selling_price) && (
                    <div className="card mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-primary" />
                            Pricing
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {product.standard_cost && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Standard Cost</label>
                                    <p className="text-gray-900 font-medium">
                                        {product.standard_cost.toLocaleString('vi-VN')} VND
                                    </p>
                                </div>
                            )}
                            {product.selling_price && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Selling Price</label>
                                    <p className="text-gray-900 font-medium">
                                        {product.selling_price.toLocaleString('vi-VN')} VND
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {product.notes && (
                    <div className="card mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Notes
                        </h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{product.notes}</p>
                    </div>
                )}

                {/* Metadata */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">System Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <label className="text-gray-600">Created At</label>
                            <p className="text-gray-900">
                                {new Date(product.created_at).toLocaleString('vi-VN')}
                            </p>
                        </div>
                        <div>
                            <label className="text-gray-600">Updated At</label>
                            <p className="text-gray-900">
                                {new Date(product.updated_at).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete product <strong>{product.name}</strong>? This action cannot
                            be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn btn-secondary"
                                disabled={deleteProduct.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger"
                                disabled={deleteProduct.isPending}
                            >
                                {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
