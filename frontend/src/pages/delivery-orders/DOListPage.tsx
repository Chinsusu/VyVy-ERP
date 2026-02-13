import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Plus, Store, Truck } from 'lucide-react';
import { useDeliveryOrders } from '../../hooks/useDeliveryOrders';
import { useSalesChannels } from '../../hooks/useSalesChannels';
import { useCarriers } from '../../hooks/useCarriers';
import type { DeliveryOrder, DeliveryOrderFilter } from '../../types/deliveryOrder';

export default function DOListPage() {
    const [filter, setFilter] = useState<DeliveryOrderFilter>({
        offset: 0,
        limit: 10,
    });

    const { data, isLoading, error } = useDeliveryOrders(filter);
    const { data: channelsData } = useSalesChannels({ is_active: true });
    const salesChannels = channelsData?.data || [];
    const { data: carriersData } = useCarriers({ is_active: true });
    const carriers = carriersData?.data || [];
    const deliveryOrders = data?.items || [];
    const totalItems = data?.total || 0;
    const totalPages = Math.ceil(totalItems / (filter.limit || 10));

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="badge badge-secondary">Draft</span>;
            case 'picking':
                return <span className="badge badge-warning">Picking</span>;
            case 'shipped':
                return <span className="badge badge-success">Shipped</span>;
            case 'delivered':
                return <span className="badge badge-primary">Delivered</span>;
            case 'cancelled':
                return <span className="badge badge-danger">Cancelled</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setFilter({
            ...filter,
            do_number: formData.get('search') as string,
            offset: 0,
        });
    };

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-slate-900">Delivery Orders</h1>
                        <p className="text-slate-500 mt-1 text-premium-sm">Manage finished product shipments to customers</p>
                    </div>
                    <Link to="/delivery-orders/create" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create Delivery Order
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="card mb-6">
                    <form onSubmit={handleSearch} className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search by DO number..."
                                className="input pl-10 w-full"
                                defaultValue={filter.do_number}
                            />
                        </div>
                        <button type="submit" className="btn btn-secondary">
                            Search
                        </button>
                    </form>

                    {/* Additional Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="input"
                                value={filter.status || ''}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value, offset: 0 })}
                            >
                                <option value="">All Statuses</option>
                                <option value="draft">Draft</option>
                                <option value="picking">Picking</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <Store className="w-4 h-4" /> Sales Channel
                            </label>
                            <select
                                className="input"
                                value={filter.sales_channel_id || ''}
                                onChange={(e) => setFilter({ ...filter, sales_channel_id: e.target.value ? Number(e.target.value) : undefined, offset: 0 })}
                            >
                                <option value="">All Channels</option>
                                {salesChannels.map((ch: any) => (
                                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <Truck className="w-4 h-4" /> Carrier
                            </label>
                            <select
                                className="input"
                                value={filter.carrier_id || ''}
                                onChange={(e) => setFilter({ ...filter, carrier_id: e.target.value ? Number(e.target.value) : undefined, offset: 0 })}
                            >
                                <option value="">All Carriers</option>
                                {carriers.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
                            <select
                                className="input"
                                value={filter.limit || 10}
                                onChange={(e) => setFilter({ ...filter, limit: Number(e.target.value), offset: 0 })}
                            >
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">Loading delivery orders...</div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                            Error loading delivery orders: {(error as Error).message}
                        </div>
                    ) : deliveryOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No delivery orders found</p>
                            <Link to="/delivery-orders/create" className="text-primary-600 hover:underline">
                                Create your first delivery order
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>DO Number</th>
                                            <th>Customer</th>
                                            <th>Channel</th>
                                            <th>Carrier</th>
                                            <th>Warehouse</th>
                                            <th>Delivery Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveryOrders.map((doItem: DeliveryOrder) => (
                                            <tr key={doItem.id}>
                                                <td className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-gray-400" />
                                                        {doItem.do_number}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-sm font-medium text-gray-900">{doItem.customer_name}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-xs">{doItem.customer_address}</div>
                                                </td>
                                                <td>
                                                    {doItem.sales_channel_name ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                                                            <Store className="w-3 h-3" />
                                                            {doItem.sales_channel_name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {doItem.carrier_name ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                                                            <Truck className="w-3 h-3" />
                                                            {doItem.carrier_name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td>{doItem.warehouse_name || '-'}</td>
                                                <td>{new Date(doItem.delivery_date).toLocaleDateString('vi-VN')}</td>
                                                <td>{getStatusBadge(doItem.status)}</td>
                                                <td>
                                                    <Link
                                                        to={`/delivery-orders/${doItem.id}`}
                                                        className="text-primary-600 hover:underline text-sm font-medium"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        Showing {(filter.offset || 0) + 1} to{' '}
                                        {Math.min((filter.offset || 0) + (filter.limit || 10), totalItems)} of{' '}
                                        {totalItems} results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFilter({ ...filter, offset: Math.max(0, (filter.offset || 0) - (filter.limit || 10)) })}
                                            disabled={filter.offset === 0}
                                            className="btn btn-secondary"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setFilter({ ...filter, offset: (filter.offset || 0) + (filter.limit || 10) })}
                                            disabled={(filter.offset || 0) + (filter.limit || 10) >= totalItems}
                                            className="btn btn-secondary"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
