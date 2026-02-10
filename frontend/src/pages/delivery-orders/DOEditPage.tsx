import DOForm from '../../components/delivery-orders/DOForm';

export default function DOEditPage() {
    return (
        <div className="min-h-screen bg-transparent">
            <DOForm isEdit={true} />
        </div>
    );
}
