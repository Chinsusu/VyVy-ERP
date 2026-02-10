import DOForm from '../../components/delivery-orders/DOForm';

export default function DOCreatePage() {
    return (
        <div className="min-h-screen bg-transparent">
            <DOForm isEdit={false} />
        </div>
    );
}
