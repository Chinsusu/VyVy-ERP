import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Edit, Trash2, AlertTriangle, Building2, Star, ShieldCheck, Boxes } from 'lucide-react';
import { useMaterial, useDeleteMaterial } from '../../hooks/useMaterials';
import AuditLogPanel from '../../components/common/AuditLogPanel';

const TYPE_LABELS: Record<string, string> = {
    raw_material: 'Nguyên Liệu',
    packaging: 'Bao Bì',
};

const TYPE_COLORS: Record<string, string> = {
    raw_material: 'bg-blue-100 text-blue-700',
    packaging: 'bg-amber-100 text-amber-700',
};

export default function MaterialDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: material, isLoading, error } = useMaterial(parseInt(id || '0'));
    const deleteMaterial = useDeleteMaterial();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        if (!material) return;
        try {
            await deleteMaterial.mutateAsync(material.id);
            navigate('/materials');
        } catch (error) {
            console.error('Error deleting material:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center h-64">
                <div className="flex items-center gap-2 text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    Đang tải...
                </div>
            </div>
        );
    }

    if (error || !material) {
        return (
            <div className="animate-fade-in p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    Lỗi tải dữ liệu: {error ? (error as Error).message : 'Không tìm thấy nguyên vật liệu'}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Back */}
            <button
                onClick={() => navigate('/materials')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Nguyên Vật Liệu
            </button>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                        <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{material.code}</h1>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[material.material_type] || 'bg-gray-100 text-gray-600'}`}>
                                {TYPE_LABELS[material.material_type] || material.material_type}
                            </span>
                            {material.is_active ? (
                                <span className="badge badge-success">Đang HĐ</span>
                            ) : (
                                <span className="badge badge-secondary">Ngừng HĐ</span>
                            )}
                        </div>
                        <p className="text-gray-600 mt-0.5">{material.trading_name}</p>
                        {material.inci_name && (
                            <p className="text-gray-400 text-xs italic mt-0.5">{material.inci_name}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link to={`/materials/${material.id}/edit`} className="btn btn-secondary flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Điều chỉnh
                    </Link>
                    <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Xóa
                    </button>
                </div>
            </div>

            {/* Info Bar */}
            <div className="card mb-6 py-3">
                <div className="flex divide-x divide-gray-200">
                    <div className="flex-1 px-4 first:pl-0">
                        <p className="text-xs text-gray-500">Đặc tính</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">{material.category || '—'}</p>
                    </div>
                    <div className="flex-1 px-4">
                        <p className="text-xs text-gray-500">Đặc tính phụ</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">{material.sub_category || '—'}</p>
                    </div>
                    <div className="flex-1 px-4">
                        <p className="text-xs text-gray-500">Đơn vị</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">{material.unit}</p>
                    </div>
                    <div className="flex-1 px-4">
                        <p className="text-xs text-gray-500">Giá vốn chuẩn</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">
                            {material.standard_cost ? `${material.standard_cost.toLocaleString('vi-VN')} ₫` : '—'}
                        </p>
                    </div>
                    <div className="flex-1 px-4 last:pr-0">
                        <p className="text-xs text-gray-500">Giá mua gần nhất</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">
                            {material.last_purchase_price ? `${material.last_purchase_price.toLocaleString('vi-VN')} ₫` : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2-col layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Nhà Cung Cấp */}
                    <div className="card">
                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            Nhà Cung Cấp
                            <span className="text-sm text-gray-400 font-normal">({material.suppliers?.length || 0})</span>
                        </h3>
                        {material.suppliers && material.suppliers.length > 0 ? (
                            <div className="space-y-2">
                                {material.suppliers.map((ms) => (
                                    <div key={ms.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-700 text-xs font-bold shrink-0 mt-0.5">
                                                {ms.priority}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{ms.supplier?.name || `Supplier #${ms.supplier_id}`}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    {ms.unit_price && (
                                                        <p className="text-xs text-gray-500">{ms.unit_price.toLocaleString('vi-VN')} ₫/{material.unit}</p>
                                                    )}
                                                    {ms.lead_time_days && (
                                                        <p className="text-xs text-gray-500">Giao hàng: {ms.lead_time_days} ngày</p>
                                                    )}
                                                </div>
                                                {ms.notes && <p className="text-xs text-gray-400 mt-1">{ms.notes}</p>}
                                            </div>
                                        </div>
                                        {ms.priority === 1 ? (
                                            <span className="flex items-center gap-1 text-xs font-semibold text-white bg-amber-500 px-2.5 py-1 rounded-full shadow-sm shrink-0">
                                                <Star className="w-3 h-3 fill-white text-white" />
                                                Ưu tiên
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-900 bg-gray-200 px-2.5 py-0.5 rounded-full font-semibold shrink-0">#{ms.priority}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Chưa có nhà cung cấp nào.</p>
                        )}
                    </div>

                    {/* Kiểm Soát Tồn Kho */}
                    <div className="card">
                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <Boxes className="w-4 h-4 text-primary" />
                            Kiểm Soát Tồn Kho
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Tồn kho tối thiểu</p>
                                <p className="font-semibold text-gray-900 mt-1">{material.min_stock_level || 0} <span className="text-xs font-normal text-gray-500">{material.unit}</span></p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Tồn kho tối đa</p>
                                <p className="font-semibold text-gray-900 mt-1">
                                    {material.max_stock_level ? <>{material.max_stock_level} <span className="text-xs font-normal text-gray-500">{material.unit}</span></> : '—'}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Điểm đặt hàng lại</p>
                                <p className="font-semibold text-gray-900 mt-1">
                                    {material.reorder_point ? <>{material.reorder_point} <span className="text-xs font-normal text-gray-500">{material.unit}</span></> : '—'}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Số lượng đặt lại</p>
                                <p className="font-semibold text-gray-900 mt-1">
                                    {material.reorder_quantity ? <>{material.reorder_quantity} <span className="text-xs font-normal text-gray-500">{material.unit}</span></> : '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ghi Chú */}
                    {material.notes && (
                        <div className="card">
                            <h3 className="text-base font-semibold mb-3">Ghi Chú</h3>
                            <p className="text-gray-700 whitespace-pre-wrap text-sm">{material.notes}</p>
                        </div>
                    )}

                    {/* Audit Log — đặt trong cột trái, KHÔNG full-width ngoài grid */}
                    <AuditLogPanel tableName="materials" recordId={material.id} />
                </div>

                {/* Sidebar 1/3 */}
                <div className="space-y-6">
                    {/* Chất Lượng & An Toàn */}
                    <div className="card">
                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            Chất Lượng & An Toàn
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Cần kiểm tra KCS</span>
                                {material.requires_qc ? (
                                    <span className="badge badge-warning">Có</span>
                                ) : (
                                    <span className="text-gray-400 text-sm">Không</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Nguy hiểm</span>
                                {material.hazardous ? (
                                    <span className="badge badge-danger flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Có
                                    </span>
                                ) : (
                                    <span className="text-gray-400 text-sm">Không</span>
                                )}
                            </div>
                            <div className="py-2 border-b border-gray-100">
                                <p className="text-sm text-gray-600">Hạn sử dụng</p>
                                <p className="font-medium text-sm mt-0.5">{material.shelf_life_days ? `${material.shelf_life_days} ngày` : '—'}</p>
                            </div>
                            <div className="py-2">
                                <p className="text-sm text-gray-600">Điều kiện bảo quản</p>
                                <p className="font-medium text-sm mt-0.5">{material.storage_conditions || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Thông Tin Cơ Bản */}
                    <div className="card">
                        <h3 className="text-base font-semibold mb-4">Thông Tin Cơ Bản</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500">Mã NVL</p>
                                <p className="font-mono font-semibold text-gray-900 mt-0.5">{material.code}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Tên INCI</p>
                                <p className="text-gray-900 mt-0.5 italic">{material.inci_name || '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Loại NVL</p>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-0.5 ${TYPE_COLORS[material.material_type] || 'bg-gray-100 text-gray-600'}`}>
                                    {TYPE_LABELS[material.material_type] || material.material_type}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">Xác Nhận Xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc muốn xóa <strong>{material.code}</strong>? Thao tác này không thể hoàn tác.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary" disabled={deleteMaterial.isPending}>
                                Hủy
                            </button>
                            <button onClick={handleDelete} className="btn btn-danger" disabled={deleteMaterial.isPending}>
                                {deleteMaterial.isPending ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
