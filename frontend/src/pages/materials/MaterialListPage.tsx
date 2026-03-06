import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, FlaskConical } from 'lucide-react';
import { useMaterials } from '../../hooks/useMaterials';
import type { MaterialFilters } from '../../types/material';
import PageSizeSelector from '../../components/common/PageSizeSelector';
import SearchInput from '../../components/common/SearchInput';

const TYPE_TABS = [
    { label: 'Tất cả', value: '' },
    { label: 'Nguyên Liệu', value: 'raw_material' },
    { label: 'Bao Bì', value: 'packaging' },
];

const TYPE_LABELS: Record<string, string> = {
    raw_material: 'Nguyên Liệu',
    packaging: 'Bao Bì',
};

const TYPE_COLORS: Record<string, string> = {
    raw_material: 'bg-blue-100 text-blue-700',
    packaging: 'bg-amber-100 text-amber-700',
};

const TYPE_DOT: Record<string, string> = {
    raw_material: 'bg-blue-500',
    packaging: 'bg-amber-500',
};

export default function MaterialListPage() {
    const [activeType, setActiveType] = useState('');
    const [filters, setFilters] = useState<MaterialFilters>({
        page: 1,
        page_size: 20,
        sort_by: 'updated_at',
        sort_order: 'desc',
    });

    const effectiveFilters = { ...filters, material_type: activeType || undefined };
    const { data, isLoading, error } = useMaterials(effectiveFilters);

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    const handlePageSizeChange = (size: number) => {
        setFilters({ ...filters, page_size: size, page: 1 });
    };

    const handleTypeChange = (type: string) => {
        setActiveType(type);
        setFilters({ ...filters, page: 1 });
    };

    const materials = data?.data || [];
    const pagination = data?.pagination;

    const activeCount = materials.filter(m => m.is_active).length;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Package className="w-8 h-8 text-primary" />
                        Nguyên Vật Liệu
                    </h1>
                    <p className="text-gray-600 mt-1">Quản lý nguyên vật liệu và thành phần sản xuất</p>
                </div>
                <Link to="/materials/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Thêm NVL
                </Link>
            </div>

            {/* Stats Bar */}
            {pagination && pagination.total_items > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card py-4 flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                            <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{pagination.total_items}</p>
                            <p className="text-xs text-gray-500">Tổng NVL</p>
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
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{materials.filter(m => m.requires_qc).length}</p>
                            <p className="text-xs text-gray-500">Cần KCS</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search + Type Filter */}
            <div className="card mb-0 rounded-b-none border-b-0">
                <div className="flex items-center gap-4">
                    <SearchInput
                        value={filters.search || ''}
                        onChange={(val) => setFilters({ ...filters, search: val, page: 1 })}
                        placeholder="Tìm theo mã, tên hoặc tên INCI..."
                        width="flex-1"
                    />
                </div>
                {/* Type Tabs */}
                <div className="flex gap-1 mt-4 border-b border-gray-200 -mx-6 px-6">
                    {TYPE_TABS.map(tab => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => handleTypeChange(tab.value)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeType === tab.value
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.value && <span className={`w-2 h-2 rounded-full inline-block ${TYPE_DOT[tab.value]}`}></span>}
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
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            Đang tải...
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Lỗi tải dữ liệu: {(error as Error).message}
                    </div>
                ) : (
                    <div className="table-container">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th>Mã</th>
                                        <th>Tên Thương Mại</th>
                                        <th>Loại</th>
                                        <th>Đặc tính</th>
                                        <th>Đơn Vị</th>
                                        <th className="text-center">Đặc Điểm</th>
                                        <th className="text-center">Trạng Thái</th>
                                        <th className="text-right">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center p-16">
                                                <FlaskConical className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">Không có nguyên vật liệu nào</p>
                                                <Link to="/materials/new" className="btn btn-primary mt-4 inline-flex items-center gap-2">
                                                    <Plus className="w-4 h-4" /> Thêm NVL đầu tiên
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        materials.map((material) => (
                                            <tr key={material.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <Link
                                                        to={`/materials/${material.id}`}
                                                        className="font-mono font-semibold text-primary hover:underline"
                                                    >
                                                        {material.code}
                                                    </Link>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900">{material.trading_name}</div>
                                                    {material.inci_name && (
                                                        <div className="text-xs text-gray-400 mt-0.5 italic">{material.inci_name}</div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[material.material_type] || 'bg-gray-100 text-gray-600'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[material.material_type] || 'bg-gray-400'}`}></span>
                                                        {TYPE_LABELS[material.material_type] || material.material_type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-600 text-sm">{material.category || '-'}</td>
                                                <td className="p-4 text-sm font-medium text-gray-700">{material.unit}</td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                        {material.requires_qc && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700 font-medium">
                                                                KCS
                                                            </span>
                                                        )}
                                                        {material.hazardous && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-medium">
                                                                <AlertTriangle className="w-3 h-3" /> Nguy hiểm
                                                            </span>
                                                        )}
                                                        {!material.requires_qc && !material.hazardous && (
                                                            <span className="text-gray-300 text-xs">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {material.is_active ? (
                                                        <span className="badge badge-success">Đang HĐ</span>
                                                    ) : (
                                                        <span className="badge badge-secondary">Ngừng HĐ</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Link to={`/materials/${material.id}`} className="text-primary hover:underline text-sm font-medium">
                                                            Xem
                                                        </Link>
                                                        <Link to={`/materials/${material.id}/edit`} className="text-gray-500 hover:text-gray-700 text-sm">
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
                                            ? `Tất cả ${pagination.total_items} NVL`
                                            : `${((pagination.page - 1) * (filters.page_size || 20)) + 1}–${Math.min(pagination.page * (filters.page_size || 20), Number(pagination.total_items))} / ${pagination.total_items} NVL`}
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
                                        <span className="text-sm text-gray-600">
                                            {pagination.page} / {pagination.total_pages}
                                        </span>
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
