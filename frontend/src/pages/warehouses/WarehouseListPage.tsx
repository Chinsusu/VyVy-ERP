import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Warehouse as WarehouseIcon, ChevronLeft, ChevronRight, FlaskConical, ShoppingBag, Factory, CheckCircle, MapPin } from 'lucide-react';
import { useWarehouses } from '../../hooks/useWarehouses';
import type { WarehouseFilters } from '../../types/warehouse';
import PageSizeSelector from '../../components/common/PageSizeSelector';
import SearchInput from '../../components/common/SearchInput';

const WAREHOUSE_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
    lab: { label: 'Kho Lab', icon: <FlaskConical className="w-3.5 h-3.5" />, badge: 'bg-blue-100 text-blue-700 border border-blue-200' },
    commercial: { label: 'Kho Bán Hàng', icon: <ShoppingBag className="w-3.5 h-3.5" />, badge: 'bg-purple-100 text-purple-700 border border-purple-200' },
    factory: { label: 'Kho Nhà Máy', icon: <Factory className="w-3.5 h-3.5" />, badge: 'bg-orange-100 text-orange-700 border border-orange-200' },
};

const TYPE_FILTER_TABS = [
    { key: '', label: 'Tất cả' },
    { key: 'lab', label: 'Kho Lab' },
    { key: 'commercial', label: 'Kho Bán Hàng' },
    { key: 'factory', label: 'Kho Nhà Máy' },
];

export default function WarehouseListPage() {
    const [filters, setFilters] = useState<WarehouseFilters>({
        page: 1,
        page_size: 20,
    });
    const [typeFilter, setTypeFilter] = useState('');

    const { data, isLoading, error } = useWarehouses(filters);
    const warehouses = data?.data || [];
    const pagination = data?.pagination;

    // Apply local type filter
    const filteredWarehouses = typeFilter
        ? warehouses.filter((w) => w.warehouse_type === typeFilter)
        : warehouses;

    // Stats
    const totalActive = warehouses.filter((w) => w.is_active).length;
    const totalLocations = warehouses.reduce((sum, w) => sum + (w.locations_count || 0), 0);

    const handleSearch = (val: string) => {
        setFilters({ ...filters, search: val, page: 1 });
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    Lỗi tải kho hàng: {(error as Error).message}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <WarehouseIcon className="w-8 h-8 text-primary" />
                            Kho Hàng
                        </h1>
                        <p className="text-gray-500 mt-1">Quản lý kho hàng và vị trí lưu trữ</p>
                    </div>
                    <Link to="/warehouses/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Thêm Kho Hàng
                    </Link>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card py-4 flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                        <WarehouseIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : (pagination?.total_items ?? warehouses.length)}</p>
                        <p className="text-xs text-gray-500">Tổng số kho</p>
                    </div>
                </div>
                <div className="card py-4 flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-50">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : totalActive}</p>
                        <p className="text-xs text-gray-500">Đang hoạt động</p>
                    </div>
                </div>
                <div className="card py-4 flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50">
                        <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : totalLocations}</p>
                        <p className="text-xs text-gray-500">Tổng vị trí</p>
                    </div>
                </div>
            </div>

            {/* Filter + Search — merged card */}
            <div className="card mb-0 rounded-b-none border-b-0">
                <SearchInput
                    value={filters.search || ''}
                    onChange={handleSearch}
                    placeholder="Tìm theo mã hoặc tên kho..."
                    width="flex-1"
                />
                <div className="flex gap-1 mt-4 border-b border-gray-200 -mx-6 px-6">
                    {TYPE_FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setTypeFilter(tab.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${typeFilter === tab.key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card shadow-md rounded-t-none">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-gray-500 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            Đang tải kho hàng...
                        </div>
                    </div>
                ) : filteredWarehouses.length === 0 ? (
                    <div className="text-center py-16">
                        <WarehouseIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Chưa có kho hàng nào</p>
                        {typeFilter && (
                            <p className="text-gray-400 text-sm mt-1">Không có kho loại «{WAREHOUSE_TYPE_CONFIG[typeFilter]?.label}»</p>
                        )}
                        {!typeFilter && (
                            <Link to="/warehouses/new" className="btn btn-primary mt-4">
                                Tạo Kho Hàng Đầu Tiên
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="w-32">Mã kho</th>
                                        <th className="min-w-[200px]">Tên kho</th>
                                        <th>Loại kho</th>
                                        <th>Tỉnh/TP</th>
                                        <th className="text-center">Vị trí</th>
                                        <th className="text-center">Trạng thái</th>
                                        <th className="text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWarehouses.map((warehouse) => {
                                        const typeConfig = WAREHOUSE_TYPE_CONFIG[warehouse.warehouse_type?.toLowerCase()] || WAREHOUSE_TYPE_CONFIG['other'];
                                        return (
                                            <tr key={warehouse.id}>
                                                <td>
                                                    <Link
                                                        to={`/warehouses/${warehouse.id}`}
                                                        className="font-mono font-semibold text-primary hover:underline"
                                                    >
                                                        {warehouse.code}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <div className="font-medium text-gray-900">{warehouse.name}</div>
                                                </td>
                                                <td>
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.badge}`}>
                                                        {typeConfig.icon}
                                                        {typeConfig.label}
                                                    </span>
                                                </td>
                                                <td className="text-gray-600 text-sm">
                                                    {warehouse.city || <span className="text-gray-300">—</span>}
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge badge-info">
                                                        {warehouse.locations_count || 0} vị trí
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    {warehouse.is_active ? (
                                                        <span className="badge badge-success">Hoạt động</span>
                                                    ) : (
                                                        <span className="badge badge-secondary">Dừng</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex justify-end gap-3">
                                                        <Link
                                                            to={`/warehouses/${warehouse.id}`}
                                                            className="text-primary hover:text-primary-dark font-medium text-sm"
                                                        >
                                                            Xem
                                                        </Link>
                                                        <Link
                                                            to={`/warehouses/${warehouse.id}/edit`}
                                                            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                                                        >
                                                            Sửa
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
                                            : `Hiển thị ${(pagination.page - 1) * (pagination.limit || filters.page_size || 20) + 1}–${Math.min(pagination.page * (pagination.limit || filters.page_size || 20), Number(pagination.total_items))} / ${pagination.total_items} kho`}
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
    );
}
