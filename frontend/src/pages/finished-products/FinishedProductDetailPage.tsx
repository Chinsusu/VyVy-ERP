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
    Boxes,
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
            alert('Không thể xoá sản phẩm');
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

    if (error || !product) {
        return (
            <div className="animate-fade-in p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error ? `Lỗi: ${(error as Error).message}` : 'Không tìm thấy sản phẩm'}
                </div>
                <Link to="/finished-products" className="text-primary hover:underline flex items-center gap-2 mt-4">
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại Danh Sách
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Back */}
            <Link to="/finished-products" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4 text-sm">
                <ArrowLeft className="w-4 h-4" />
                Thành Phẩm
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                        <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                            {product.is_active ? (
                                <span className="badge badge-success">Đang dùng</span>
                            ) : (
                                <span className="badge badge-secondary">Ngưng dùng</span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm">Mã: <span className="font-mono font-semibold text-gray-700">{product.code}</span></p>
                        {product.name_en && <p className="text-gray-400 text-xs italic mt-0.5">{product.name_en}</p>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/finished-products/${productId}/edit`} className="btn btn-secondary flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Chỉnh Sửa
                    </Link>
                    <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Xoá
                    </button>
                </div>
            </div>

            {/* Info Bar compact */}
            <div className="card mb-6 py-3">
                <div className="flex divide-x divide-gray-200">
                    <div className="flex-1 px-4 first:pl-0">
                        <p className="text-xs text-gray-500">Danh mục</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">{product.category || '—'}</p>
                    </div>
                    <div className="flex-1 px-4">
                        <p className="text-xs text-gray-500">Danh mục con</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">{product.sub_category || '—'}</p>
                    </div>
                    <div className="flex-1 px-4">
                        <p className="text-xs text-gray-500">Đơn vị tính</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">{product.unit}</p>
                    </div>
                    {product.barcode && (
                        <div className="flex-1 px-4">
                            <p className="text-xs text-gray-500">Barcode</p>
                            <p className="font-mono font-medium text-sm text-gray-900 mt-0.5">{product.barcode}</p>
                        </div>
                    )}
                    <div className="flex-1 px-4 last:pr-0">
                        <p className="text-xs text-gray-500">Giá bán</p>
                        <p className="font-semibold text-sm text-gray-900 mt-0.5">
                            {product.selling_price ? `${product.selling_price.toLocaleString('vi-VN')} ₫` : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Package className="w-4 h-4" />
                    Thông Tin
                </button>
                <button
                    onClick={() => setActiveTab('formula')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'formula'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <FlaskConical className="w-4 h-4" />
                    Công Thức
                </button>
            </div>

            {/* Tab: Thông Tin — 2-col layout */}
            {activeTab === 'info' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cột trái 2/3 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Thông Tin Cơ Bản */}
                        <div className="card">
                            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                <Package className="w-4 h-4 text-primary" />
                                Thông Tin Cơ Bản
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="text-gray-500">Mã Sản Phẩm</label>
                                    <p className="font-mono font-semibold text-gray-900 mt-0.5">{product.code}</p>
                                </div>
                                <div>
                                    <label className="text-gray-500">Tên Sản Phẩm</label>
                                    <p className="text-gray-900 mt-0.5">{product.name}</p>
                                </div>
                                {product.name_en && (
                                    <div className="col-span-2">
                                        <label className="text-gray-500">Tên Tiếng Anh</label>
                                        <p className="text-gray-900 italic mt-0.5">{product.name_en}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-gray-500">Đơn Vị Tính</label>
                                    <p className="text-gray-900 font-medium mt-0.5">{product.unit}</p>
                                </div>
                                {product.barcode && (
                                    <div>
                                        <label className="text-gray-500">Barcode</label>
                                        <p className="text-gray-900 font-mono mt-0.5">{product.barcode}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thông Số Kỹ Thuật */}
                        {(product.net_weight || product.gross_weight || product.volume) && (
                            <div className="card">
                                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                    <Scale className="w-4 h-4 text-primary" />
                                    Thông Số Kỹ Thuật
                                </h3>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    {product.net_weight && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500 text-xs">Khối Lượng Tịnh</p>
                                            <p className="font-semibold mt-1">{product.net_weight} kg</p>
                                        </div>
                                    )}
                                    {product.gross_weight && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500 text-xs">Khối Lượng Tổng</p>
                                            <p className="font-semibold mt-1">{product.gross_weight} kg</p>
                                        </div>
                                    )}
                                    {product.volume && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500 text-xs">Thể Tích</p>
                                            <p className="font-semibold mt-1">{product.volume} m³</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Ghi Chú */}
                        {product.notes && (
                            <div className="card">
                                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    Ghi Chú
                                </h3>
                                <p className="text-gray-700 whitespace-pre-wrap text-sm">{product.notes}</p>
                            </div>
                        )}

                        {/* Audit Log — trong cột trái, không full-width ngoài grid */}
                        <AuditLogPanel tableName="finished_products" recordId={product.id} />
                    </div>

                    {/* Sidebar 1/3 */}
                    <div className="space-y-6">
                        {/* Định Giá */}
                        {(product.standard_cost || product.selling_price) && (
                            <div className="card">
                                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    Định Giá
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {product.standard_cost && (
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Giá Thành Chuẩn</span>
                                            <span className="font-semibold text-gray-900">{product.standard_cost.toLocaleString('vi-VN')} ₫</span>
                                        </div>
                                    )}
                                    {product.selling_price && (
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600">Giá Bán</span>
                                            <span className="font-semibold text-primary text-base">{product.selling_price.toLocaleString('vi-VN')} ₫</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quản Lý Tồn Kho */}
                        <div className="card">
                            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                <Boxes className="w-4 h-4 text-primary" />
                                Quản Lý Tồn Kho
                            </h3>
                            <div className="space-y-2 text-sm">
                                {product.min_stock_level !== undefined && (
                                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                                        <span className="text-gray-600">Tồn Kho Tối Thiểu</span>
                                        <span className="font-medium">{product.min_stock_level}</span>
                                    </div>
                                )}
                                {product.max_stock_level !== undefined && (
                                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                                        <span className="text-gray-600">Tồn Kho Tối Đa</span>
                                        <span className="font-medium">{product.max_stock_level}</span>
                                    </div>
                                )}
                                {product.reorder_point !== undefined && (
                                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                                        <span className="text-gray-600">Điểm Đặt Hàng Lại</span>
                                        <span className="font-medium">{product.reorder_point}</span>
                                    </div>
                                )}
                                {product.shelf_life_days && (
                                    <div className="py-1.5">
                                        <span className="text-gray-600">Hạn Sử Dụng</span>
                                        <p className="font-medium mt-0.5">{product.shelf_life_days} ngày</p>
                                    </div>
                                )}
                                {product.storage_conditions && (
                                    <div className="pt-2">
                                        <span className="text-gray-600">Điều Kiện Bảo Quản</span>
                                        <p className="text-gray-900 whitespace-pre-wrap mt-0.5">{product.storage_conditions}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hạn sử dụng / Ngày nếu cần */}
                        <div className="card">
                            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Danh Mục
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Danh mục</span>
                                    <p className="font-medium mt-0.5">{product.category || '—'}</p>
                                </div>
                                {product.sub_category && (
                                    <div>
                                        <span className="text-gray-500">Danh mục con</span>
                                        <p className="font-medium mt-0.5">{product.sub_category}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Công Thức */}
            {activeTab === 'formula' && (
                <div className="card">
                    <ProductFormulaTab productId={productId} productName={product.name} />
                </div>
            )}

            {/* Modal Xác Nhận Xoá */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Xác Nhận Xoá</h3>
                        <p className="text-gray-700 mb-6">
                            Bạn có chắc muốn xoá sản phẩm <strong>{product.name}</strong>? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary" disabled={deleteProduct.isPending}>
                                Huỷ
                            </button>
                            <button onClick={handleDelete} className="btn btn-danger" disabled={deleteProduct.isPending}>
                                {deleteProduct.isPending ? 'Đang xoá...' : 'Xoá'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
