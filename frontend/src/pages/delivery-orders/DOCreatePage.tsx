import DOForm from '../../components/delivery-orders/DOForm';
import { useTranslation } from 'react-i18next';

export default function DOCreatePage() {
    const { t } = useTranslation('deliveryOrders');
    const { t: tc } = useTranslation('common');
    return (
        <div className="min-h-screen bg-transparent">
            <DOForm isEdit={false} />
        </div>
    );
}
