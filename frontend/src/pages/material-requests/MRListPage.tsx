import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText } from 'lucide-react';
import { useMaterialRequests } from '../../hooks/useMaterialRequests';
import type { MaterialRequest, MaterialRequestFilters } from '../../types/materialRequest';

export default function MRListPage() {
    const [filters, setFilters] = useState<MaterialRequestFilters>({
        page: 1,
        page_size: 10,
    });

    const { data, isLoading, error } = useMaterialRequests(filters);
    const materialRequests = data?.data || [];
    const pagination = data?.pagination;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="badge badge-secondary">Draft</span>;
            case 'approved':
                return <span className="badge badge-primary">Approved</span>;
            case 'issued':
                return <span className="badge badge-warning">Issued</span>;
            case 'closed':
                return <span className="badge badge-success">Closed</span>;
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
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Material Requests</h1>
                        <p className="text-gray-600 mt-1">Manage production material requests</p>
                    </div>
                    <Link to="/material-requests/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        New Material Request
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
                                placeholder="Search by MR number, department or purpose..."
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
                                <option value="issued">Issued</option>
                                <option value="closed">Closed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Request Date From</label>
                            <input
                                type="date"
                                className="input"
                                value={filters.request_date_from || ''}
                                onChange={(e) => setFilters({ ...filters, request_date_from: e.target.value, page: 1 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Request Date To</label>
                            <input
                                type="date"
                                className="input"
                                value={filters.request_date_to || ''}
                                onChange={(e) => setFilters({ ...filters, request_date_to: e.target.value, page: 1 })}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">Loading material requests...</div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                            Error loading material requests: {(error as Error).message}
                        </div>
                    ) : materialRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No material requests found</p>
                            <Link to="/material-requests/new" className="btn btn-primary">
                                Create Your First Material Request
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="w-32">MR Number</th>
                                            <th>Department</th>
                                            <th>Warehouse</th>
                                            <th className="w-32">Request Date</th>
                                            <th className="w-24">Status</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materialRequests.map((mr: MaterialRequest) => (
                                            <tr key={mr.id}>
                                                <td className="font-mono font-semibold text-primary">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 opacity-50" />
                                                        {mr.mr_number}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="max-w-[200px] truncate" title={mr.department}>
                                                        {mr.department}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="max-w-[150px] truncate" title={mr.warehouse?.name}>
                                                        {mr.warehouse?.name || <span className="text-gray-400">-</span>}
                                                    </div>
                                                </td>
                                                <td className="text-gray-600">
                                                    {new Date(mr.request_date).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td>{getStatusBadge(mr.status)}</td>
                                                <td>
                                                    <div className="flex justify-end gap-3">
                                                        <Link
                                                            to={`/material-requests/${mr.id}`}
                                                            className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                                                        >
                                                            View
                                                        </Link>
                                                        {mr.status === 'draft' && (
                                                            <Link
                                                                to={`/material-requests/${mr.id}/edit`}
                                                                className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
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
