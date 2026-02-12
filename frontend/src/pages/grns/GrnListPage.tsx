import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, CheckCircle, Clock, AlertTriangle, Package } from 'lucide-react';
import { useGrns } from '../../hooks/useGrns';
import type { GRNFilters } from '../../types/grn';

export default function GrnListPage() {
    const [filters, setFilters] = useState<GRNFilters>({
        page: 1,
        page_size: 10,
    });

    const { data, isLoading, error } = useGrns(filters);
    const grns = data?.data || [];
    const pagination = data?.pagination;

    const getQCStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                );
            case 'pass':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Pass
                    </span>
                );
            case 'fail':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3" />
                        Fail
                    </span>
                );
            case 'conditional':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <Clock className="w-3 h-3" />
                        Conditional
                    </span>
                );
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const getPostingStatusBadge = (posted: boolean) => {
        if (posted) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Package className="w-3 h-3" />
                    Posted
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <Clock className="w-3 h-3" />
                Draft
            </span>
        );
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
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Goods Receipt Notes</h1>
                        <p className="text-gray-600 mt-1">Manage incoming materials and quality control</p>
                    </div>
                    <Link to="/grns/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Receive Goods
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="card mb-6 p-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search by GRN or PO number..."
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">QC Status</label>
                            <select
                                className="input"
                                value={filters.overall_qc_status || ''}
                                onChange={(e) => setFilters({ ...filters, overall_qc_status: e.target.value, page: 1 })}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="pass">Pass</option>
                                <option value="fail">Fail</option>
                                <option value="conditional">Conditional</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date From</label>
                            <input
                                type="date"
                                className="input"
                                value={filters.receipt_date_from || ''}
                                onChange={(e) => setFilters({ ...filters, receipt_date_from: e.target.value, page: 1 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date To</label>
                            <input
                                type="date"
                                className="input"
                                value={filters.receipt_date_to || ''}
                                onChange={(e) => setFilters({ ...filters, receipt_date_to: e.target.value, page: 1 })}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">Loading GRNs...</div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 m-6">
                            Error loading GRNs: {(error as Error).message}
                        </div>
                    ) : grns.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-4 font-medium">No Goods Receipt Notes found</p>
                            <Link to="/grns/new" className="btn btn-primary">
                                Receive Your First Shipment
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>GRN Number</th>
                                            <th>PO Number</th>
                                            <th>Warehouse</th>
                                            <th>Receipt Date</th>
                                            <th>QC Status</th>
                                            <th>Inventory Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grns.map((grn) => (
                                            <tr key={grn.id}>
                                                <td className="font-medium whitespace-nowrap text-primary">
                                                    <Link to={`/grns/${grn.id}`}>{grn.grn_number}</Link>
                                                </td>
                                                <td>{grn.purchase_order?.po_number || '-'}</td>
                                                <td>{grn.warehouse?.name || '-'}</td>
                                                <td>{new Date(grn.receipt_date).toLocaleDateString('vi-VN')}</td>
                                                <td>{getQCStatusBadge(grn.overall_qc_status)}</td>
                                                <td>{getPostingStatusBadge(grn.posted)}</td>
                                                <td>
                                                    <Link
                                                        to={`/grns/${grn.id}`}
                                                        className="btn btn-sm btn-ghost text-primary"
                                                    >
                                                        Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.total_pages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                                    <div className="text-sm text-gray-600">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                        {Math.min(pagination.page * pagination.limit, pagination.total_items)} of{' '}
                                        {pagination.total_items} results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                                            disabled={pagination.page === 1}
                                            className="btn btn-sm btn-secondary"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                                            disabled={pagination.page >= pagination.total_pages}
                                            className="btn btn-sm btn-secondary"
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
