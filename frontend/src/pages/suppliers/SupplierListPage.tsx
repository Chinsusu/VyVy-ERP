import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, CheckCircle, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSuppliers } from '../../hooks/useSuppliers';
import type { SupplierFilters } from '../../types/supplier';
import PageSizeSelector from '../../components/common/PageSizeSelector';
import SearchInput from '../../components/common/SearchInput';

const STATUS_TABS = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang hoạt động', value: 'true' },
    { label: 'Ngừng hoạt động', value: 'false' },
];

export default function SupplierListPage() {
    const [activeStatus, setActiveStatus] = useState('');
    const [filters, setFilters] = useState<SupplierFilters>({
        page: 1,
        page_size: 20,
        sort_by: 'created_at',
        sort_order: 'desc',
    });

    const effectiveFilters = {
        ...filters,
        ...(activeStatus !== '' ? { is_active: activeStatus === 'true' } : {}),
    };
    const { data, isLoading, error } = useSuppliers(effectiveFilters);
    const suppliers = data?.data || [];
    const pagination = data?.pagination;

    const handlePageChange = (newPage: number) => setFilters({ ...filters, page: newPage });
    const handlePageSizeChange = (size: number) => setFilters({ ...filters, page_size: size, page: 1 });
    const handleStatusChange = (val: string) => { setActiveStatus(val); setFilters({ ...filters, page: 1 }); };

    const activeCount = suppliers.filter(s => s.is_active).length;
    const withCityCount = suppliers.filter(s => s.city).length;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Nhà Cung Cấp
                    </h1>
                    <p className="text-gray-600 mt-1">Quản lý danh sách nhà cung cấp</p>
                </div>
                <Link to="/suppliers/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Thêm Nhà Cung Cấp
                </Link>
            </div>

            {/* Stats Bar */}
            {pagination && pagination.total_items > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{pagination.total_items}</p>
                            <p className="text-xs text-gray-500">Tổng nhà cung cấp</p>
                        </div>
                    </div>
                    <div className="card py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-50">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                            <p className="text-xs text-gray-500">Đang hoạt động</p>
                        </div>
                    </div>
                    <div className="card py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{withCityCount}</p>
                            <p className="text-xs text-gray-500">Có địa chỉ</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search + Status Tabs — merged card */}
            <div className="card mb-0 rounded-b-none border-b-0">
                <SearchInput
                    value={filters.search || ''}
                    onChange={(val) => setFilters({ ...filters, search: val, page: 1 })}
                    placeholder="Tìm theo mã, tên, mã số thuế, email..."
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
                            {tab.value === 'true' && <span className="w-2 h-2 rounded-full inline-block bg-green-500" />}
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
                            Đang tải nhà cung cấp...
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
                                        <th>Mã NCC</th>
                                        <th>Tên nhà cung cấp</th>
                                        <th>Người liên hệ</th>
                                        <th>Điện thoại</th>
                                        <th>Email</th>
                                        <th>Tỉnh/TP</th>
                                        <th className="text-center">Trạng thái</th>
                                        <th className="text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center p-16">
                                                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">Chưa có nhà cung cấp nào</p>
                                                <Link to="/suppliers/new" className="btn btn-primary mt-4 inline-flex items-center gap-2">
                                                    <Plus className="w-4 h-4" /> Thêm nhà cung cấp đầu tiên
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        suppliers.map((supplier) => (
                                            <tr key={supplier.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <Link to={`/suppliers/${supplier.id}`} className="font-mono font-semibold text-primary hover:underline">
                                                        {supplier.code}
                                                    </Link>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900 max-w-[240px] truncate" title={supplier.name}>
                                                        {supplier.name}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {supplier.contact_person || <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {supplier.phone || <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {supplier.email
                                                        ? <a href={`mailto:${supplier.email}`} className="hover:text-primary transition-colors">{supplier.email}</a>
                                                        : <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {supplier.city || <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {supplier.is_active
                                                        ? <span className="badge badge-success">Đang hoạt động</span>
                                                        : <span className="badge badge-secondary">Ngừng hoạt động</span>}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Link to={`/suppliers/${supplier.id}`} className="text-primary hover:underline text-sm font-medium">
                                                            Xem
                                                        </Link>
                                                        <Link to={`/suppliers/${supplier.id}/edit`} className="text-gray-500 hover:text-gray-700 text-sm">
                                                            Sửa
                                                        </Link>
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
                                        pageSize={filters.page_size || 20}
                                        onChange={handlePageSizeChange}
                                        totalItems={Number(pagination.total_items)}
                                    />
                                    <span className="text-sm text-gray-500">
                                        {(filters.page_size || 0) >= 999999
                                            ? `Tất cả ${pagination.total_items} nhà cung cấp`
                                            : `${((pagination.page - 1) * (filters.page_size || 20)) + 1}–${Math.min(pagination.page * (filters.page_size || 20), Number(pagination.total_items))} / ${pagination.total_items} nhà cung cấp`}
                                    </span>
                                </div>
                                {(filters.page_size || 0) < 999999 && pagination.total_pages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="btn btn-secondary btn-sm disabled:opacity-50">
                                            <ChevronLeft className="w-4 h-4" /> Trước
                                        </button>
                                        <span className="text-sm text-gray-600">{pagination.page} / {pagination.total_pages}</span>
                                        <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.total_pages} className="btn btn-secondary btn-sm disabled:opacity-50">
                                            Tiếp <ChevronRight className="w-4 h-4" />
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
