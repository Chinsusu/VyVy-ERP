import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SupplierForm from '../../components/suppliers/SupplierForm';

export default function SupplierCreatePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/suppliers"
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Suppliers
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Supplier</h1>
                    <p className="text-gray-600 mt-1">Add a new supplier to your system</p>
                </div>

                {/* Form */}
                <SupplierForm />
            </div>
        </div>
    );
}
