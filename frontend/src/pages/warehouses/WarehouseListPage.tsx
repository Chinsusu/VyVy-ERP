import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Warehouse as WarehouseIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWarehouses } from '../../hooks/useWarehouses';
import type { WarehouseFilters } from '../../types/warehouse';
import PageSizeSelector from '../../components/common/PageSizeSelector';
import SearchInput from '../../components/common/SearchInput';

const WAREHOUSE_TYPE_LABELS: Record<string, string> = {
    main: 'Kho Tổng',
    satellite: 'Kho Vệ Tinh',
    returns: 'Kho Hoàn Hàng',
    staging: 'Kho Trung Chuyển',
    other: 'Khác',
};

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

    const handlePageSizeChange = (size: number) => {
        setFilters({ ...filters, page_size: size, page: 1 });
    };

    if (error) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Lỗi tải kho hàng: {(error as Error).message}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <WarehouseIcon className="w-8 h-8 text-primary" />
                                Kho Hàng
                            </h1>
                            <p className="text-gray-600 mt-1">Quản lý kho hàng và vị trí lưu trữ</p>
                        </div>
                        <Link to="/warehouses/new" className="btn btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Thêm Kho Hàng
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex items-center gap-4">
                        <SearchInput
                            value={filters.search || ''}
                            onChange={(val) => handleSearch({ target: { value: val } } as any)}
                            placeholder="Tìm theo mã hoặc tên kho..."
                            width="w-80"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="card shadow-md">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-gray-500 flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                Đang tải kho hàng...
                            </div>
                        </div>
                    ) : warehouses.length === 0 ? (
                        <div className="text-center py-12">
                            <WarehouseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Chưa có kho hàng nào</p>
                            <Link to="/warehouses/new" className="btn btn-primary mt-4">
                                Tạo Kho Hàng Đầu Tiên
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="w-32">Mã kho</th>
                                            <th className="min-w-[180px]">Tên kho</th>
                                            <th>Loại kho</th>
                                            <th>Tỉnh/TP</th>
                                            <th>Vị trí</th>
                                            <th>Trạng thái</th>
                                            <th className="text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {warehouses.map((warehouse) => (
                                            <tr key={warehouse.id}>
                                                <td className="font-mono font-semibold text-primary">{warehouse.code}</td>
                                                <td>
                                                    <div className="max-w-[250px] truncate font-medium text-gray-900" title={warehouse.name}>
                                                        {warehouse.name}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-secondary">
                                                        {WAREHOUSE_TYPE_LABELS[warehouse.warehouse_type] || warehouse.warehouse_type}
                                                    </span>
                                                </td>
                                                <td>{warehouse.city || <span className="text-gray-400">-</span>}</td>
                                                <td>
                                                    <span className="badge badge-info">
                                                        {warehouse.locations_count || 0} vị trí
                                                    </span>
                                                </td>
                                                <td>
                                                    {warehouse.is_active ? (
                                                        <span className="badge badge-success">Đang hoạt động</span>
                                                    ) : (
                                                        <span className="badge badge-secondary">Ngừng hoạt động</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex justify-end gap-3">
                                                        <Link
                                                            to={`/warehouses/${warehouse.id}`}
                                                            className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                                                        >
                                                            Xem
                                                        </Link>
                                                        <Link
                                                            to={`/warehouses/${warehouse.id}/edit`}
                                                            className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                                                        >
                                                            Sửa
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.total_items > 0 && (
                                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-4">
                                        <PageSizeSelector
                                            pageSize={filters.page_size || 20}
                                            onChange={handlePageSizeChange}
                                            totalItems={Number(pagination.total_items)}
                                        />
                                        <span className="text-sm text-gray-500">
                                            {(filters.page_size || 0) >= 999999
                                                ? `Tất cả ${pagination.total_items} kho`
                                                : `Hiển thị ${(pagination.page - 1) * (filters.page_size || 20) + 1}–${Math.min(pagination.page * (filters.page_size || 20), Number(pagination.total_items))} / ${pagination.total_items} kho`}
                                        </span>
                                    </div>
                                    {(filters.page_size || 0) < 999999 && pagination.total_pages > 1 && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 1}
                                                className="btn btn-secondary btn-sm disabled:opacity-50"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Trước
                                            </button>
                                            <span className="text-sm text-gray-600 self-center">
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
