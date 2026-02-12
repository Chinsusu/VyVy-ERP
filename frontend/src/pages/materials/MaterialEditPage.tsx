import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package } from 'lucide-react';
import { useMaterial } from '../../hooks/useMaterials';
import MaterialForm from '../../components/materials/MaterialForm';

export default function MaterialEditPage() {
    const { t } = useTranslation('materials');
    const { t: tc } = useTranslation('common');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: material, isLoading, error } = useMaterial(parseInt(id || '0'));

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading material...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !material) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Error loading material: {error ? (error as Error).message : 'Material not found'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div>
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
                        Edit Material: {material.code}
                    </h1>
                </div>

                {/* Form */}
                <MaterialForm material={material} />
            </div>
        </div>
    );
}
