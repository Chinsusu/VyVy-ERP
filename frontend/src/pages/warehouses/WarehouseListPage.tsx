import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Warehouse as WarehouseIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWarehouses } from '../../hooks/useWarehouses';
import type { WarehouseFilters } from '../../types/warehouse';

export default function WarehouseListPage() {
    const [filters, setFilters] = useState<WarehouseFilters>({
        page: 1,
        page_size: 20,
    });

    const { data, isLoading, error } = useWarehouses(filters);
    const warehouses = data?.data || [];
    const pagination = data?.pagination;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, search: e.target.value, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Error loading warehouses: {(error as Error).message}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <WarehouseIcon className="w-8 h-8 text-primary" />
                                Warehouses
                            </h1>
                            <p className="text-gray-600 mt-1">Manage warehouse locations and facilities</p>
                        </div>
                        <Link to="/warehouses/new" className="btn btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add Warehouse
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by code or name..."
                                className="input pl-10 w-full"
                                value={filters.search || ''}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-gray-500">Loading warehouses...</div>
                        </div>
                    ) : warehouses.length === 0 ? (
                        <div className="text-center py-12">
                            <WarehouseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No warehouses found</p>
                            <Link to="/warehouses/new" className="btn btn-primary mt-4">
                                Create First Warehouse
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>City</th>
                                            <th>Locations</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {warehouses.map((warehouse) => (
                                            <tr key={warehouse.id}>
                                                <td className="font-mono font-semibold">{warehouse.code}</td>
                                                <td>{warehouse.name}</td>
                                                <td>
                                                    <span className="badge badge-secondary capitalize">
                                                        {warehouse.warehouse_type}
                                                    </span>
                                                </td>
                                                <td>{warehouse.city || '-'}</td>
                                                <td>
                                                    <span className="badge badge-info">
                                                        {warehouse.locations_count || 0} locations
                                                    </span>
                                                </td>
                                                <td>
                                                    {warehouse.is_active ? (
                                                        <span className="badge badge-success">Active</span>
                                                    ) : (
                                                        <span className="badge badge-secondary">Inactive</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <Link
                                                            to={`/warehouses/${warehouse.id}`}
                                                            className="text-primary hover:underline text-sm"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            to={`/warehouses/${warehouse.id}/edit`}
                                                            className="text-primary hover:underline text-sm"
                                                        >
                                                            Edit
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.total > 0 && (
                                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {(pagination.page - 1) * pagination.page_size + 1} to{' '}
                                        {Math.min(pagination.page * pagination.page_size, pagination.total)} of{' '}
                                        {pagination.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.total_pages}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
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
