import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMaterials } from '../../hooks/useMaterials';
import type { MaterialFilters } from '../../types/material';

export default function MaterialListPage() {
    const [filters, setFilters] = useState<MaterialFilters>({
        page: 1,
        page_size: 20,
        sort_by: 'created_at',
        sort_order: 'desc',
    });

    const { data, isLoading, error } = useMaterials(filters);

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
                        <div className="text-gray-500">Loading materials...</div>
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
                        Error loading materials: {(error as Error).message}
                    </div>
                </div>
            </div>
        );
    }

    const materials = data?.data || [];
    const pagination = data?.pagination;

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Package className="w-8 h-8 text-primary" />
                                Materials
                            </h1>
                            <p className="text-gray-600 mt-1">Manage raw materials and ingredients</p>
                        </div>
                        <Link
                            to="/materials/new"
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Material
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
                                placeholder="Search by code, name, or INCI name..."
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
                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left p-4 font-semibold text-gray-700">Code</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Trading Name</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Unit</th>
                                    <th className="text-center p-4 font-semibold text-gray-700">QC</th>
                                    <th className="text-center p-4 font-semibold text-gray-700">Hazardous</th>
                                    <th className="text-center p-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-right p-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center p-12 text-gray-500">
                                            No materials found. Add your first material to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    materials.map((material) => (
                                        <tr key={material.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4">
                                                <Link
                                                    to={`/materials/${material.id}`}
                                                    className="text-primary font-medium hover:underline"
                                                >
                                                    {material.code}
                                                </Link>
                                            </td>
                                            <td className="p-4">{material.trading_name}</td>
                                            <td className="p-4">
                                                <span className="badge badge-secondary">{material.material_type}</span>
                                            </td>
                                            <td className="p-4 text-gray-600">{material.category || '-'}</td>
                                            <td className="p-4">{material.unit}</td>
                                            <td className="p-4 text-center">
                                                {material.requires_qc ? (
                                                    <span className="badge badge-warning">Yes</span>
                                                ) : (
                                                    <span className="text-gray-400">No</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {material.hazardous ? (
                                                    <span className="badge badge-danger">Yes</span>
                                                ) : (
                                                    <span className="text-gray-400">No</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {material.is_active ? (
                                                    <span className="badge badge-success">Active</span>
                                                ) : (
                                                    <span className="badge badge-secondary">Inactive</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link
                                                    to={`/materials/${material.id}/edit`}
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
                                {pagination.total} materials
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
    );
}
