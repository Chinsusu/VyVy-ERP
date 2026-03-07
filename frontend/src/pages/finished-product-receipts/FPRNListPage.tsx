import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, PackageCheck } from 'lucide-react';
import { useFinishedProductReceipts } from '../../hooks/useFinishedProductReceipts';
import type { FinishedProductReceipt } from '../../types/finishedProductReceipt';

export default function FPRNListPage() {
    const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', status: '' });

    const { data, isLoading, error } = useFinishedProductReceipts(filters);
    const items: FinishedProductReceipt[] = data?.data?.data?.items || data?.data?.data || [];
    const total: number = data?.data?.data?.total || 0;
    const totalPages = Math.ceil(total / filters.limit);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <span className="badge badge-secondary">Nháp</span>;
            case 'posted': return <span className="badge badge-success">Đã nhập kho</span>;
            case 'cancelled': return <span className="badge badge-danger">Đã hủy</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Nhập kho Thành Phẩm</h1>
                    <p className="text-gray-600 mt-1">Phiếu nhập kho thành phẩm từ sản xuất</p>
                </div>
                <Link to="/finished-product-receipts/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo phiếu nhập
                </Link>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 relative min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm số phiếu..."
                            className="input pl-10 w-full"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        />
                    </div>
                    <select
                        className="input w-40"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="draft">Nháp</option>
                        <option value="posted">Đã nhập kho</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-48 text-gray-500">Đang tải...</div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Lỗi tải dữ liệu: {(error as Error).message}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16">
                        <PackageCheck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Chưa có phiếu nhập kho thành phẩm nào</p>
                        <Link to="/finished-product-receipts/new" className="btn btn-primary mt-4 inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Tạo phiếu đầu tiên
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Số phiếu</th>
                                        <th>Kho nhập</th>
                                        <th>KHSX liên kết</th>
                                        <th className="w-32">Ngày nhập</th>
                                        <th className="w-24">Trạng thái</th>
                                        <th className="text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((fprn: FinishedProductReceipt) => (
                                        <tr key={fprn.id}>
                                            <td className="font-mono font-semibold text-primary">
                                                <div className="flex items-center gap-2">
                                                    <PackageCheck className="w-4 h-4 opacity-50" />
                                                    {fprn.fprn_number}
                                                </div>
                                            </td>
                                            <td>{fprn.warehouse?.name || '-'}</td>
                                            <td>
                                                {fprn.production_plan ? (
                                                    <Link
                                                        to={`/production-plans/${fprn.production_plan_id}`}
                                                        className="text-primary hover:underline text-sm"
                                                    >
                                                        {fprn.production_plan.plan_number}
                                                    </Link>
                                                ) : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="text-gray-600">
                                                {new Date(fprn.receipt_date).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td>{getStatusBadge(fprn.status)}</td>
                                            <td>
                                                <div className="flex justify-end">
                                                    <Link
                                                        to={`/finished-product-receipts/${fprn.id}`}
                                                        className="text-primary hover:text-primary-dark font-medium text-sm"
                                                    >
                                                        Xem chi tiết
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t">
                                <div className="text-sm text-gray-600">
                                    {((filters.page - 1) * filters.limit) + 1}–{Math.min(filters.page * filters.limit, total)} / {total}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                                        disabled={filters.page === 1}
                                        className="btn btn-secondary"
                                    >Trước</button>
                                    <button
                                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                        disabled={filters.page >= totalPages}
                                        className="btn btn-secondary"
                                    >Sau</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
