import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import type { PurchaseOrder, PurchaseOrderFilters } from '../../types/purchaseOrder';

export default function PurchaseOrderListPage() {
    const [filters, setFilters] = useState<PurchaseOrderFilters>({
        page: 1,
        page_size: 10,
    });

    const { data, isLoading, error } = usePurchaseOrders(filters);
    const purchaseOrders = data?.data || [];
    const pagination = data?.pagination;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="badge badge-secondary">Draft</span>;
            case 'approved':
                return <span className="badge badge-success">Approved</span>;
            case 'cancelled':
                return <span className="badge badge-danger">Cancelled</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setFilters({
            ...filters,
            search: formData.get('search') as string,
            page: 1,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
                        <p className="text-gray-600 mt-1">Manage purchase orders and procurement</p>
                    </div>
                    <Link to="/purchase-orders/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Purchase Order
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
                                placeholder="Search by PO number..."
                                className="input pl-10 w-full"
                                defaultValue={filters.search}
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
                                value={filters.status || ''}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            >
                                <option value="">All Statuses</option>
                                <option value="draft">Draft</option>
                                <option value="approved">Approved</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order Date From</label>
                            <input
                                type="date"
                                className="input"
                                value={filters.order_date_from || ''}
                                onChange={(e) => setFilters({ ...filters, order_date_from: e.target.value, page: 1 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order Date To</label>
                            <input
                                type="date"
                                className="input"
                                value={filters.order_date_to || ''}
                                onChange={(e) => setFilters({ ...filters, order_date_to: e.target.value, page: 1 })}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">Loading purchase orders...</div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                            Error loading purchase orders: {(error as Error).message}
                        </div>
                    ) : purchaseOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No purchase orders found</p>
                            <Link to="/purchase-orders/new" className="btn btn-primary">
                                Create Your First Purchase Order
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>PO Number</th>
                                            <th>Supplier</th>
                                            <th>Warehouse</th>
                                            <th>Order Date</th>
                                            <th>Status</th>
                                            <th>Total Amount</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchaseOrders.map((po: PurchaseOrder) => (
                                            <tr key={po.id}>
                                                <td className="font-medium">{po.po_number}</td>
                                                <td>{po.supplier?.name || '-'}</td>
                                                <td>{po.warehouse?.name || '-'}</td>
                                                <td>{new Date(po.order_date).toLocaleDateString('vi-VN')}</td>
                                                <td>{getStatusBadge(po.status)}</td>
                                                <td className="font-semibold">{po.total_amount.toLocaleString('vi-VN')} VND</td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            to={`/purchase-orders/${po.id}`}
                                                            className="text-primary hover:underline text-sm"
                                                        >
                                                            View
                                                        </Link>
                                                        {po.status === 'draft' && (
                                                            <Link
                                                                to={`/purchase-orders/${po.id}/edit`}
                                                                className="text-primary hover:underline text-sm"
                                                            >
                                                                Edit
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.total_pages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        Showing {((pagination.page - 1) * pagination.page_size) + 1} to{' '}
                                        {Math.min(pagination.page * pagination.page_size, pagination.total)} of{' '}
                                        {pagination.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                                            disabled={pagination.page === 1}
                                            className="btn btn-secondary"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                                            disabled={pagination.page >= pagination.total_pages}
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
