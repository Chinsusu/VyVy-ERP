import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Edit, Trash2, AlertTriangle, Building2, Star } from 'lucide-react';
import { useMaterial, useDeleteMaterial } from '../../hooks/useMaterials';
import AuditLogPanel from '../../components/common/AuditLogPanel';


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
            <div className="animate-fade-in p-6">
                <div>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Đang tải nguyên vật liệu...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !material) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Lỗi tải dữ liệu: {error ? (error as Error).message : 'Không tìm thấy nguyên vật liệu'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/materials')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại danh sách
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Package className="w-8 h-8 text-primary" />
                                {material.code}
                            </h1>
                            <p className="text-gray-600 mt-1">{material.trading_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to={`/materials/${material.id}/edit`}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <Edit className="w-5 h-5" />
                                Điều chỉnh
                            </Link>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="btn btn-danger flex items-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>

                {/* Material Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Thông Tin Cơ Bản</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Mã NVL</p>
                                    <p className="font-medium">{material.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Tên Thương Mại</p>
                                    <p className="font-medium">{material.trading_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Tên INCI</p>
                                    <p className="font-medium">{material.inci_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Loại NVL</p>
                                    <span className="badge badge-secondary">{{
                                        HOA_PHAM: 'Hóa phẩm',
                                        HUONG_LIEU: 'Hương liệu',
                                        BAO_BI: 'Bao bì',
                                    }[material.material_type] || material.material_type}</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Đặc tính</p>
                                    <p className="font-medium">{material.category || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Đặc tính phụ</p>
                                    <p className="font-medium">{material.sub_category || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Đơn vị</p>
                                    <p className="font-medium">{material.unit}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Trạng thái</p>
                                    {material.is_active ? (
                                        <span className="badge badge-success">Đang hoạt động</span>
                                    ) : (
                                        <span className="badge badge-secondary">Ngừng hoạt động</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Giá</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Giá vốn chuẩn</p>
                                    <p className="font-medium">{material.standard_cost ? `${material.standard_cost.toLocaleString('vi-VN')} ₫` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Giá mua gần nhất</p>
                                    <p className="font-medium">{material.last_purchase_price ? `${material.last_purchase_price.toLocaleString('vi-VN')} ₫` : '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Suppliers */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                Nhà Cung Cấp
                                <span className="text-sm text-gray-400 font-normal">({material.suppliers?.length || 0})</span>
                            </h3>
                            {material.suppliers && material.suppliers.length > 0 ? (
                                <div className="space-y-3">
                                    {material.suppliers.map((ms) => (
                                        <div key={ms.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-start gap-3">
                                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold shrink-0">
                                                    {ms.priority}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{ms.supplier?.name || `Supplier #${ms.supplier_id}`}</p>
                                                    {ms.unit_price && (
                                                        <p className="text-xs text-gray-500">Giá: {ms.unit_price.toLocaleString('vi-VN')} ₫/{material.unit}</p>
                                                    )}
                                                    {ms.lead_time_days && (
                                                        <p className="text-xs text-gray-500">Thời gian giao hàng: {ms.lead_time_days} ngày</p>
                                                    )}
                                                    {ms.notes && (
                                                        <p className="text-xs text-gray-400 mt-1">{ms.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {ms.priority === 1 ? (
                                                <span className="flex items-center gap-1 text-xs font-semibold text-white bg-amber-500 px-2.5 py-1 rounded-full shadow-sm">
                                                    <Star className="w-3 h-3 fill-white text-white" />
                                                    ưu tiên
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium">#{ms.priority}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Chưa có nhà cung cấp nào.</p>
                            )}
                        </div>

                        {/* Stock Control */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Kiểm Soát Tồn Kho</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Tồn kho tối thiểu</p>
                                    <p className="font-medium">{material.min_stock_level || 0} {material.unit}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Tồn kho tối đa</p>
                                    <p className="font-medium">{material.max_stock_level ? `${material.max_stock_level} ${material.unit}` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Điểm đặt hàng lại</p>
                                    <p className="font-medium">{material.reorder_point ? `${material.reorder_point} ${material.unit}` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Số lượng đặt lại</p>
                                    <p className="font-medium">{material.reorder_quantity ? `${material.reorder_quantity} ${material.unit}` : '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {material.notes && (
                            <div className="card">
                                <h3 className="text-lg font-semibold mb-4">Ghi Chú</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{material.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quality & Safety */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Chất Lượng & An Toàn</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Cần kiểm tra KCS</span>
                                    {material.requires_qc ? (
                                        <span className="badge badge-warning">Có</span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Không</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Nguy hiểm</span>
                                    {material.hazardous ? (
                                        <span className="badge badge-danger flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            Có
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Không</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Hạn sử dụng</p>
                                    <p className="font-medium">{material.shelf_life_days ? `${material.shelf_life_days} ngày` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Điều kiện bảo quản</p>
                                    <p className="font-medium text-sm">{material.storage_conditions || '-'}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>


                {/* Audit Log */}
                <div className="mt-6">
                    <AuditLogPanel tableName="materials" recordId={material.id} />
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Xác Nhận Xóa</h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc muốn xóa <strong>{material.code}</strong>? Thao tác này không thể hoàn tác.
                            </p>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="btn btn-secondary"
                                    disabled={deleteMaterial.isPending}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-danger"
                                    disabled={deleteMaterial.isPending}
                                >
                                    {deleteMaterial.isPending ? 'Đang xóa...' : 'Xóa'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
