import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AuditLogPanel from '../../components/common/AuditLogPanel';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Package,
    FileText,
    DollarSign,
    Scale,
    Calendar,
    FlaskConical,
} from 'lucide-react';
import { useFinishedProduct, useDeleteFinishedProduct } from '../../hooks/useFinishedProducts';
import ProductFormulaTab from './ProductFormulaTab';

type Tab = 'info' | 'formula';

export default function FinishedProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const productId = parseInt(id || '0', 10);

    const { data: product, isLoading, error } = useFinishedProduct(productId);
    const deleteProduct = useDeleteFinishedProduct();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('info');

    const handleDelete = async () => {
        try {
            await deleteProduct.mutateAsync(productId);
            navigate('/finished-products');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Đang tải sản phẩm...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error ? `Lỗi: ${(error as Error).message}` : 'Không tìm thấy sản phẩm'}
                    </div>
                    <Link
                        to="/finished-products"
                        className="text-primary hover:underline flex items-center gap-2 mt-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại Danh Sách Thành Phẩm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/finished-products"
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại Danh Sách Thành Phẩm
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                                {product.is_active ? (
                                    <span className="badge badge-success">Đang dùng</span>
                                ) : (
                                    <span className="badge badge-secondary">Ngưng dùng</span>
                                )}
                            </div>
                            <p className="text-gray-600">Mã: {product.code}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                to={`/finished-products/${productId}/edit`}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Chỉnh Sửa
                            </Link>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="btn btn-danger flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Xoá
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Package className="w-4 h-4" />
                        Thông Tin
                    </button>
                    <button
                        onClick={() => setActiveTab('formula')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'formula'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FlaskConical className="w-4 h-4" />
                        Công Thức
                    </button>
                </div>

                {/* Tab: Thông Tin */}
                {activeTab === 'info' && (
                    <>
                        {/* Thông Tin Cơ Bản */}
                        <div className="card mb-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Thông Tin Cơ Bản
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Mã Sản Phẩm</label>
                                    <p className="text-gray-900 font-medium">{product.code}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Tên Sản Phẩm</label>
                                    <p className="text-gray-900">{product.name}</p>
                                </div>
                                {product.name_en && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Tên Tiếng Anh</label>
                                        <p className="text-gray-900">{product.name_en}</p>
                                    </div>
                                )}
                                {product.category && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Danh Mục</label>
                                        <p className="text-gray-900">{product.category}</p>
                                    </div>
                                )}
                                {product.sub_category && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Danh Mục Con</label>
                                        <p className="text-gray-900">{product.sub_category}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Đơn Vị Tính</label>
                                    <p className="text-gray-900">{product.unit}</p>
                                </div>
                                {product.barcode && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Barcode</label>
                                        <p className="text-gray-900 font-mono">{product.barcode}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thông Số Kỹ Thuật */}
                        {(product.net_weight || product.gross_weight || product.volume) && (
                            <div className="card mb-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-primary" />
                                    Thông Số Kỹ Thuật
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {product.net_weight && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Khối Lượng Tịnh</label>
                                            <p className="text-gray-900">{product.net_weight} kg</p>
                                        </div>
                                    )}
                                    {product.gross_weight && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Khối Lượng Tổng</label>
                                            <p className="text-gray-900">{product.gross_weight} kg</p>
                                        </div>
                                    )}
                                    {product.volume && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Thể Tích</label>
                                            <p className="text-gray-900">{product.volume} m³</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quản Lý Tồn Kho */}
                        <div className="card mb-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Quản Lý Tồn Kho
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {product.min_stock_level !== undefined && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Tồn Kho Tối Thiểu</label>
                                        <p className="text-gray-900">{product.min_stock_level}</p>
                                    </div>
                                )}
                                {product.max_stock_level !== undefined && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Tồn Kho Tối Đa</label>
                                        <p className="text-gray-900">{product.max_stock_level}</p>
                                    </div>
                                )}
                                {product.reorder_point !== undefined && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Điểm Đặt Hàng Lại</label>
                                        <p className="text-gray-900">{product.reorder_point}</p>
                                    </div>
                                )}
                                {product.shelf_life_days && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Hạn Sử Dụng</label>
                                        <p className="text-gray-900">{product.shelf_life_days} ngày</p>
                                    </div>
                                )}
                                {product.storage_conditions && (
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-600">Điều Kiện Bảo Quản</label>
                                        <p className="text-gray-900 whitespace-pre-wrap">{product.storage_conditions}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Định Giá */}
                        {(product.standard_cost || product.selling_price) && (
                            <div className="card mb-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-primary" />
                                    Định Giá
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {product.standard_cost && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Giá Thành Chuẩn</label>
                                            <p className="text-gray-900 font-medium">
                                                {product.standard_cost.toLocaleString('vi-VN')} VNĐ
                                            </p>
                                        </div>
                                    )}
                                    {product.selling_price && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Giá Bán</label>
                                            <p className="text-gray-900 font-medium">
                                                {product.selling_price.toLocaleString('vi-VN')} VNĐ
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Ghi Chú */}
                        {product.notes && (
                            <div className="card mb-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Ghi Chú
                                </h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{product.notes}</p>
                            </div>
                        )}

                        {/* Thông Tin Hệ Thống */}
                        <div className="card">
                            <h2 className="text-xl font-semibold mb-4">Thông Tin Hệ Thống</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <label className="text-gray-600">Ngày Tạo</label>
                                    <p className="text-gray-900">
                                        {new Date(product.created_at).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-gray-600">Cập Nhật Lần Cuối</label>
                                    <p className="text-gray-900">
                                        {new Date(product.updated_at).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Tab: Công Thức */}
                {activeTab === 'formula' && (
                    <div className="card">
                        <ProductFormulaTab productId={productId} productName={product.name} />
                    </div>
                )}
            </div>

            {/* Audit Log History */}
            <div className="mt-6">
                <AuditLogPanel tableName="finished_products" recordId={product.id} />
            </div>

            {/* Modal Xác Nhận Xoá */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Xác Nhận Xoá</h3>
                        <p className="text-gray-700 mb-6">
                            Bạn có chắc muốn xoá sản phẩm <strong>{product.name}</strong>? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn btn-secondary"
                                disabled={deleteProduct.isPending}
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger"
                                disabled={deleteProduct.isPending}
                            >
                                {deleteProduct.isPending ? 'Đang xoá...' : 'Xoá'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
