import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSuppliers } from '../../hooks/useSuppliers';
import type { SupplierFilters } from '../../types/supplier';
import PageSizeSelector from '../../components/common/PageSizeSelector';
import SearchInput from '../../components/common/SearchInput';

export default function SupplierListPage() {
    const [filters, setFilters] = useState<SupplierFilters>({
        page: 1,
        page_size: 20,
        sort_by: 'created_at',
        sort_order: 'desc',
    });

    const { data, isLoading, error } = useSuppliers(filters);

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    const handlePageSizeChange = (size: number) => {
        setFilters({ ...filters, page_size: size, page: 1 });
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Đang tải nhà cung cấp...</div>
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
                        Error: {(error as Error).message}
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
                                Nhà Cung Cấp
                            </h1>
                            <p className="text-gray-600 mt-1">Quản lý danh sách nhà cung cấp</p>
                        </div>
                        <Link
                            to="/suppliers/new"
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Thêm Nhà Cung Cấp
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex items-center gap-4">
                        <SearchInput
                            value={filters.search || ''}
                            onChange={(val) => setFilters({ ...filters, search: val, page: 1 })}
                            placeholder="Tìm theo mã, tên, mã số thuế, email..."
                            width="flex-1"
                        />
                        <button className="btn btn-secondary flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Bộ lọc
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
                                        <th>Mã NCC</th>
                                        <th>Tên</th>
                                        <th>Người liên hệ</th>
                                        <th>Điện thoại</th>
                                        <th>Email</th>
                                        <th>Tỉnh/TP</th>
                                        <th className="text-center">Trạng thái</th>
                                        <th className="text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center p-12 text-gray-500">
                                                Chưa có nhà cung cấp nào. Thêm nhà cung cấp đầu tiên để bắt đầu.
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
                                                        <span className="badge badge-success">Đang hoạt động</span>
                                                    ) : (
                                                        <span className="badge badge-secondary">Ngừng hoạt động</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Link
                                                        to={`/suppliers/${supplier.id}/edit`}
                                                        className="text-primary hover:underline text-sm"
                                                    >
                                                        Sửa
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.total_items > 0 && (
                            <div className="flex items-center justify-between p-4 border-t border-gray-200 flex-wrap gap-3">
                                <div className="flex items-center gap-4">
                                    <PageSizeSelector
                                        pageSize={filters.page_size || 20}
                                        onChange={handlePageSizeChange}
                                        totalItems={Number(pagination.total_items)}
                                    />
                                    <span className="text-sm text-gray-500">
                                        {(filters.page_size || 0) >= 999999
                                            ? `Tất cả ${pagination.total_items} nhà cung cấp`
                                            : `Hiển thị ${((pagination.page - 1) * (filters.page_size || 20)) + 1}–${Math.min(pagination.page * (filters.page_size || 20), Number(pagination.total_items))} / ${pagination.total_items} nhà cung cấp`}
                                    </span>
                                </div>
                                {(filters.page_size || 0) < 999999 && pagination.total_pages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="btn btn-secondary btn-sm disabled:opacity-50"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Trước
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            Trang {pagination.page} / {pagination.total_pages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.total_pages}
                                            className="btn btn-secondary btn-sm disabled:opacity-50"
                                        >
                                            Tiếp
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
