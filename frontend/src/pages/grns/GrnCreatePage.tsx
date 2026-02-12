import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import GrnForm from '../../components/grns/GrnForm';

export default function GrnCreatePage() {
    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/grns"
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Goods Receipt Notes
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Receive Goods</h1>
                    <p className="text-gray-600 mt-1">Record a new shipment receipt against an approved purchase order</p>
                </div>

                {/* Form */}
                <GrnForm />
            </div>
        </div>
    );
}
