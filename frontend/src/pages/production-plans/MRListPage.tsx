import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { useProductionPlans } from '../../hooks/useProductionPlans';
import type { ProductionPlan, ProductionPlanFilters } from '../../types/productionPlan';
import PageSizeSelector from '../../components/common/PageSizeSelector';
import SearchInput from '../../components/common/SearchInput';

export default function MRListPage() {
    const [filters, setFilters] = useState<ProductionPlanFilters>({
        page: 1,
        page_size: 10,
    });

    const { data, isLoading, error } = useProductionPlans(filters);
    const productionPlans = data?.data || [];
    const pagination = data?.pagination;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="badge badge-secondary">Nháp</span>;
            case 'approved':
                return <span className="badge badge-primary">Đã duyệt</span>;
            case 'issued':
                return <span className="badge badge-warning">Đã xuất</span>;
            case 'closed':
                return <span className="badge badge-success">Đã đóng</span>;
            case 'cancelled':
                return <span className="badge badge-danger">Đã hủy</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const handlePageSizeChange = (size: number) => {
        setFilters({ ...filters, page_size: size, page: 1 });
    };

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kế Hoạch Sản Xuất</h1>
                        <p className="text-gray-600 mt-1">Quản lý kế hoạch sản xuất</p>
                    </div>
                    <Link to="/production-plans/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tạo Kế Hoạch Mới
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="card mb-6">
                    <div className="flex items-center gap-4">
                        <SearchInput
                            value={filters.search || ''}
                            onChange={(val) => setFilters({ ...filters, search: val, page: 1 })}
                            placeholder="Tìm theo số kế hoạch, phòng ban hoặc mục đích..."
                            width="flex-1"
                        />
                    </div>

                    {/* Additional Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select
                                className="input"
                                value={filters.status || ''}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            >
                                <option value="">Tất cả</option>
                                <option value="draft">Nháp</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="issued">Đã xuất</option>
                                <option value="closed">Đã đóng</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                            <input
                                type="date"
                                className="input"
                                value={filters.request_date_from || ''}
                                onChange={(e) => setFilters({ ...filters, request_date_from: e.target.value, page: 1 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
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
                            <div className="text-gray-500">Đang tải kế hoạch sản xuất...</div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                            Lỗi tải kế hoạch sản xuất: {(error as Error).message}
                        </div>
                    ) : productionPlans.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">Chưa có kế hoạch sản xuất nào</p>
                            <Link to="/production-plans/new" className="btn btn-primary">
                                Tạo Kế Hoạch Sản Xuất Đầu Tiên
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="w-32">Số MR</th>
                                            <th>Phòng ban</th>
                                            <th>Kho</th>
                                            <th className="w-32">Ngày tạo</th>
                                            <th className="w-24">Trạng thái</th>
                                            <th className="text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productionPlans.map((mr: ProductionPlan) => (
                                            <tr key={mr.id}>
                                                <td className="font-mono font-semibold text-primary">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 opacity-50" />
                                                        {mr.plan_number}
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
                                                            to={`/production-plans/${mr.id}`}
                                                            className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                                                        >
                                                            Xem
                                                        </Link>
                                                        {mr.status === 'draft' && (
                                                            <Link
                                                                to={`/production-plans/${mr.id}/edit`}
                                                                className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                                                            >
                                                                Sửa
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
        </div>
    );
}
