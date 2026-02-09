import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import MaterialForm from '../../components/materials/MaterialForm';

export default function MaterialCreatePage() {
    const navigate = useNavigate();

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
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Package className="w-8 h-8 text-primary" />
                        Create New Material
                    </h1>
                </div>

                {/* Form */}
                <MaterialForm />
            </div>
        </div>
    );
}
