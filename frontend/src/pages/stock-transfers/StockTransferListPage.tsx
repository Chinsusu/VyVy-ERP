import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRightLeft, Search, RefreshCw } from 'lucide-react';
import { useStockTransfers } from '../../hooks/useStockTransfers';
import type { StockTransfer } from '../../types/stockTransfer';

const STATUS_BADGE: Record<string, string> = {
    draft: 'badge badge-secondary',
    posted: 'badge badge-success',
    cancelled: 'badge badge-danger',
};
const STATUS_LABEL: Record<string, string> = {
    draft: 'Nháp',
    posted: 'Đã xử lý',
    cancelled: 'Đã hủy',
};

export default function StockTransferListPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { data, isLoading, refetch } = useStockTransfers({
        page,
        page_size: 15,
        search: search || undefined,
        status: statusFilter || undefined,
    });

    const transfers: StockTransfer[] = data?.data || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / 15);

    return (
        <div className="animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ArrowRightLeft className="w-8 h-8 text-primary-600" />
                        Chuyển kho
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý phiếu chuyển kho nội bộ</p>
                </div>
                <Link to="/stock-transfers/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo phiếu chuyển kho
                </Link>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            className="input pl-9 w-full"
                            placeholder="Tìm kiếm số phiếu..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <select
                        className="input w-full md:w-44"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="draft">Nháp</option>
                        <option value="posted">Đã xử lý</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                    <button className="btn btn-secondary flex items-center gap-2" onClick={() => refetch()}>
                        <RefreshCw className="w-4 h-4" />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {isLoading ? (
                    <div className="text-center py-12 text-gray-400">Đang tải...</div>
                ) : transfers.length === 0 ? (
                    <div className="text-center py-16">
                        <ArrowRightLeft className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Chưa có phiếu chuyển kho</p>
                        <Link to="/stock-transfers/new" className="btn btn-primary mt-4 inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Tạo phiếu mới
                        </Link>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Số phiếu</th>
                                    <th>Từ kho</th>
                                    <th>Đến kho</th>
                                    <th>Ngày chuyển</th>
                                    <th>Trạng thái</th>
                                    <th>Số dòng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfers.map((tr: StockTransfer) => (
                                    <tr key={tr.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/stock-transfers/${tr.id}`}>
                                        <td className="font-mono font-semibold text-primary-700">
                                            <Link to={`/stock-transfers/${tr.id}`} onClick={e => e.stopPropagation()}>
                                                {tr.transfer_number}
                                            </Link>
                                        </td>
                                        <td>{tr.from_warehouse?.name || `#${tr.from_warehouse_id}`}</td>
                                        <td>{tr.to_warehouse?.name || `#${tr.to_warehouse_id}`}</td>
                                        <td>{new Date(tr.transfer_date).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span className={STATUS_BADGE[tr.status] || 'badge'}>
                                                {STATUS_LABEL[tr.status] || tr.status}
                                            </span>
                                        </td>
                                        <td className="text-gray-600">{tr.items?.length ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Tổng: {total} phiếu</p>
                        <div className="flex gap-2">
                            <button className="btn btn-secondary text-sm py-1" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
                            <span className="text-sm text-gray-600 flex items-center px-2">{page}/{totalPages}</span>
                            <button className="btn btn-secondary text-sm py-1" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Tiếp →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
