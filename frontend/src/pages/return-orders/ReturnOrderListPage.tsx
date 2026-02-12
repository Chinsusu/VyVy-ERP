import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReturnOrders } from '../../hooks/useReturnOrders';
import { RotateCcw, Plus, Eye, Search } from 'lucide-react';
import type { ReturnOrderFilter } from '../../types/returnOrder';

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    receiving: 'bg-indigo-100 text-indigo-800',
    inspecting: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const typeLabels: Record<string, string> = {
    customer_return: 'Khách trả',
    damaged: 'Hư hỏng',
    wrong_item: 'Sai hàng',
    refused: 'Từ chối nhận',
};

export default function ReturnOrderListPage() {
    const [filter, setFilter] = useState<ReturnOrderFilter>({ limit: 20, offset: 0 });
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const { data, isLoading } = useReturnOrders(filter);

    const handleFilterChange = (key: string, value: string) => {
        const newFilter = { ...filter, offset: 0, [key]: value || undefined };
        setFilter(newFilter);
        if (key === 'status') setStatusFilter(value);
        if (key === 'return_type') setTypeFilter(value);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <RotateCcw className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Hoàn hàng</h1>
                        <p className="text-slate-500 text-sm">Quản lý đơn hoàn hàng</p>
                    </div>
                </div>
                <Link to="/return-orders/new" className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tạo đơn hoàn
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-4">
                <div className="flex flex-wrap gap-4">
                    <select
                        value={statusFilter}
                        onChange={e => handleFilterChange('status', e.target.value)}
                        className="input w-48"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="receiving">Đang nhận</option>
                        <option value="inspecting">Đang kiểm tra</option>
                        <option value="completed">Hoàn tất</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={e => handleFilterChange('return_type', e.target.value)}
                        className="input w-48"
                    >
                        <option value="">Tất cả loại</option>
                        <option value="customer_return">Khách trả</option>
                        <option value="damaged">Hư hỏng</option>
                        <option value="wrong_item">Sai hàng</option>
                        <option value="refused">Từ chối nhận</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left p-3 font-semibold text-slate-600">Mã hoàn</th>
                            <th className="text-left p-3 font-semibold text-slate-600">Đơn giao</th>
                            <th className="text-left p-3 font-semibold text-slate-600">Khách hàng</th>
                            <th className="text-left p-3 font-semibold text-slate-600">Loại</th>
                            <th className="text-left p-3 font-semibold text-slate-600">Trạng thái</th>
                            <th className="text-right p-3 font-semibold text-slate-600">SL hoàn</th>
                            <th className="text-left p-3 font-semibold text-slate-600">Ngày</th>
                            <th className="text-center p-3 font-semibold text-slate-600"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={8} className="p-8 text-center text-slate-400">Đang tải...</td></tr>
                        ) : !data?.items?.length ? (
                            <tr><td colSpan={8} className="p-8 text-center text-slate-400">
                                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                Không có đơn hoàn hàng
                            </td></tr>
                        ) : (
                            data.items.map(ro => (
                                <tr key={ro.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 font-mono text-sm font-medium text-slate-800">{ro.return_number}</td>
                                    <td className="p-3 text-sm text-slate-600">{ro.do_number || '-'}</td>
                                    <td className="p-3 text-sm text-slate-600">{ro.customer_name || '-'}</td>
                                    <td className="p-3">
                                        <span className="text-xs text-slate-600">{typeLabels[ro.return_type] || ro.return_type}</span>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ro.status] || 'bg-gray-100'}`}>
                                            {ro.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm text-right font-medium">{ro.total_items}</td>
                                    <td className="p-3 text-sm text-slate-500">{new Date(ro.return_date).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-3 text-center">
                                        <Link to={`/return-orders/${ro.id}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 inline-block transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data && data.total > (filter.limit || 20) && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-500">
                        Hiển thị {(filter.offset || 0) + 1} - {Math.min((filter.offset || 0) + (filter.limit || 20), data.total)} / {data.total}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter(f => ({ ...f, offset: Math.max(0, (f.offset || 0) - (f.limit || 20)) }))}
                            disabled={!filter.offset}
                            className="btn-secondary text-sm"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setFilter(f => ({ ...f, offset: (f.offset || 0) + (f.limit || 20) }))}
                            disabled={(filter.offset || 0) + (filter.limit || 20) >= data.total}
                            className="btn-secondary text-sm"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
