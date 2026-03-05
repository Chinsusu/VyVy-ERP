import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import type { PurchaseOrder, PurchaseOrderFilters } from '../../types/purchaseOrder';
import PageSizeSelector from '../../components/common/PageSizeSelector';
import SearchInput from '../../components/common/SearchInput';

export default function PurchaseOrderListPage() {
    const [filters, setFilters] = useState<PurchaseOrderFilters>({
        page: 1,
        page_size: 10,
    });

    const { data, isLoading, error } = usePurchaseOrders(filters);
    const purchaseOrders = data?.data || [];
    const pagination = data?.pagination;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="badge badge-secondary">Nháp</span>;
            case 'approved':
                return <span className="badge badge-success">Đã duyệt</span>;
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
                        <h1 className="text-slate-900">Đơn Mua Hàng</h1>
                        <p className="text-slate-500 mt-1 text-premium-sm">Quản lý đơn đặt mua hàng</p>
                    </div>
                    <Link to="/purchase-orders/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Thêm Đơn Mua Hàng
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="card mb-6">
                    <div className="flex items-center gap-4">
                        <SearchInput
                            value={filters.search || ''}
                            onChange={(val) => setFilters({ ...filters, search: val, page: 1 })}
                            placeholder="Tìm theo số đơn đặt hàng..."
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
                                <option value="">Tất cả trạng thái</option>
                                <option value="draft">Nháp</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đặt hàng từ</label>
                            <input
                                type="date"
                                className="input"
                                value={filters.order_date_from || ''}
                                onChange={(e) => setFilters({ ...filters, order_date_from: e.target.value, page: 1 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đặt hàng đến</label>
                            <input
                                type="date"
                                className="input"
                                value={filters.order_date_to || ''}
                                onChange={(e) => setFilters({ ...filters, order_date_to: e.target.value, page: 1 })}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card shadow-md">
                    <div className="table-container">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-gray-500">Đang tải đơn mua hàng...</div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                                Lỗi: {(error as Error).message}
                            </div>
                        ) : purchaseOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">Chưa có đơn mua hàng nào</p>
                                <Link to="/purchase-orders/new" className="btn btn-primary">
                                    Tạo Đơn Mua Hàng Đầu Tiên
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Số PO</th>
                                                <th>Nhà cung cấp</th>
                                                <th>Phụ trách</th>
                                                <th>Kho nhận hàng</th>
                                                <th>Ngày đặt hàng</th>
                                                <th>Trạng thái</th>
                                                <th>Tổng tiền</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {purchaseOrders.map((po: PurchaseOrder) => (
                                                <tr key={po.id}>
                                                    <td className="font-semibold text-primary-600">{po.po_number}</td>
                                                    <td>{po.supplier?.name || '-'}</td>
                                                    <td className="text-sm text-gray-600">{po.assigned_to_user ? (po.assigned_to_user.full_name || po.assigned_to_user.username) : <span className="text-gray-400 italic">-</span>}</td>
                                                    <td>{po.warehouse?.name || '-'}</td>
                                                    <td>{new Date(po.order_date).toLocaleDateString('vi-VN')}</td>
                                                    <td>{getStatusBadge(po.status)}</td>
                                                    <td className="font-semibold">{po.total_amount.toLocaleString('vi-VN')} VND</td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                to={`/purchase-orders/${po.id}`}
                                                                className="text-primary hover:underline text-sm font-medium"
                                                            >
                                                                Xem
                                                            </Link>
                                                            {po.status === 'draft' && (
                                                                <Link
                                                                    to={`/purchase-orders/${po.id}/edit`}
                                                                    className="text-primary hover:underline text-sm font-medium"
                                                                >
                                                                    Điều chỉnh
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
                                                    ? `Tất cả ${pagination.total_items} PO`
                                                    : `${((pagination.page - 1) * (filters.page_size || 10)) + 1}–${Math.min(pagination.page * (filters.page_size || 10), Number(pagination.total_items))} / ${pagination.total_items} PO`}
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
                                                    Tiếp
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
        </div>
    );
}
