import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Building2, Mail, Phone, MapPin, CreditCard, FileText, Package } from 'lucide-react';
import { useSupplier, useDeleteSupplier } from '../../hooks/useSuppliers';
import { useMaterials } from '../../hooks/useMaterials';
import AuditLogPanel from '../../components/common/AuditLogPanel';
import SupplierDocuments from '../../components/suppliers/SupplierDocuments';

export default function SupplierDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const supplierId = parseInt(id || '0', 10);

    const { data: supplier, isLoading, error } = useSupplier(supplierId);
    const deleteSupplier = useDeleteSupplier();
    const { data: materialsData } = useMaterials({ supplier_id: supplierId, page_size: 100 });
    const materials = materialsData?.data ?? [];

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteSupplier.mutateAsync(supplierId);
            navigate('/suppliers');
        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Đang tải nhà cung cấp...</div>
                </div>
            </div>
        );
    }

    if (error || !supplier) {
        return (
            <div className="animate-fade-in p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error ? `Lỗi: ${(error as Error).message}` : 'Không tìm thấy nhà cung cấp'}
                </div>
                <Link to="/suppliers" className="text-primary hover:underline flex items-center gap-2 mt-4">
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link to="/suppliers" className="text-primary hover:underline flex items-center gap-2 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
                                {supplier.is_active ? (
                                    <span className="badge badge-success">Đang hoạt động</span>
                                ) : (
                                    <span className="badge badge-secondary">Ngừng hoạt động</span>
                                )}
                            </div>
                            <p className="text-gray-600">Mã: {supplier.code}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link to={`/suppliers/${supplierId}/edit`} className="btn btn-secondary flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                Điều chỉnh
                            </Link>
                            <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="card">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                Thông Tin Cơ Bản
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Mã NCC</label>
                                    <p className="text-gray-900 font-medium">{supplier.code}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Tên (Tiếng Việt)</label>
                                    <p className="text-gray-900">{supplier.name}</p>
                                </div>
                                {supplier.name_en && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Tên (Tiếng Anh)</label>
                                        <p className="text-gray-900">{supplier.name_en}</p>
                                    </div>
                                )}
                                {supplier.tax_code && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Mã số thuế</label>
                                        <p className="text-gray-900">{supplier.tax_code}</p>
                                    </div>
                                )}
                                {(supplier as any).supplier_group && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Nhóm NCC</label>
                                        <p className="text-gray-900">{(supplier as any).supplier_group}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="card">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-primary" />
                                Thông Tin Liên Hệ
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {supplier.contact_person && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Người liên hệ</label>
                                        <p className="text-gray-900">{supplier.contact_person}</p>
                                    </div>
                                )}
                                {supplier.phone && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                            <Phone className="w-3.5 h-3.5" /> Điện thoại
                                        </label>
                                        <p className="text-gray-900">{supplier.phone}</p>
                                    </div>
                                )}
                                {supplier.email && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                            <Mail className="w-3.5 h-3.5" /> Email
                                        </label>
                                        <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
                                            {supplier.email}
                                        </a>
                                    </div>
                                )}
                                {supplier.address && (
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" /> Địa chỉ
                                        </label>
                                        <p className="text-gray-900">{supplier.address}</p>
                                        {(supplier.city || supplier.country) && (
                                            <p className="text-gray-500 text-sm mt-0.5">
                                                {[supplier.city, supplier.country].filter(Boolean).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nguyên Vật Liệu */}
                        <div className="card">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Nguyên Vật Liệu Cung Cấp
                                <span className="text-sm text-gray-400 font-normal">({materials.length})</span>
                            </h2>
                            {materials.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-2 pr-4 text-gray-500 font-medium">Mã NVL</th>
                                                <th className="text-left py-2 pr-4 text-gray-500 font-medium">Tên thương mại</th>
                                                <th className="text-left py-2 pr-4 text-gray-500 font-medium">Loại</th>
                                                <th className="text-left py-2 pr-4 text-gray-500 font-medium">Đơn vị</th>
                                                <th className="text-left py-2 text-gray-500 font-medium">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {materials.map((m: any) => (
                                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-2.5 pr-4">
                                                        <Link to={`/materials/${m.id}`} className="text-primary hover:underline font-medium">
                                                            {m.code}
                                                        </Link>
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-gray-800">{m.trading_name}</td>
                                                    <td className="py-2.5 pr-4">
                                                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                                            {m.material_type === 'packaging' ? 'Bao Bì' : 'Nguyên Liệu'}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-gray-600">{m.unit}</td>
                                                    <td className="py-2.5">
                                                        {m.is_active
                                                            ? <span className="badge badge-success text-xs">Hoạt động</span>
                                                            : <span className="badge badge-secondary text-xs">Ngừng</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Chưa có nguyên vật liệu nào liên kết với nhà cung cấp này.</p>
                            )}
                        </div>

                        {/* Documents — read only in detail view */}
                        <SupplierDocuments supplierId={supplierId} readOnly />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Terms */}
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Thanh Toán
                            </h2>
                            <div className="space-y-3">
                                {supplier.payment_terms && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Điều kiện</label>
                                        <p className="text-gray-900">{supplier.payment_terms}</p>
                                    </div>
                                )}
                                {supplier.credit_limit !== undefined && supplier.credit_limit !== null && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Hạn mức tín dụng</label>
                                        <p className="text-gray-900 font-semibold">
                                            {supplier.credit_limit.toLocaleString('vi-VN')} VND
                                        </p>
                                    </div>
                                )}
                                {!supplier.payment_terms && (supplier.credit_limit === undefined || supplier.credit_limit === null) && (
                                    <p className="text-sm text-gray-400 italic">Chưa có thông tin</p>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {supplier.notes && (
                            <div className="card">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Ghi Chú
                                </h2>
                                <p className="text-gray-700 whitespace-pre-wrap text-sm">{supplier.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Audit Log */}
                <div className="mt-6">
                    <AuditLogPanel tableName="suppliers" recordId={supplier.id} />
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold mb-4">Xác Nhận Xóa</h3>
                            <p className="text-gray-700 mb-6">
                                Bạn có chắc chắn muốn xóa nhà cung cấp <strong>{supplier.name}</strong>?
                                Thao tác này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="btn btn-secondary"
                                    disabled={deleteSupplier.isPending}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-danger"
                                    disabled={deleteSupplier.isPending}
                                >
                                    {deleteSupplier.isPending ? 'Đang xóa...' : 'Xóa'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
