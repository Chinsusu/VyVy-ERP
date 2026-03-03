import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMaterials } from '../../hooks/useMaterials';
import type { MaterialFilters } from '../../types/material';
import PageSizeSelector from '../../components/common/PageSizeSelector';

export default function MaterialListPage() {
    const [filters, setFilters] = useState<MaterialFilters>({
        page: 1,
        page_size: 20,
        sort_by: 'updated_at',
        sort_order: 'desc',
    });

    const { data, isLoading, error } = useMaterials(filters);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, search: e.target.value, page: 1 });
    };

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
                        <div className="text-gray-500">Đang tải nguyên vật liệu...</div>
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
                        Lỗi tải dữ liệu: {(error as Error).message}
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
                                Nguyên Vật Liệu
                            </h1>
                            <p className="text-gray-600 mt-1">Quản lý nguyên vật liệu và thành phần</p>
                        </div>
                        <Link
                            to="/materials/new"
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            + Thêm NVL
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
                                placeholder="Tìm theo mã, tên hoặc tên INCI..."
                                className="input pl-10 w-full"
                                value={filters.search || ''}
                                onChange={handleSearch}
                            />
                        </div>
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
                                        <th>Mã</th>
                                        <th>Tên Thương Mại</th>
                                        <th>Loại</th>
                                        <th>Danh Mục</th>
                                        <th>Đơn Vị</th>
                                        <th className="text-center">KCS</th>
                                        <th className="text-center">Nguy Hiểm</th>
                                        <th className="text-center">Trạng Thái</th>
                                        <th className="text-right">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="text-center p-12 text-gray-500">
                                                Chưa có nguyên vật liệu. Thêm NVL đầu tiên để bắt đầu.
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
                                                        <span className="badge badge-warning">Có</span>
                                                    ) : (
                                                        <span className="text-gray-400">Không</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {material.hazardous ? (
                                                        <span className="badge badge-danger">Có</span>
                                                    ) : (
                                                        <span className="text-gray-400">Không</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {material.is_active ? (
                                                        <span className="badge badge-success">Đang HĐ</span>
                                                    ) : (
                                                        <span className="badge badge-secondary">Ngừng HĐ</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Link
                                                        to={`/materials/${material.id}/edit`}
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
                                            ? `Tất cả ${pagination.total_items} NVL`
                                            : `Hiển thị ${((pagination.page - 1) * (filters.page_size || 20)) + 1}–${Math.min(pagination.page * (filters.page_size || 20), Number(pagination.total_items))} / ${pagination.total_items} NVL`}
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
