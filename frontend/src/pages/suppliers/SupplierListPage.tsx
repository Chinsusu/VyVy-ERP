import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSuppliers } from '../../hooks/useSuppliers';
import type { SupplierFilters } from '../../types/supplier';

export default function SupplierListPage() {
    const [filters, setFilters] = useState<SupplierFilters>({
        page: 1,
        page_size: 20,
        sort_by: 'created_at',
        sort_order: 'desc',
    });

    const { data, isLoading, error } = useSuppliers(filters);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, search: e.target.value, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading suppliers...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Error loading suppliers: {(error as Error).message}
                    </div>
                </div>
            </div>
        );
    }

    const suppliers = data?.data || [];
    const pagination = data?.pagination;

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Users className="w-8 h-8 text-primary" />
                                Suppliers
                            </h1>
                            <p className="text-gray-600 mt-1">Manage suppliers and vendors</p>
                        </div>
                        <Link
                            to="/suppliers/new"
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Supplier
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by code, name, tax code, email..."
                                className="input pl-10 w-full"
                                value={filters.search || ''}
                                onChange={handleSearch}
                            />
                        </div>
                        <button className="btn btn-secondary flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="card shadow-md">
                    <div className="table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>Contact Person</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>City</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center p-12 text-gray-500">
                                                No suppliers found. Add your first supplier to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        suppliers.map((supplier) => (
                                            <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4">
                                                    <Link
                                                        to={`/suppliers/${supplier.id}`}
                                                        className="text-primary font-medium hover:underline"
                                                    >
                                                        {supplier.code}
                                                    </Link>
                                                </td>
                                                <td className="p-4">{supplier.name}</td>
                                                <td className="p-4 text-gray-600">{supplier.contact_person || '-'}</td>
                                                <td className="p-4 text-gray-600">{supplier.phone || '-'}</td>
                                                <td className="p-4 text-gray-600">{supplier.email || '-'}</td>
                                                <td className="p-4">{supplier.city || '-'}</td>
                                                <td className="p-4 text-center">
                                                    {supplier.is_active ? (
                                                        <span className="badge badge-success">Active</span>
                                                    ) : (
                                                        <span className="badge badge-secondary">Inactive</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Link
                                                        to={`/suppliers/${supplier.id}/edit`}
                                                        className="text-primary hover:underline text-sm"
                                                    >
                                                        Edit
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.total > 0 && (
                            <div className="flex items-center justify-between p-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Showing {((pagination.page - 1) * pagination.page_size) + 1} to{' '}
                                    {Math.min(pagination.page * pagination.page_size, pagination.total)} of{' '}
                                    {pagination.total} suppliers
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="btn btn-secondary btn-sm disabled:opacity-50"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {pagination.page} of {pagination.total_pages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.total_pages}
                                        className="btn btn-secondary btn-sm disabled:opacity-50"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
