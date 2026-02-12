import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useWarehouse } from '../../hooks/useWarehouses';
import WarehouseForm from '../../components/warehouses/WarehouseForm';

export default function WarehouseEditPage() {
    const { t } = useTranslation('warehouses');
    const { t: tc } = useTranslation('common');
    const { id } = useParams<{ id: string }>();
    const warehouseId = parseInt(id || '0', 10);

    const { data: warehouse, isLoading, error } = useWarehouse(warehouseId);

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading warehouse...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !warehouse) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error ? `Error: ${(error as Error).message}` : 'Warehouse not found'}
                    </div>
                    <Link
                        to="/warehouses"
                        className="text-primary hover:underline flex items-center gap-2 mt-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Warehouses
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
                        to={`/warehouses/${warehouseId}`}
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Warehouse Details
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Warehouse</h1>
                    <p className="text-gray-600 mt-1">
                        Update information for {warehouse.name} ({warehouse.code})
                    </p>
                </div>

                {/* Form */}
                <WarehouseForm warehouse={warehouse} />
            </div>
        </div>
    );
}
