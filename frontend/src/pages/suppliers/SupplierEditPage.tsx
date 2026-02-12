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
                <div>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading supplier...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !supplier) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error ? `Error: ${(error as Error).message}` : 'Supplier not found'}
                    </div>
                    <Link
                        to="/suppliers"
                        className="text-primary hover:underline flex items-center gap-2 mt-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Suppliers
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
                        to={`/suppliers/${supplierId}`}
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Supplier Details
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Supplier</h1>
                    <p className="text-gray-600 mt-1">
                        Update information for {supplier.name} ({supplier.code})
                    </p>
                </div>

                {/* Form */}
                <SupplierForm supplier={supplier} />
            </div>
        </div>
    );
}
