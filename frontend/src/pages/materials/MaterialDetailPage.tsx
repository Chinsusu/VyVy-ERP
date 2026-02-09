import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useMaterial, useDeleteMaterial } from '../../hooks/useMaterials';

export default function MaterialDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: material, isLoading, error } = useMaterial(parseInt(id || '0'));
    const deleteMaterial = useDeleteMaterial();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        if (!material) return;

        try {
            await deleteMaterial.mutateAsync(material.id);
            navigate('/materials');
        } catch (error) {
            console.error('Error deleting material:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading material...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !material) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Error loading material: {error ? (error as Error).message : 'Material not found'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/materials')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Materials
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Package className="w-8 h-8 text-primary" />
                                {material.code}
                            </h1>
                            <p className="text-gray-600 mt-1">{material.trading_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to={`/materials/${material.id}/edit`}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <Edit className="w-5 h-5" />
                                Edit
                            </Link>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="btn btn-danger flex items-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Material Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Code</p>
                                    <p className="font-medium">{material.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Trading Name</p>
                                    <p className="font-medium">{material.trading_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">INCI Name</p>
                                    <p className="font-medium">{material.inci_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Material Type</p>
                                    <span className="badge badge-secondary">{material.material_type}</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Category</p>
                                    <p className="font-medium">{material.category || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Sub Category</p>
                                    <p className="font-medium">{material.sub_category || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Unit</p>
                                    <p className="font-medium">{material.unit}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    {material.is_active ? (
                                        <span className="badge badge-success">Active</span>
                                    ) : (
                                        <span className="badge badge-secondary">Inactive</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Standard Cost</p>
                                    <p className="font-medium">{material.standard_cost ? `$${material.standard_cost.toFixed(2)}` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Purchase Price</p>
                                    <p className="font-medium">{material.last_purchase_price ? `$${material.last_purchase_price.toFixed(2)}` : '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Stock Control */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Stock Control</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Min Stock Level</p>
                                    <p className="font-medium">{material.min_stock_level || 0} {material.unit}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Max Stock Level</p>
                                    <p className="font-medium">{material.max_stock_level ? `${material.max_stock_level} ${material.unit}` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Reorder Point</p>
                                    <p className="font-medium">{material.reorder_point ? `${material.reorder_point} ${material.unit}` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Reorder Quantity</p>
                                    <p className="font-medium">{material.reorder_quantity ? `${material.reorder_quantity} ${material.unit}` : '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {material.notes && (
                            <div className="card">
                                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{material.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quality & Safety */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Quality & Safety</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Requires QC</span>
                                    {material.requires_qc ? (
                                        <span className="badge badge-warning">Yes</span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">No</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Hazardous</span>
                                    {material.hazardous ? (
                                        <span className="badge badge-danger flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            Yes
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">No</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Shelf Life</p>
                                    <p className="font-medium">{material.shelf_life_days ? `${material.shelf_life_days} days` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Storage Conditions</p>
                                    <p className="font-medium text-sm">{material.storage_conditions || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Timestamps</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Created</p>
                                    <p className="text-sm font-medium">{new Date(material.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Updated</p>
                                    <p className="text-sm font-medium">{new Date(material.updated_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Delete Material</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <strong>{material.code}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="btn btn-secondary"
                                    disabled={deleteMaterial.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-danger"
                                    disabled={deleteMaterial.isPending}
                                >
                                    {deleteMaterial.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
