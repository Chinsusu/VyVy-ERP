import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Factory, CheckCircle, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProductionPlans } from '../../hooks/useProductionPlans';
import type { ProductionPlan, ProductionPlanFilters } from '../../types/productionPlan';
import PageSizeSelector from '../../components/common/PageSizeSelector';
import SearchInput from '../../components/common/SearchInput';

const STATUS_TABS = [
    { label: 'Tất cả', value: '' },
    { label: 'Nháp', value: 'draft' },
    { label: 'Đã duyệt', value: 'approved' },
    { label: 'Đã hủy', value: 'cancelled' },
];

const STATUS_DOT: Record<string, string> = {
    draft: 'bg-gray-400',
    approved: 'bg-green-500',
    cancelled: 'bg-red-400',
};

const PROCUREMENT_LABELS: Record<string, { label: string; cls: string }> = {
    not_started: { label: 'Chưa mua hàng', cls: 'bg-gray-100 text-gray-500' },
    draft: { label: 'Chưa đặt', cls: 'bg-gray-100 text-gray-500' },
    ordering: { label: 'Đặt hàng', cls: 'bg-yellow-100 text-yellow-700' },
    receiving: { label: 'Nhận hàng', cls: 'bg-blue-100 text-blue-700' },
    received: { label: 'Nhập đủ', cls: 'bg-indigo-100 text-indigo-700' },
    in_production: { label: 'Sản xuất', cls: 'bg-orange-100 text-orange-700' },
    completed: { label: 'Hoàn thành', cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-600' },
};

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
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>{m.label}</span>;
};

export default function MRListPage() {
    const navigate = useNavigate();
    const [activeStatus, setActiveStatus] = useState('');
    const [filters, setFilters] = useState<ProductionPlanFilters>({
        page: 1,
        page_size: 10,
    });

    const effectiveFilters = { ...filters, status: activeStatus || undefined };
    const { data, isLoading, error } = useProductionPlans(effectiveFilters);
    const productionPlans = data?.data || [];
    const pagination = data?.pagination;

    const handlePageChange = (newPage: number) => setFilters({ ...filters, page: newPage });
    const handlePageSizeChange = (size: number) => setFilters({ ...filters, page_size: size, page: 1 });
    const handleStatusChange = (val: string) => { setActiveStatus(val); setFilters({ ...filters, page: 1 }); };

    const approvedCount = productionPlans.filter(p => p.status === 'approved').length;
    const inProgressCount = productionPlans.filter(p => {
        const ps = (p as any).procurement_status;
        return ps && ps !== 'not_started' && ps !== 'draft' && ps !== 'completed' && ps !== 'cancelled';
    }).length;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Factory className="w-8 h-8 text-primary" />
                        Kế Hoạch Sản Xuất
                    </h1>
                    <p className="text-gray-600 mt-1">Quản lý kế hoạch và tiến độ sản xuất</p>
                </div>
                <Link to="/production-plans/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Tạo Kế Hoạch Mới
                </Link>
            </div>

            {/* Stats Bar */}
            {pagination && pagination.total_items > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                            <Factory className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{pagination.total_items}</p>
                            <p className="text-xs text-gray-500">Tổng kế hoạch</p>
                        </div>
                    </div>
                    <div className="card py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-50">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                            <p className="text-xs text-gray-500">Đã duyệt</p>
                        </div>
                    </div>
                    <div className="card py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                            <p className="text-xs text-gray-500">Đang tiến hành</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search + Status Tabs */}
            <div className="card mb-0 rounded-b-none border-b-0">
                <SearchInput
                    value={filters.search || ''}
                    onChange={(val) => setFilters({ ...filters, search: val, page: 1 })}
                    placeholder="Tìm theo số kế hoạch, phòng ban..."
                    width="flex-1"
                />
                <div className="flex gap-1 mt-4 border-b border-gray-200 -mx-6 px-6">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => handleStatusChange(tab.value)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeStatus === tab.value
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.value && <span className={`w-2 h-2 rounded-full inline-block ${STATUS_DOT[tab.value]}`} />}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card shadow-md rounded-t-none">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-gray-400 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                            Đang tải kế hoạch sản xuất...
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 m-6">
                        Lỗi tải kế hoạch: {(error as Error).message}
                    </div>
                ) : (
                    <div className="table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th>Số KHSX</th>
                                        <th>Phòng ban</th>
                                        <th>Kho xuất</th>
                                        <th>Ngày tạo</th>
                                        <th className="text-center">Trạng thái</th>
                                        <th className="text-center">Tiến độ MH</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productionPlans.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center p-16">
                                                <Factory className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">Chưa có kế hoạch sản xuất nào</p>
                                                <Link to="/production-plans/new" className="btn btn-primary mt-4 inline-flex items-center gap-2">
                                                    <Plus className="w-4 h-4" /> Tạo kế hoạch đầu tiên
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        productionPlans.map((mr: ProductionPlan) => (
                                            <tr
                                                key={mr.id}
                                                onClick={() => navigate(`/production-plans/${mr.id}`)}
                                                className="border-b border-gray-50 hover:bg-primary/5 transition-colors cursor-pointer"
                                            >
                                                <td className="p-4">
                                                    <span className="font-mono font-semibold text-primary text-sm">{mr.plan_number}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="max-w-[180px] truncate text-sm text-gray-700" title={mr.department}>
                                                        {mr.department || <span className="text-gray-400">—</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="max-w-[150px] truncate text-sm text-gray-600" title={mr.warehouse?.name}>
                                                        {mr.warehouse?.name || <span className="text-gray-400">—</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {new Date(mr.request_date).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="p-4 text-center">{getStatusBadge(mr.status)}</td>
                                                <td className="p-4 text-center">
                                                    {getProcurementBadge((mr as any).procurement_status || 'not_started')}
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
                                    <PageSizeSelector pageSize={filters.page_size || 10} onChange={handlePageSizeChange} totalItems={Number(pagination.total_items)} />
                                    <span className="text-sm text-gray-500">
                                        {(filters.page_size || 0) >= 999999
                                            ? `Tất cả ${pagination.total_items} KHSX`
                                            : `${((pagination.page - 1) * (filters.page_size || 10)) + 1}–${Math.min(pagination.page * (filters.page_size || 10), Number(pagination.total_items))} / ${pagination.total_items} KHSX`}
                                    </span>
                                </div>
                                {(filters.page_size || 0) < 999999 && pagination.total_pages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="btn btn-secondary btn-sm disabled:opacity-50">
                                            <ChevronLeft className="w-4 h-4" />Trước
                                        </button>
                                        <span className="text-sm text-gray-600">{pagination.page} / {pagination.total_pages}</span>
                                        <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.total_pages} className="btn btn-secondary btn-sm disabled:opacity-50">
                                            Tiếp<ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
