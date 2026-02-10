import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    Calendar,
    FileText,
    History,
    Package,
    ClipboardCheck,
    Truck,
    Clock,
    Plus,
    User,
    MapPin
} from 'lucide-react';
import {
    useDeliveryOrder,
    useShipDeliveryOrder,
    useCancelDeliveryOrder
} from '../../hooks/useDeliveryOrders';
import type { DeliveryOrderItem } from '../../types/deliveryOrder';

export default function DODetailPage() {
    const { id } = useParams<{ id: string }>();
    const doId = parseInt(id || '0', 10);
    const navigate = useNavigate();

    const { data: doData, isLoading, error } = useDeliveryOrder(doId);
    const shipMutation = useShipDeliveryOrder();
    const cancelMutation = useCancelDeliveryOrder();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading Delivery Order...</div>
            </div>
        );
    }

    if (error || !doData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Error loading Delivery Order: {error?.message || 'Order not found'}
                    </div>
                </div>
            </div>
        );
    }

    const handleShip = async () => {
        if (window.confirm('Are you sure you want to ship this order? This will reduce physical stock officially.')) {
            try {
                await shipMutation.mutateAsync({ id: doId, data: { notes: 'Shipped from web UI' } });
                alert('Delivery order shipped successfully!');
            } catch (err) {
                alert('Error shipping order: ' + (err as Error).message);
            }
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel this draft?')) {
            try {
                await cancelMutation.mutateAsync(doId);
                navigate('/delivery-orders');
            } catch (err) {
                alert('Error cancelling order: ' + (err as Error).message);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="badge badge-secondary uppercase">Draft</span>;
            case 'picking':
                return <span className="badge badge-warning uppercase">Picking</span>;
            case 'shipped':
                return <span className="badge badge-success uppercase">Shipped</span>;
            case 'delivered':
                return <span className="badge badge-primary uppercase">Delivered</span>;
            case 'cancelled':
                return <span className="badge badge-danger uppercase">Cancelled</span>;
            default:
                return <span className="badge uppercase">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/delivery-orders"
                            className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-primary-600 border border-transparent hover:border-gray-200"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">{doData.do_number}</h1>
                                {getStatusBadge(doData.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Delivery Date: {new Date(doData.delivery_date).toLocaleDateString('vi-VN')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Truck className="w-4 h-4" />
                                    {doData.warehouse_name}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {doData.status === 'draft' || doData.status === 'picking' ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="btn btn-secondary text-red-600 border-red-100 hover:bg-red-50"
                                >
                                    Cancel Order
                                </button>
                                <Link
                                    to={`/delivery-orders/${doData.id}/edit`}
                                    className="btn btn-secondary"
                                >
                                    Edit Order
                                </Link>
                                <button
                                    onClick={handleShip}
                                    disabled={shipMutation.isPending}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Ship Order
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details & Items */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Customer & Shipping Summary */}
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-600" />
                                Shipping Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Customer</p>
                                            <p className="font-bold text-gray-900">{doData.customer_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Shipping Address</p>
                                            <p className="text-sm text-gray-700">{doData.customer_address || 'No address provided'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Shipping Method</p>
                                            <p className="font-medium text-gray-900">{doData.shipping_method || 'Standard'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <ClipboardCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Tracking Number</p>
                                            <p className="font-medium text-gray-900 font-mono">{doData.tracking_number || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {doData.notes && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Internal Notes</p>
                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm border border-gray-100 italic">
                                        {doData.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Items Table */}
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary-600" />
                                Order Items
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Finished Product</th>
                                            <th>Batch / Expiry</th>
                                            <th>Location</th>
                                            <th className="text-right">Quantity</th>
                                            {doData.is_posted && <th className="text-right">Unit Cost</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {doData.items?.map((item: DeliveryOrderItem) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="font-medium text-gray-900">{item.product_name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{item.product_sku}</div>
                                                </td>
                                                <td>
                                                    <div className="text-sm font-medium">{item.batch_number || 'No Batch'}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.expiry_date ? `Exp: ${new Date(item.expiry_date).toLocaleDateString('vi-VN')}` : ''}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                                                        {item.location_code || '-'}
                                                    </span>
                                                </td>
                                                <td className="text-right font-bold">
                                                    {item.quantity.toLocaleString()} PCS
                                                </td>
                                                {doData.is_posted && (
                                                    <td className="text-right text-sm text-gray-600">
                                                        {item.unit_cost ? item.unit_cost.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '-'}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Workflow status & Audit */}
                    <div className="space-y-8">
                        {/* Shipping Status Card */}
                        <div className={`card ${doData.is_posted ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                            <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Order Status</h3>
                            <div className="flex items-start gap-4">
                                {doData.is_posted ? (
                                    <>
                                        <div className="p-3 bg-white text-green-600 rounded-xl shadow-sm">
                                            <Truck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-800 text-lg">Shipped</p>
                                            <p className="text-xs text-green-600 mt-1 leading-relaxed">
                                                Order has been picked and dispatched. Stock balance has been updated.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-3 bg-white text-orange-600 rounded-xl shadow-sm">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-orange-800 text-lg">Pending Shipment</p>
                                            <p className="text-xs text-orange-600 mt-1 leading-relaxed">
                                                Items are currently being picked. Ship order to finalize transaction.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Audit Log Card */}
                        <div className="card">
                            <h3 className="text-sm font-bold uppercase text-gray-500 mb-6 tracking-wider flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Audit Trail
                            </h3>
                            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-primary-600 rounded-full flex items-center justify-center z-10">
                                        <Plus className="w-3 h-3 text-primary-600" />
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <p className="text-sm font-bold text-gray-900">Order Created</p>
                                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(doData.created_at).toLocaleString('vi-VN')}
                                        </p>
                                        {doData.created_by_name && (
                                            <p className="text-[10px] text-gray-500 mt-1">by {doData.created_by_name}</p>
                                        )}
                                    </div>
                                </div>

                                {doData.posted_at && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-green-500 rounded-full flex items-center justify-center z-10">
                                            <Truck className="w-3 h-3 text-green-500" />
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                            <p className="text-sm font-bold text-gray-900">Order Shipped</p>
                                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(doData.posted_at).toLocaleString('vi-VN')}
                                            </p>
                                            {doData.posted_by_name && (
                                                <p className="text-[10px] text-gray-500 mt-1">by {doData.posted_by_name}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
