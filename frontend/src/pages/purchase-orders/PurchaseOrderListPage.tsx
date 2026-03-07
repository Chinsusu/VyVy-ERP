import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import type { PurchaseOrder, PurchaseOrderFilters } from '../../types/purchaseOrder';
import PageSizeSelector from '../../components/common/PageSizeSelector';
import SearchInput from '../../components/common/SearchInput';

const STATUS_TABS = [
    { label: 'Tất cả', value: '' },
    { label: 'Nháp', value: 'draft' },
    { label: 'Đã duyệt', value: 'approved' },
    { label: 'Hoàn thành', value: 'completed' },
    { label: 'Đã hủy', value: 'cancelled' },
];

const STATUS_DOT: Record<string, string> = {
    draft: 'bg-gray-400',
    approved: 'bg-green-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-400',
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'draft': return <span className="badge badge-secondary">Nháp</span>;
        case 'approved': return <span className="badge badge-success">Đã duyệt</span>;
        case 'completed': return <span className="badge badge-info">Hoàn thành</span>;
        case 'cancelled': return <span className="badge badge-danger">Đã hủy</span>;
        default: return <span className="badge">{status}</span>;
    }
};

export default function PurchaseOrderListPage() {
    const [activeStatus, setActiveStatus] = useState('');
    const [filters, setFilters] = useState<PurchaseOrderFilters>({
        page: 1,
        page_size: 10,
        sort_by: 'updated_at',
        sort_order: 'desc',
    });

    const effectiveFilters = { ...filters, status: activeStatus || undefined };
    const { data, isLoading, error } = usePurchaseOrders(effectiveFilters);
    const purchaseOrders = data?.data || [];
    const pagination = data?.pagination;

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    const handlePageSizeChange = (size: number) => {
        setFilters({ ...filters, page_size: size, page: 1 });
    };

    const handleStatusChange = (status: string) => {
        setActiveStatus(status);
        setFilters({ ...filters, page: 1 });
    };

    const approvedCount = purchaseOrders.filter(po => po.status === 'approved').length;
    const draftCount = purchaseOrders.filter(po => po.status === 'draft').length;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                        Đơn Mua Hàng
                    </h1>
                    <p className="text-gray-600 mt-1">Quản lý đơn đặt mua hàng từ nhà cung cấp</p>
                </div>
                <Link to="/purchase-orders/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Thêm Đơn Mua Hàng
                </Link>
            </div>

            {/* Stats Bar */}
            {pagination && pagination.total_items > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{pagination.total_items}</p>
                            <p className="text-xs text-gray-500">Tổng đơn hàng</p>
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
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50">
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
                            <p className="text-xs text-gray-500">Đang nháp</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search + Status Tabs */}
            <div className="card mb-0 rounded-b-none border-b-0">
                <SearchInput
                    value={filters.search || ''}
                    onChange={(val) => setFilters({ ...filters, search: val, page: 1 })}
                    placeholder="Tìm theo số PO, nhà cung cấp..."
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
                            Đang tải...
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 m-6">
                        Lỗi: {(error as Error).message}
                    </div>
                ) : (
                    <div className="table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th>Số PO</th>
                                        <th>Nhà cung cấp</th>
                                        <th>Phụ trách</th>
                                        <th>Kho nhận hàng</th>
                                        <th>Ngày đặt hàng</th>
                                        <th className="text-center">Trạng thái</th>
                                        <th className="text-right">Tổng tiền</th>
                                        <th className="text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchaseOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center p-16">
                                                <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">Không có đơn mua hàng nào</p>
                                                <Link to="/purchase-orders/new" className="btn btn-primary mt-4 inline-flex items-center gap-2">
                                                    <Plus className="w-4 h-4" /> Tạo đơn đầu tiên
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        purchaseOrders.map((po: PurchaseOrder) => (
                                            <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <Link to={`/purchase-orders/${po.id}`} className="font-mono font-semibold text-primary hover:underline">
                                                        {po.po_number}
                                                    </Link>
                                                </td>
                                                <td className="p-4 font-medium text-gray-900">{po.supplier?.name || '-'}</td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {po.assigned_to_user ? (po.assigned_to_user.full_name || po.assigned_to_user.username) : <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">{po.warehouse?.name || '-'}</td>
                                                <td className="p-4 text-sm text-gray-600">{new Date(po.order_date).toLocaleDateString('vi-VN')}</td>
                                                <td className="p-4 text-center">{getStatusBadge(po.status)}</td>
                                                <td className="p-4 text-right font-semibold text-gray-900">{po.total_amount.toLocaleString('vi-VN')} ₫</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Link to={`/purchase-orders/${po.id}`} className="text-primary hover:underline text-sm font-medium">
                                                            Xem
                                                        </Link>
                                                        {po.status === 'draft' && (
                                                            <Link to={`/purchase-orders/${po.id}/edit`} className="text-gray-500 hover:text-gray-700 text-sm">
                                                                Sửa
                                                            </Link>
                                                        )}
                                                    </div>
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
                                        pageSize={filters.page_size || 10}
                                        onChange={handlePageSizeChange}
                                        totalItems={Number(pagination.total_items)}
                                    />
                                    <span className="text-sm text-gray-500">
                                        {(filters.page_size || 0) >= 999999
                                            ? `Tất cả ${pagination.total_items} PO`
                                            : `${((pagination.page - 1) * (filters.page_size || 10)) + 1}–${Math.min(pagination.page * (filters.page_size || 10), Number(pagination.total_items))} / ${pagination.total_items} PO`}
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
                                        <span className="text-sm text-gray-600">{pagination.page} / {pagination.total_pages}</span>
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
                )}
            </div>
        </div>
    );
}
