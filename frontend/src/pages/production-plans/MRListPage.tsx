import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { useProductionPlans } from '../../hooks/useProductionPlans';
import type { ProductionPlan, ProductionPlanFilters } from '../../types/productionPlan';
import PageSizeSelector from '../../components/common/PageSizeSelector';
import SearchInput from '../../components/common/SearchInput';

const PROCUREMENT_LABELS: Record<string, { label: string; cls: string }> = {
    draft: { label: 'Chưa đặt', cls: 'bg-gray-100 text-gray-500' },
    ordering: { label: 'Đặt hàng', cls: 'bg-yellow-100 text-yellow-700' },
    receiving: { label: 'Nhận hàng', cls: 'bg-blue-100 text-blue-700' },
    received: { label: 'Nhập đủ', cls: 'bg-indigo-100 text-indigo-700' },
    in_production: { label: 'Sản xuất', cls: 'bg-orange-100 text-orange-700' },
    completed: { label: 'Hoàn thành', cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-600' },
};

export default function MRListPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<ProductionPlanFilters>({
        page: 1,
        page_size: 10,
    });

    const { data, isLoading, error } = useProductionPlans(filters);
    const productionPlans = data?.data || [];
    const pagination = data?.pagination;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <span className="badge badge-secondary">Nháp</span>;
            case 'approved': return <span className="badge badge-success">Đã duyệt</span>;
            case 'issued': return <span className="badge badge-warning">Đã xuất</span>;
            case 'closed': return <span className="badge badge-success">Đã đóng</span>;
            case 'cancelled': return <span className="badge badge-danger">Đã hủy</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const getProcurementBadge = (ps: string) => {
        const m = PROCUREMENT_LABELS[ps] || { label: ps, cls: 'bg-gray-100 text-gray-500' };
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>
                {m.label}
            </span>
        );
    };

    const handlePageSizeChange = (size: number) => {
        setFilters({ ...filters, page_size: size, page: 1 });
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kế Hoạch Sản Xuất</h1>
                    <p className="text-gray-600 mt-1">Quản lý kế hoạch và tiến độ sản xuất</p>
                </div>
                <Link to="/production-plans/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo Kế Hoạch Mới
                </Link>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex items-center gap-4">
                    <SearchInput
                        value={filters.search || ''}
                        onChange={(val) => setFilters({ ...filters, search: val, page: 1 })}
                        placeholder="Tìm theo số kế hoạch, phòng ban hoặc mục đích..."
                        width="flex-1"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select className="input" value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
                            <option value="">Tất cả</option>
                            <option value="draft">Nháp</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="issued">Đã xuất</option>
                            <option value="closed">Đã đóng</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiến độ mua hàng</label>
                        <select className="input" value={(filters as any).procurement_status || ''} onChange={(e) => setFilters({ ...filters, procurement_status: e.target.value, page: 1 } as any)}>
                            <option value="">Tất cả</option>
                            <option value="draft">Chưa đặt hàng</option>
                            <option value="ordering">Đang đặt hàng</option>
                            <option value="receiving">Đang nhận hàng</option>
                            <option value="received">Đã nhập đủ</option>
                            <option value="in_production">Đang sản xuất</option>
                            <option value="completed">Hoàn thành</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                        <input type="date" className="input" value={filters.request_date_from || ''} onChange={(e) => setFilters({ ...filters, request_date_from: e.target.value, page: 1 })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                        <input type="date" className="input" value={filters.request_date_to || ''} onChange={(e) => setFilters({ ...filters, request_date_to: e.target.value, page: 1 })} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Đang tải kế hoạch sản xuất...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Lỗi tải kế hoạch: {(error as Error).message}
                    </div>
                ) : productionPlans.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                        <Package className="w-12 h-12 text-gray-200 mx-auto" />
                        <p className="text-gray-500">Chưa có kế hoạch sản xuất nào</p>
                        <Link to="/production-plans/new" className="btn btn-primary inline-flex">
                            Tạo Kế Hoạch Đầu Tiên
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 border-b text-xs uppercase tracking-wide">
                                        <th className="py-3 px-4 text-left font-semibold w-36">Số KHSX</th>
                                        <th className="py-3 px-4 text-left font-semibold">Phòng ban</th>
                                        <th className="py-3 px-4 text-left font-semibold">Kho xuất</th>
                                        <th className="py-3 px-4 text-left font-semibold w-28">Ngày tạo</th>
                                        <th className="py-3 px-4 text-left font-semibold w-28">Trạng thái</th>
                                        <th className="py-3 px-4 text-left font-semibold w-32">Tiến độ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productionPlans.map((mr: ProductionPlan) => (
                                        <tr
                                            key={mr.id}
                                            onClick={() => navigate(`/production-plans/${mr.id}`)}
                                            className="border-b hover:bg-primary/5 transition-colors cursor-pointer"
                                        >
                                            <td className="py-3 px-4">
                                                <span className="font-mono font-semibold text-primary text-sm">{mr.plan_number}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="max-w-[180px] truncate text-sm text-gray-700" title={mr.department}>
                                                    {mr.department || <span className="text-gray-400">—</span>}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="max-w-[150px] truncate text-sm text-gray-600" title={mr.warehouse?.name}>
                                                    {mr.warehouse?.name || <span className="text-gray-400">—</span>}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {new Date(mr.request_date).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="py-3 px-4">{getStatusBadge(mr.status)}</td>
                                            <td className="py-3 px-4">
                                                {getProcurementBadge((mr as any).procurement_status || 'draft')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && (
                            <div className="flex items-center justify-between px-6 py-4 border-t flex-wrap gap-3">
                                <div className="flex items-center gap-4">
                                    <PageSizeSelector
                                        pageSize={filters.page_size || 10}
                                        onChange={handlePageSizeChange}
                                        totalItems={Number(pagination.total_items)}
                                    />
                                    <span className="text-sm text-gray-500">
                                        {(filters.page_size || 0) >= 999999
                                            ? `Tất cả ${pagination.total_items} KHSX`
                                            : `Hiển thị ${((pagination.page - 1) * (filters.page_size || 10)) + 1}–${Math.min(pagination.page * (filters.page_size || 10), Number(pagination.total_items))} / ${pagination.total_items} KHSX`}
                                    </span>
                                </div>
                                {(filters.page_size || 0) < 999999 && pagination.total_pages > 1 && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                                            disabled={pagination.page === 1}
                                            className="btn btn-secondary"
                                        >
                                            Trước
                                        </button>
                                        <span className="text-sm text-gray-600 self-center">
                                            Trang {pagination.page} / {pagination.total_pages}
                                        </span>
                                        <button
                                            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                                            disabled={pagination.page >= pagination.total_pages}
                                            className="btn btn-secondary"
                                        >
                                            Sau
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
