import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ClipboardList } from 'lucide-react';
import { useMaterialIssueNotes } from '../../hooks/useMaterialIssueNotes';
import type { MaterialIssueNote, MaterialIssueNoteFilters } from '../../types/materialIssueNote';

export default function MINListPage() {
    const [filters, setFilters] = useState<MaterialIssueNoteFilters>({
        page: 1,
        limit: 10,
    });

    const { data, isLoading, error } = useMaterialIssueNotes(filters);
    const issueNotes = data?.data.items || [];
    const totalItems = data?.data.total || 0;
    const totalPages = Math.ceil(totalItems / (filters.limit || 10));

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="badge badge-secondary">Draft</span>;
            case 'posted':
                return <span className="badge badge-success">Posted</span>;
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
            min_number: formData.get('search') as string,
            page: 1,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Material Issue Notes</h1>
                        <p className="text-gray-600 mt-1">Track material issuance to production</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="card mb-6">
                    <form onSubmit={handleSearch} className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search by MIN number..."
                                className="input pl-10 w-full"
                                defaultValue={filters.min_number}
                            />
                        </div>
                        <button type="submit" className="btn btn-secondary">
                            Search
                        </button>
                    </form>

                    {/* Additional Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="input"
                                value={filters.status || ''}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            >
                                <option value="">All Statuses</option>
                                <option value="draft">Draft</option>
                                <option value="posted">Posted</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
                            <select
                                className="input"
                                value={filters.limit || 10}
                                onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value), page: 1 })}
                            >
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">Loading issue notes...</div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                            Error loading issue notes: {(error as Error).message}
                        </div>
                    ) : issueNotes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No material issue notes found</p>
                            <p className="text-sm text-gray-400">Create a MIN from an approved Material Request</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>MIN Number</th>
                                            <th>Linked MR</th>
                                            <th>Warehouse</th>
                                            <th>Issue Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {issueNotes.map((min: MaterialIssueNote) => (
                                            <tr key={min.id}>
                                                <td className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <ClipboardList className="w-4 h-4 text-gray-400" />
                                                        {min.min_number}
                                                    </div>
                                                </td>
                                                <td>
                                                    <Link to={`/material-requests/${min.material_request_id}`} className="text-primary-600 hover:underline">
                                                        {min.material_request?.mr_number || `#${min.material_request_id}`}
                                                    </Link>
                                                </td>
                                                <td>{min.warehouse?.name || '-'}</td>
                                                <td>{new Date(min.issue_date).toLocaleDateString('vi-VN')}</td>
                                                <td>{getStatusBadge(min.status)}</td>
                                                <td>
                                                    <Link
                                                        to={`/material-issue-notes/${min.id}`}
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
                                        Showing {((filters.page! - 1) * filters.limit!) + 1} to{' '}
                                        {Math.min(filters.page! * filters.limit!, totalItems)} of{' '}
                                        {totalItems} results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                                            disabled={filters.page === 1}
                                            className="btn btn-secondary"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                                            disabled={filters.page! >= totalPages}
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
