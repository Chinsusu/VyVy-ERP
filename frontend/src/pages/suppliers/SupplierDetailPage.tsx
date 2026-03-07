import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit, Trash2, Building2, Phone, MapPin,
    CreditCard, FileText, Package, Users, CheckCircle, ShoppingCart
} from 'lucide-react';
import { useSupplier, useDeleteSupplier } from '../../hooks/useSuppliers';
import { useMaterials } from '../../hooks/useMaterials';
import AuditLogPanel from '../../components/common/AuditLogPanel';
import SupplierDocuments from '../../components/suppliers/SupplierDocuments';

function InfoRow({ label, value, link }: { label: string; value?: string | null; link?: string }) {
    if (!value) return null;
    return (
        <div className="flex items-start py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500 w-40 shrink-0">{label}</span>
            {link
                ? <a href={link} className="text-primary hover:underline text-sm font-medium">{value}</a>
                : <span className="text-sm font-medium text-gray-900">{value}</span>}
        </div>
    );
}

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
            <div className="animate-fade-in flex items-center justify-center py-24">
                <div className="flex items-center gap-2 text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                    Đang tải nhà cung cấp...
                </div>
            </div>
        );
    }

    if (error || !supplier) {
        return (
            <div className="animate-fade-in">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
                    {error ? `Lỗi: ${(error as Error).message}` : 'Không tìm thấy nhà cung cấp'}
                </div>
                <Link to="/suppliers" className="text-primary hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                </Link>
            </div>
        );
    }

    const activeMatCount = materials.filter((m: any) => m.is_active).length;

    return (
        <div className="animate-fade-in">
            {/* Back link */}
            <Link to="/suppliers" className="text-sm text-gray-500 hover:text-primary flex items-center gap-1.5 mb-4 w-fit transition-colors">
                <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </Link>

            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 shrink-0">
                        <Users className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
                            {supplier.is_active
                                ? <span className="badge badge-success">Đang hoạt động</span>
                                : <span className="badge badge-secondary">Ngừng hoạt động</span>}
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5">
                            <span className="font-mono text-primary font-semibold">{supplier.code}</span>
                            {supplier.tax_code && <span className="ml-3 text-gray-400">MST: {supplier.tax_code}</span>}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Link to={`/suppliers/${supplierId}/edit`} className="btn btn-secondary flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Điều chỉnh
                    </Link>
                    <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Xóa
                    </button>
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card py-3 flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
                        <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-gray-900">{materials.length}</p>
                        <p className="text-xs text-gray-500">Nguyên vật liệu</p>
                    </div>
                </div>
                <div className="card py-3 flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-green-50">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-gray-900">{activeMatCount}</p>
                        <p className="text-xs text-gray-500">NVL đang dùng</p>
                    </div>
                </div>
                <div className="card py-3 flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50">
                        <ShoppingCart className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-gray-900">—</p>
                        <p className="text-xs text-gray-500">Đơn mua hàng</p>
                    </div>
                </div>
            </div>

            {/* 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="card">
                        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" /> Thông Tin Cơ Bản
                        </h2>
                        <div>
                            <InfoRow label="Mã NCC" value={supplier.code} />
                            <InfoRow label="Tên (Tiếng Việt)" value={supplier.name} />
                            <InfoRow label="Tên (Tiếng Anh)" value={supplier.name_en} />
                            <InfoRow label="Mã số thuế" value={supplier.tax_code} />
                            <InfoRow label="Nhóm NCC" value={(supplier as any).supplier_group} />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="card">
                        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" /> Thông Tin Liên Hệ
                        </h2>
                        <div>
                            <InfoRow label="Người liên hệ" value={supplier.contact_person} />
                            <InfoRow label="Điện thoại" value={supplier.phone} link={supplier.phone ? `tel:${supplier.phone}` : undefined} />
                            <InfoRow label="Email" value={supplier.email} link={supplier.email ? `mailto:${supplier.email}` : undefined} />
                            {supplier.address && (
                                <div className="flex items-start py-2.5 border-b border-gray-50">
                                    <span className="text-sm text-gray-500 w-40 shrink-0 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" /> Địa chỉ
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{supplier.address}</p>
                                        {(supplier.city || supplier.country) && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {[supplier.city, supplier.country].filter(Boolean).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Materials */}
                    <div className="card">
                        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 text-primary" />
                            Nguyên Vật Liệu Cung Cấp
                            <span className="ml-auto text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{materials.length}</span>
                        </h2>
                        {materials.length > 0 ? (
                            <div className="table-container">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã NVL</th>
                                            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên thương mại</th>
                                            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Loại</th>
                                            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Đơn vị</th>
                                            <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {materials.map((m: any) => (
                                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-2.5 pr-4">
                                                    <Link to={`/materials/${m.id}`} className="font-mono text-primary hover:underline font-semibold">
                                                        {m.code}
                                                    </Link>
                                                </td>
                                                <td className="py-2.5 pr-4 text-gray-800 font-medium">{m.trading_name}</td>
                                                <td className="py-2.5 pr-4">
                                                    <span className="badge badge-secondary text-xs">
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
                            <div className="text-center py-8">
                                <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Chưa có nguyên vật liệu nào</p>
                            </div>
                        )}
                    </div>

                    {/* Documents */}
                    <SupplierDocuments supplierId={supplierId} readOnly />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Payment Terms */}
                    <div className="card">
                        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" /> Thanh Toán
                        </h2>
                        <div>
                            <InfoRow label="Điều kiện" value={supplier.payment_terms} />
                            {supplier.credit_limit !== undefined && supplier.credit_limit !== null && (
                                <div className="flex items-start py-2.5 border-b border-gray-50 last:border-0">
                                    <span className="text-sm text-gray-500 w-40 shrink-0">Hạn mức tín dụng</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {supplier.credit_limit.toLocaleString('vi-VN')} VND
                                    </span>
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
                            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" /> Ghi Chú
                            </h2>
                            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{supplier.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Audit Log */}
            <div className="mt-6">
                <AuditLogPanel tableName="suppliers" recordId={supplier.id} />
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Xác Nhận Xóa</h3>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm">
                            Bạn có chắc muốn xóa nhà cung cấp <strong className="text-gray-900">{supplier.name}</strong>?
                            Thao tác này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary" disabled={deleteSupplier.isPending}>
                                Hủy
                            </button>
                            <button onClick={handleDelete} className="btn btn-danger" disabled={deleteSupplier.isPending}>
                                {deleteSupplier.isPending ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
