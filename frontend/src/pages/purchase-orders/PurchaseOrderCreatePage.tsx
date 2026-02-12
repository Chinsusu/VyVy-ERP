import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PurchaseOrderForm from '../../components/purchase-orders/PurchaseOrderForm';

export default function PurchaseOrderCreatePage() {
    const { t } = useTranslation('purchaseOrders');
    const { t: tc } = useTranslation('common');
    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/purchase-orders"
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Purchase Orders
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Purchase Order</h1>
                    <p className="text-gray-600 mt-1">Fill in the details to create a new procurement order</p>
                </div>

                {/* Form */}
                <PurchaseOrderForm />
            </div>
        </div>
    );
}
