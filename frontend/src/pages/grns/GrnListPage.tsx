import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, PackageCheck, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGrns } from '../../hooks/useGrns';
import type { GRNFilters } from '../../types/grn';
import PageSizeSelector from '../../components/common/PageSizeSelector';
import SearchInput from '../../components/common/SearchInput';

const POSTING_TABS = [
    { label: 'Tất cả', value: '' },
    { label: 'Nháp', value: 'false' },
    { label: 'Đã nhập kho', value: 'true' },
];

const getQCStatusBadge = (status: string) => {
    switch (status) {
        case 'pending':
            return <span className="badge badge-warning">Chưa KCS</span>;
        case 'pass':
            return <span className="badge badge-success">KCS Đạt</span>;
        case 'fail':
            return <span className="badge badge-danger">KCS Không Đạt</span>;
        case 'conditional':
            return <span className="badge badge-warning">KCS Điều Kiện</span>;
        default:
            return <span className="badge">{status}</span>;
    }
};

const getPostingBadge = (posted: boolean) => {
    return posted
        ? <span className="badge badge-info">Đã nhập kho</span>
        : <span className="badge badge-secondary">Nháp</span>;
};

export default function GrnListPage() {
    const [activePosted, setActivePosted] = useState('');
    const [filters, setFilters] = useState<GRNFilters>({
        page: 1,
        page_size: 10,
    });

    const effectiveFilters = {
        ...filters,
        ...(activePosted !== '' ? { posted: activePosted === 'true' } : {}),
    };
    const { data, isLoading, error } = useGrns(effectiveFilters);
    const grns = data?.data || [];
    const pagination = data?.pagination;

    const handlePageChange = (newPage: number) => setFilters({ ...filters, page: newPage });
    const handlePageSizeChange = (size: number) => setFilters({ ...filters, page_size: size, page: 1 });
    const handleTabChange = (val: string) => { setActivePosted(val); setFilters({ ...filters, page: 1 }); };

    const postedCount = grns.filter(g => g.posted).length;
    const pendingCount = grns.filter(g => !g.posted).length;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <PackageCheck className="w-8 h-8 text-primary" />
                        Lệnh Nhập Kho
                    </h1>
                    <p className="text-gray-600 mt-1">Quản lý lệnh nhập kho và kiểm tra chất lượng</p>
                </div>
                <Link to="/grns/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Tạo Lệnh Nhập Kho
                </Link>
            </div>

            {/* Stats Bar */}
            {pagination && pagination.total_items > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                            <PackageCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{pagination.total_items}</p>
                            <p className="text-xs text-gray-500">Tổng lệnh nhập</p>
                        </div>
                    </div>
                    <div className="card py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-50">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{postedCount}</p>
                            <p className="text-xs text-gray-500">Đã nhập kho</p>
                        </div>
                    </div>
                    <div className="card py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50">
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                            <p className="text-xs text-gray-500">Chưa nhập kho</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search + Tabs */}
            <div className="card mb-0 rounded-b-none border-b-0">
                <SearchInput
                    value={filters.search || ''}
                    onChange={(val) => setFilters({ ...filters, search: val, page: 1 })}
                    placeholder="Tìm theo số LNK hoặc số PO..."
                    width="flex-1"
                />
                <div className="flex gap-1 mt-4 border-b border-gray-200 -mx-6 px-6">
                    {POSTING_TABS.map(tab => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => handleTabChange(tab.value)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activePosted === tab.value
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.value === 'true' && <span className="w-2 h-2 rounded-full inline-block bg-blue-500" />}
                            {tab.value === 'false' && <span className="w-2 h-2 rounded-full inline-block bg-gray-400" />}
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
                                        <th>Số LNK</th>
                                        <th>Số PO</th>
                                        <th>Kho nhập</th>
                                        <th>Ngày nhập</th>
                                        <th className="text-center">Trạng thái KCS</th>
                                        <th className="text-center">Trạng thái kho</th>
                                        <th className="text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grns.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center p-16">
                                                <PackageCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">Không có lệnh nhập kho nào</p>
                                                <Link to="/grns/new" className="btn btn-primary mt-4 inline-flex items-center gap-2">
                                                    <Plus className="w-4 h-4" /> Tạo lệnh đầu tiên
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        grns.map((grn) => (
                                            <tr key={grn.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <Link to={`/grns/${grn.id}`} className="font-mono font-semibold text-primary hover:underline">
                                                        {grn.grn_number}
                                                    </Link>
                                                </td>
                                                <td className="p-4 font-mono text-gray-600">
                                                    {grn.purchase_order?.po_number || <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="p-4 text-gray-700">
                                                    <div className="max-w-[200px] truncate" title={grn.warehouse?.name}>
                                                        {grn.warehouse?.name || <span className="text-gray-400">—</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {new Date(grn.receipt_date).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="p-4 text-center">{getQCStatusBadge(grn.overall_qc_status)}</td>
                                                <td className="p-4 text-center">{getPostingBadge(grn.posted)}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Link to={`/grns/${grn.id}`} className="text-primary hover:underline text-sm font-medium">
                                                            Xem
                                                        </Link>
                                                        {!grn.posted && (
                                                            <Link to={`/grns/${grn.id}/edit`} className="text-gray-500 hover:text-gray-700 text-sm">
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
                                        totalItems={pagination.total_items}
                                    />
                                    <span className="text-sm text-gray-500">
                                        {(filters.page_size || 0) >= 999999
                                            ? `Tất cả ${pagination.total_items} lệnh nhập kho`
                                            : `${((pagination.page - 1) * (filters.page_size || 10)) + 1}–${Math.min(pagination.page * (filters.page_size || 10), pagination.total_items)} / ${pagination.total_items} lệnh nhập kho`}
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
