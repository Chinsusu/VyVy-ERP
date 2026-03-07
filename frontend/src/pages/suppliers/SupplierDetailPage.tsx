import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Edit, Trash2, Building2, Phone, MapPin, CreditCard, FileText, Package } from 'lucide-react';
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

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
            <div className="animate-fade-in flex items-center justify-center h-64">
                <div className="flex items-center gap-2 text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    Đang tải...
                </div>
            </div>
        );
    }

    if (error || !supplier) {
        return (
            <div className="animate-fade-in p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    Lỗi tải dữ liệu: {error ? (error as Error).message : 'Không tìm thấy nhà cung cấp'}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Back */}
            <button
                onClick={() => navigate('/suppliers')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Nhà Cung Cấp
            </button>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
                            {supplier.is_active ? (
                                <span className="badge badge-success">Đang HĐ</span>
                            ) : (
                                <span className="badge badge-secondary">Ngừng HĐ</span>
                            )}
                        </div>
                        <p className="text-gray-600 mt-0.5">
                            <span className="font-mono font-semibold">{supplier.code}</span>
                            {supplier.tax_code && <span className="text-gray-400 ml-3">MST: {supplier.tax_code}</span>}
                        </p>
                        {(supplier as any).supplier_group && (
                            <p className="text-gray-400 text-xs italic mt-0.5">{(supplier as any).supplier_group}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link to={`/suppliers/${supplierId}/edit`} className="btn btn-secondary flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Điều chỉnh
                    </Link>
                    <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Xóa
                    </button>
                </div>
            </div>

            {/* Info Bar */}
            <div className="card mb-6 py-3">
                <div className="flex divide-x divide-gray-200">
                    <div className="flex-1 px-4 first:pl-0">
                        <p className="text-xs text-gray-500">Người liên hệ</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">{supplier.contact_person || '—'}</p>
                    </div>
                    <div className="flex-1 px-4">
                        <p className="text-xs text-gray-500">Điện thoại</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">
                            {supplier.phone
                                ? <a href={`tel:${supplier.phone}`} className="text-primary hover:underline">{supplier.phone}</a>
                                : '—'}
                        </p>
                    </div>
                    <div className="flex-1 px-4">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">
                            {supplier.email
                                ? <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">{supplier.email}</a>
                                : '—'}
                        </p>
                    </div>
                    <div className="flex-1 px-4">
                        <p className="text-xs text-gray-500">Tỉnh/TP</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">{supplier.city || '—'}</p>
                    </div>
                    <div className="flex-1 px-4 last:pr-0">
                        <p className="text-xs text-gray-500">Nguyên vật liệu</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">{materials.length} NVL</p>
                    </div>
                </div>
            </div>

            {/* 2-col layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Nguyên Vật Liệu Cung Cấp */}
                    <div className="card">
                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4 text-primary" />
                            Nguyên Vật Liệu Cung Cấp
                            <span className="text-sm text-gray-400 font-normal">({materials.length})</span>
                        </h3>
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
                                                    <Link to={`/materials/${m.id}`} className="text-primary hover:underline font-mono font-semibold">
                                                        {m.code}
                                                    </Link>
                                                </td>
                                                <td className="py-2.5 pr-4 text-gray-800">{m.trading_name}</td>
                                                <td className="py-2.5 pr-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.material_type === 'packaging' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {m.material_type === 'packaging' ? 'Bao Bì' : 'Nguyên Liệu'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 pr-4 text-gray-600">{m.unit}</td>
                                                <td className="py-2.5">
                                                    {m.is_active
                                                        ? <span className="badge badge-success">Hoạt động</span>
                                                        : <span className="badge badge-secondary">Ngừng</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Chưa có nguyên vật liệu nào.</p>
                        )}
                    </div>

                    {/* Tài Liệu */}
                    <SupplierDocuments supplierId={supplierId} readOnly />

                    {/* Audit Log — trong cột trái */}
                    <AuditLogPanel tableName="suppliers" recordId={supplier.id} />
                </div>

                {/* Sidebar 1/3 */}
                <div className="space-y-6">
                    {/* Thông Tin Liên Hệ */}
                    <div className="card">
                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" />
                            Thông Tin Liên Hệ
                        </h3>
                        <div className="space-y-3 text-sm">
                            {supplier.contact_person && (
                                <div>
                                    <p className="text-gray-500">Người liên hệ</p>
                                    <p className="font-medium text-gray-900 mt-0.5">{supplier.contact_person}</p>
                                </div>
                            )}
                            {supplier.phone && (
                                <div>
                                    <p className="text-gray-500">Điện thoại</p>
                                    <a href={`tel:${supplier.phone}`} className="font-medium text-primary hover:underline mt-0.5 block">{supplier.phone}</a>
                                </div>
                            )}
                            {supplier.email && (
                                <div>
                                    <p className="text-gray-500">Email</p>
                                    <a href={`mailto:${supplier.email}`} className="font-medium text-primary hover:underline mt-0.5 block">{supplier.email}</a>
                                </div>
                            )}
                            {supplier.address && (
                                <div>
                                    <p className="text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Địa chỉ</p>
                                    <p className="font-medium text-gray-900 mt-0.5">{supplier.address}</p>
                                    {(supplier.city || supplier.country) && (
                                        <p className="text-gray-400 text-xs mt-0.5">{[supplier.city, supplier.country].filter(Boolean).join(', ')}</p>
                                    )}
                                </div>
                            )}
                            {!supplier.contact_person && !supplier.phone && !supplier.email && !supplier.address && (
                                <p className="text-gray-400 italic">Chưa có thông tin.</p>
                            )}
                        </div>
                    </div>

                    {/* Thanh Toán */}
                    <div className="card">
                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            Thanh Toán
                        </h3>
                        <div className="space-y-3 text-sm">
                            {supplier.payment_terms && (
                                <div>
                                    <p className="text-gray-500">Điều kiện</p>
                                    <p className="font-medium text-gray-900 mt-0.5">{supplier.payment_terms}</p>
                                </div>
                            )}
                            {supplier.credit_limit !== undefined && supplier.credit_limit !== null && (
                                <div>
                                    <p className="text-gray-500">Hạn mức tín dụng</p>
                                    <p className="font-semibold text-gray-900 mt-0.5">
                                        {supplier.credit_limit.toLocaleString('vi-VN')} VND
                                    </p>
                                </div>
                            )}
                            {!supplier.payment_terms && (supplier.credit_limit === undefined || supplier.credit_limit === null) && (
                                <p className="text-gray-400 italic">Chưa có thông tin.</p>
                            )}
                        </div>
                    </div>

                    {/* Ghi Chú */}
                    {supplier.notes && (
                        <div className="card">
                            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Ghi Chú
                            </h3>
                            <p className="text-gray-700 whitespace-pre-wrap text-sm">{supplier.notes}</p>
                        </div>
                    )}

                    {/* Thông Tin Cơ Bản */}
                    <div className="card">
                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            Thông Tin Cơ Bản
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500">Mã NCC</p>
                                <p className="font-mono font-semibold text-gray-900 mt-0.5">{supplier.code}</p>
                            </div>
                            {supplier.name_en && (
                                <div>
                                    <p className="text-gray-500">Tên (Tiếng Anh)</p>
                                    <p className="text-gray-900 mt-0.5">{supplier.name_en}</p>
                                </div>
                            )}
                            {supplier.tax_code && (
                                <div>
                                    <p className="text-gray-500">Mã số thuế</p>
                                    <p className="font-medium text-gray-900 mt-0.5">{supplier.tax_code}</p>
                                </div>
                            )}
                            {(supplier as any).supplier_group && (
                                <div>
                                    <p className="text-gray-500">Nhóm NCC</p>
                                    <p className="font-medium text-gray-900 mt-0.5">{(supplier as any).supplier_group}</p>
                                </div>
                            )}
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
                            Bạn có chắc muốn xóa <strong>{supplier.name}</strong>? Thao tác này không thể hoàn tác.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary" disabled={deleteSupplier.isPending}>
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
