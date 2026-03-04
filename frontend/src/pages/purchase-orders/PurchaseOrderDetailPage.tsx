import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit, CheckCircle, XCircle, Trash2,
    Truck, Building2, Calendar, FileText, Package,
    Plus, History, User, Clock, ArrowRight
} from 'lucide-react';

const PO_FIELD_LABELS: Record<string, string> = {
    order_date: 'Ngày đặt hàng',
    expected_delivery_date: 'Ngày giao dự kiến',
    status: 'Trạng thái',
    supplier_id: 'Nhà cung cấp',
    warehouse_id: 'Kho nhận',
    subtotal: 'Tạm tính',
    tax_amount: 'Thuế',
    discount_amount: 'Giảm giá',
    total_amount: 'Tổng cộng',
    payment_terms: 'Điều khoản thanh toán',
    shipping_method: 'Phương thức vận chuyển',
    notes: 'Ghi chú',
    po_number: 'Mã PO',
    items: 'Danh sách sản phẩm',
};

interface ItemSnapshot {
    material_id: number;
    material_name?: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    discount_rate: number;
    expected_delivery_date?: string;
    notes?: string;
}

function renderItemDiff(oldItems: ItemSnapshot[], newItems: ItemSnapshot[]) {
    const ITEM_LABELS: Record<string, string> = {
        quantity: 'Số lượng',
        unit_price: 'Đơn giá',
        tax_rate: 'Thuế (%)',
        discount_rate: 'Giảm giá (%)',
        expected_delivery_date: 'Ngày giao',
        notes: 'Ghi chú',
    };
    const diffs: Array<{ materialId: number; field: string; oldVal: unknown; newVal: unknown }> = [];
    const newMap = new Map(newItems.map(it => [it.material_id, it]));
    const oldMap = new Map(oldItems.map(it => [it.material_id, it]));

    // Added items
    newMap.forEach((_newIt, mid) => {
        if (!oldMap.has(mid)) {
            diffs.push({ materialId: mid, field: '__added__', oldVal: null, newVal: null });
        }
    });
    // Removed items
    oldMap.forEach((_oldIt, mid) => {
        if (!newMap.has(mid)) {
            diffs.push({ materialId: mid, field: '__removed__', oldVal: null, newVal: null });
        }
    });
    // Changed fields (exclude metadata fields)
    const COMPARABLE_FIELDS = ['quantity', 'unit_price', 'tax_rate', 'discount_rate', 'expected_delivery_date', 'notes'] as (keyof ItemSnapshot)[];
    newMap.forEach((newIt, mid) => {
        const oldIt = oldMap.get(mid);
        if (!oldIt) return;
        COMPARABLE_FIELDS.forEach(f => {
            if (String(oldIt[f] ?? '') !== String(newIt[f] ?? '')) {
                diffs.push({ materialId: mid, field: f, oldVal: oldIt[f], newVal: newIt[f] });
            }
        });
    });
    if (diffs.length === 0) return <span className="text-xs text-gray-400">Không có thay đổi chi tiết</span>;
    const getMaterialLabel = (mid: number) => {
        const item = newMap.get(mid) || oldMap.get(mid);
        return item?.material_name ? item.material_name : `#${mid}`;
    };
    return (
        <div className="space-y-1">
            {diffs.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-gray-500 min-w-[160px] pt-0.5">
                        {d.field === '__added__' ? `Thêm: ${getMaterialLabel(d.materialId)}` :
                            d.field === '__removed__' ? `Xóa: ${getMaterialLabel(d.materialId)}` :
                                `${getMaterialLabel(d.materialId)} – ${ITEM_LABELS[d.field] || d.field}`}:
                    </span>
                    {d.field !== '__added__' && d.field !== '__removed__' && (
                        <div className="flex items-center gap-1 flex-wrap">
                            <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded line-through">{poFormatValue(d.oldVal)}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{poFormatValue(d.newVal)}</span>
                        </div>
                    )}
                    {(d.field === '__added__') && <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Thêm mới</span>}
                    {(d.field === '__removed__') && <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded line-through">Đã xóa</span>}
                </div>
            ))}
        </div>
    );
}

function poFormatValue(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Có' : 'Không';
    if (typeof value === 'number') return value.toLocaleString('vi-VN');
    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString('vi-VN');
        return value;
    }
    return String(value);
}
import {
    usePurchaseOrder,
    useApprovePurchaseOrder,
    useCancelPurchaseOrder,
    useDeletePurchaseOrder
} from '../../hooks/usePurchaseOrders';
import type { PurchaseOrderItem } from '../../types/purchaseOrder';
import { useAuditLogs } from '../../hooks/useAuditLogs';


export default function PurchaseOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const poId = parseInt(id || '0', 10);

    const { data: po, isLoading, error } = usePurchaseOrder(poId);

    const approveMutation = useApprovePurchaseOrder();
    const cancelMutation = useCancelPurchaseOrder();
    const deleteMutation = useDeletePurchaseOrder();

    const [showConfirmModal, setShowConfirmModal] = useState<'approve' | 'cancel' | 'delete' | null>(null);
    const { data: auditLogs } = useAuditLogs('purchase_orders', poId);


    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center">
                <div className="text-gray-500">Đang tải thông tin đơn hàng...</div>
            </div>
        );
    }

    if (error || !po) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error ? `Lỗi: ${(error as Error).message}` : 'Không tìm thấy đơn hàng'}
                    </div>
                    <Link to="/purchase-orders" className="btn btn-secondary mt-4">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    const handleApprove = async () => {
        try {
            await approveMutation.mutateAsync(poId);
            setShowConfirmModal(null);
            alert('Duyệt đơn thành công!');
        } catch (err) {
            alert('Duyệt đơn thất bại');
        }
    };

    const handleCancel = async () => {
        try {
            await cancelMutation.mutateAsync(poId);
            setShowConfirmModal(null);
            alert('Hủy đơn thành công!');
        } catch (err) {
            alert('Hủy đơn thất bại');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(poId);
            navigate('/purchase-orders');
            alert('Xóa đơn thành công!');
        } catch (err) {
            alert('Xóa đơn thất bại');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <span className="badge badge-secondary py-1.5 px-3 text-sm">Nháp</span>;
            case 'approved': return <span className="badge badge-success py-1.5 px-3 text-sm">Đã duyệt</span>;
            case 'cancelled': return <span className="badge badge-danger py-1.5 px-3 text-sm">Đã hủy</span>;
            default: return <span className="badge py-1.5 px-3 text-sm">{status}</span>;
        }
    };

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header and Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link to="/purchase-orders" className="text-primary hover:underline flex items-center gap-2 mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại danh sách
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className="text-slate-900">{po.po_number}</h1>
                            {getStatusBadge(po.status)}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {po.status === 'draft' && (
                            <>
                                <Link to={`/purchase-orders/${poId}/edit`} className="btn btn-secondary flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Chỉnh sửa
                                </Link>
                                <button
                                    onClick={() => setShowConfirmModal('approve')}
                                    className="btn btn-success flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Duyệt đơn
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal('delete')}
                                    className="btn btn-danger flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa đơn
                                </button>
                            </>
                        )}
                        {po.status === 'approved' && (
                            <>
                                <Link to={`/purchase-orders/${poId}/edit`} className="btn btn-secondary flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Chỉnh sửa
                                </Link>
                                <button
                                    onClick={() => setShowConfirmModal('cancel')}
                                    className="btn btn-warning flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Hủy đơn
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* PO Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Info */}
                        <div className="card grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2 border-b pb-2">
                                    <Truck className="w-4 h-4" /> Nhà cung cấp
                                </h3>
                                <div className="space-y-2">
                                    <p className="font-bold text-premium-lg text-primary">{po.supplier?.name}</p>
                                    <p className="text-sm text-gray-600">Mã: {po.supplier?.code}</p>
                                    <p className="text-sm text-gray-600">{po.supplier?.email}</p>
                                    <p className="text-sm text-gray-600">{po.supplier?.phone}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2 border-b pb-2">
                                    <Building2 className="w-4 h-4" /> Kho / Giao hàng
                                </h3>
                                <div className="space-y-2">
                                    <p className="font-bold text-premium-lg">{po.warehouse?.name}</p>
                                    <p className="text-sm text-gray-600">Mã: {po.warehouse?.code}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Ngày đặt hàng: {new Date(po.order_date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    {po.expected_delivery_date && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Ngày giao dự kiến: {new Date(po.expected_delivery_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="card p-0 overflow-hidden">
                            <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Danh sách hàng hóa
                                </h3>
                                <span className="text-sm text-gray-500">{(po.items || []).length} mặt hàng</span>
                            </div>
                            <div className="table-container">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-600 border-b">
                                            <th className="py-3 px-6 text-left">Mã NVL</th>
                                            <th className="py-3 px-6 text-left">Tên nguyên vật liệu</th>
                                            <th className="py-3 px-4 text-right">Số lượng</th>
                                            <th className="py-3 px-4 text-left">ĐVT</th>
                                            <th className="py-3 px-6 text-right">Đơn giá</th>
                                            <th className="py-3 px-4 text-right">Thuế (%)</th>
                                            <th className="py-3 px-6 text-left">Ngày giao DK</th>
                                            <th className="py-3 px-6 text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(po.items || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-8 text-gray-500 italic">
                                                    Không có mặt hàng nào trong đơn này.
                                                </td>
                                            </tr>
                                        ) : (
                                            po.items.map((item: PurchaseOrderItem) => (
                                                <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6 text-left">
                                                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">{item.material?.code}</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-left">
                                                        <p className="font-medium">{item.material?.trading_name}</p>
                                                        {item.notes && <p className="text-xs text-gray-400 mt-1">Ghi chú: {item.notes}</p>}
                                                        {(item as any).attachments && (() => {
                                                            try {
                                                                const atts = JSON.parse((item as any).attachments);
                                                                return atts.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {atts.map((att: any, ai: number) => (
                                                                            <a key={ai} href={att.url} target="_blank" rel="noopener noreferrer"
                                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px] text-blue-700 hover:underline">
                                                                                📎 {att.name}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                ) : null;
                                                            } catch { return null; }
                                                        })()}
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-medium">{item.quantity}</td>
                                                    <td className="py-4 px-4 text-left text-sm text-gray-500">{item.material?.unit || '—'}</td>
                                                    <td className="py-4 px-6 text-right">{item.unit_price.toLocaleString('vi-VN')}</td>
                                                    <td className="py-4 px-4 text-right text-gray-500">{item.tax_rate}%</td>
                                                    <td className="py-4 px-6 text-left text-sm text-gray-600">
                                                        {(item as any).expected_delivery_date
                                                            ? new Date((item as any).expected_delivery_date).toLocaleDateString('vi-VN')
                                                            : <span className="text-gray-300">—</span>}
                                                    </td>
                                                    <td className="py-4 px-6 text-right font-bold text-primary">
                                                        {item.line_total.toLocaleString('vi-VN')}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {po.notes && (
                            <div className="card space-y-4">
                                <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2 border-b pb-2">
                                    <FileText className="w-4 h-4" /> Ghi chú
                                </h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{po.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Totals & Metadata Sidebar */}
                    <div className="space-y-8">
                        <div className="card bg-primary/5 border-primary/20">
                            <h3 className="font-bold text-premium-lg mb-6 flex items-center gap-2 text-primary">
                                Tóm tắt đơn hàng
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span>{po.subtotal.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Thuế</span>
                                    <span>{po.tax_amount.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Giảm giá</span>
                                    <span>- {po.discount_amount.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="border-t border-primary/20 pt-4 mt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-gray-700">Tổng cộng</span>
                                        <div className="text-right">
                                            <p className="text-premium-2xl font-black text-primary leading-tight">
                                                {po.total_amount.toLocaleString('vi-VN')}
                                            </p>
                                            <p className="text-[length:var(--font-size-3xs)] text-gray-500 uppercase font-bold tracking-widest mt-1">VND</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Timeline - full width at the bottom, dọ kiểu MR */}
            <div className="mt-8 card">
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-6 tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Timeline
                </h3>
                <div className="relative">
                    {/* Dường dọc */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
                    <div className="space-y-4">

                        {/* Đã tạo */}
                        <div className="relative pl-10">
                            <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                            <Plus className="w-3 h-3" /> Tạo mới
                                        </span>
                                        {po.created_by_user && (
                                            <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                {po.created_by_user.full_name || po.created_by_user.username}
                                            </span>
                                        )}
                                    </div>
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {new Date(po.created_at).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Bản ghi được tạo lần đầu</p>
                            </div>
                        </div>

                        {/* Audit log entries (UPDATE, DELETE) */}
                        {auditLogs && auditLogs.filter((log: { action: string }) => log.action !== 'CREATE').map((log: {
                            id: number; action: string; username?: string; created_at: string;
                            changed_fields?: string[]; old_values?: Record<string, unknown>; new_values?: Record<string, unknown>
                        }) => (
                            <div key={log.id} className="relative pl-10">
                                <div className={`absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-white ${log.action === 'DELETE' ? 'bg-red-500' : 'bg-blue-500'
                                    }`} />
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            {log.action === 'UPDATE' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                                    <Edit className="w-3 h-3" /> Chỉnh sửa
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                                    <XCircle className="w-3 h-3" /> Xóa
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                {log.username || 'Hệ thống'}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.created_at).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    {log.action === 'UPDATE' && log.changed_fields && log.changed_fields.length > 0 && (() => {
                                        const NOISE_FIELDS = new Set(['updated_at', 'created_at', 'deleted_at', 'updated_by', 'created_by']);
                                        const visibleFields = log.changed_fields.filter((f: string) => !NOISE_FIELDS.has(f));
                                        if (visibleFields.length === 0) return null;
                                        return (
                                            <div className="space-y-1 mt-2">
                                                {visibleFields.map((field: string) => {
                                                    if (field === 'items') {
                                                        const oldItems = (log.old_values?.['items'] as ItemSnapshot[]) || [];
                                                        const newItems = (log.new_values?.['items'] as ItemSnapshot[]) || [];
                                                        return (
                                                            <div key={field} className="text-xs">
                                                                <span className="text-gray-500 font-medium">Danh sách sản phẩm:</span>
                                                                <div className="mt-1 pl-2 border-l-2 border-blue-100">
                                                                    {renderItemDiff(oldItems, newItems)}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    const label = PO_FIELD_LABELS[field] || field;
                                                    const oldVal = log.old_values?.[field];
                                                    const newVal = log.new_values?.[field];
                                                    return (
                                                        <div key={field} className="flex items-start gap-2 text-xs">
                                                            <span className="text-gray-500 min-w-[140px] pt-0.5">{label}:</span>
                                                            <div className="flex items-center gap-1 flex-wrap">
                                                                <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded line-through">
                                                                    {poFormatValue(oldVal)}
                                                                </span>
                                                                <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                                                                <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                                                                    {poFormatValue(newVal)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>
                        ))}

                        {/* Đã duyệt */}
                        {po.approved_at && (
                            <div className="relative pl-10">
                                <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                                <CheckCircle className="w-3 h-3" /> Đã duyệt
                                            </span>
                                            {po.approved_by_user && (
                                                <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                                    {po.approved_by_user.full_name || po.approved_by_user.username}
                                                </span>
                                            )}
                                        </div>
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            {new Date(po.approved_at).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Đã hủy */}
                        {po.status === 'cancelled' && (
                            <div className="relative pl-10">
                                <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-white bg-red-500" />
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                        <XCircle className="w-3 h-3" /> Đã hủy
                                    </span>
                                </div>
                            </div>
                        )}

                        {!auditLogs && (
                            <div className="relative pl-10 text-sm text-gray-400">Đang tải lịch sử...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* AuditLogPanel đã được gộp vào Timeline card sidebar */}

            {/* Confirmation Modals */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 space-y-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-premium-2xl font-bold text-gray-900">
                                {showConfirmModal === 'approve' ? 'Duyệt đơn hàng?' :
                                    showConfirmModal === 'cancel' ? 'Hủy đơn hàng?' : 'Xóa đơn hàng?'}
                            </h3>
                            <p className="text-gray-500">
                                Bạn có chắc muốn {showConfirmModal === 'approve' ? 'duyệt' : showConfirmModal === 'cancel' ? 'hủy' : 'xóa'} đơn mua hàng <strong>{po.po_number}</strong>?
                                {showConfirmModal === 'delete' && ' Hành động này không thể hoàn tác.'}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConfirmModal(null)}
                                className="btn btn-secondary flex-1"
                                disabled={approveMutation.isPending || cancelMutation.isPending || deleteMutation.isPending}
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={
                                    showConfirmModal === 'approve' ? handleApprove :
                                        showConfirmModal === 'cancel' ? handleCancel :
                                            handleDelete
                                }
                                className={`btn flex-1 ${showConfirmModal === 'delete' ? 'btn-danger' :
                                    showConfirmModal === 'approve' ? 'btn-success' : 'btn-warning'
                                    }`}
                                disabled={approveMutation.isPending || cancelMutation.isPending || deleteMutation.isPending}
                            >
                                {approveMutation.isPending || cancelMutation.isPending || deleteMutation.isPending ? 'Đang xử lý...' :
                                    showConfirmModal === 'approve' ? 'Xác nhận duyệt' :
                                        showConfirmModal === 'cancel' ? 'Xác nhận hủy' : 'Xác nhận xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
