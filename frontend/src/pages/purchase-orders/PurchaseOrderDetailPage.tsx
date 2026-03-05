import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit, CheckCircle, XCircle, Trash2,
    Truck, Building2, Calendar, FileText, Package, UserCheck,
} from 'lucide-react';


import {
    usePurchaseOrder,
    useApprovePurchaseOrder,
    useCancelPurchaseOrder,
    useDeletePurchaseOrder,
    useUpdatePOOrderStatus,
    useUpdatePOPaymentStatus,
    useUpdatePOInvoiceStatus,
    useAssignPO,
} from '../../hooks/usePurchaseOrders';
import { useUsers } from '../../hooks/useUsers';
import type { PurchaseOrderItem } from '../../types/purchaseOrder';
import AuditLogPanel from '../../components/common/AuditLogPanel';
import PODocuments from '../../components/purchase-orders/PODocuments';


export default function PurchaseOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const poId = parseInt(id || '0', 10);

    const { data: po, isLoading, error } = usePurchaseOrder(poId);

    const approveMutation = useApprovePurchaseOrder();
    const cancelMutation = useCancelPurchaseOrder();
    const deleteMutation = useDeletePurchaseOrder();
    const updateOrderStatusMutation = useUpdatePOOrderStatus();
    const updatePaymentStatusMutation = useUpdatePOPaymentStatus();
    const updateInvoiceStatusMutation = useUpdatePOInvoiceStatus();
    const assignMutation = useAssignPO();
    const { data: users = [] } = useUsers();
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAssignee, setSelectedAssignee] = useState<number | null>(null);

    const [showConfirmModal, setShowConfirmModal] = useState<'approve' | 'cancel' | 'delete' | null>(null);
    const [activeWorkflow, setActiveWorkflow] = useState<'order' | 'payment' | 'invoice' | null>(null);
    const [workflowForm, setWorkflowForm] = useState({ order_status: 'ordered', payment_status: 'partial', invoice_status: 'received', invoice_number: '', invoice_date: '', notes: '' });




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

    const handleUpdateOrderStatus = async () => {
        try {
            await updateOrderStatusMutation.mutateAsync({ id: poId, input: { order_status: workflowForm.order_status, notes: workflowForm.notes } });
            setActiveWorkflow(null);
        } catch (err: any) { alert(err?.response?.data?.message || 'Có lỗi xảy ra'); }
    };


    const handleUpdatePaymentStatus = async () => {
        try {
            await updatePaymentStatusMutation.mutateAsync({ id: poId, input: { payment_status: workflowForm.payment_status, notes: workflowForm.notes } });
            setActiveWorkflow(null);
        } catch (err: any) { alert(err?.response?.data?.message || 'Có lỗi xảy ra'); }
    };

    const handleUpdateInvoiceStatus = async () => {
        try {
            await updateInvoiceStatusMutation.mutateAsync({ id: poId, input: { invoice_status: workflowForm.invoice_status, invoice_number: workflowForm.invoice_number, invoice_date: workflowForm.invoice_date } });
            setActiveWorkflow(null);
        } catch (err: any) { alert(err?.response?.data?.message || 'Có lỗi xảy ra'); }
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
        <div className="animate-fade-in space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/purchase-orders" className="text-primary hover:underline flex items-center gap-2 mb-1 text-sm">
                        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-slate-900">{po.po_number}</h1>
                        {getStatusBadge(po.status)}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {po.status === 'draft' && (
                        <>
                            <Link to={`/purchase-orders/${poId}/edit`} className="btn btn-secondary flex items-center gap-2">
                                <Edit className="w-4 h-4" /> Chỉnh sửa
                            </Link>
                            <button onClick={() => setShowConfirmModal('approve')} className="btn btn-success flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Duyệt đơn
                            </button>
                            <button onClick={() => setShowConfirmModal('delete')} className="btn btn-danger flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Xóa đơn
                            </button>
                        </>
                    )}
                    {po.status === 'approved' && (
                        <>
                            <Link to={`/purchase-orders/${poId}/edit`} className="btn btn-secondary flex items-center gap-2">
                                <Edit className="w-4 h-4" /> Chỉnh sửa
                            </Link>
                            <button onClick={() => setShowConfirmModal('cancel')} className="btn btn-warning flex items-center gap-2">
                                <XCircle className="w-4 h-4" /> Hủy đơn
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Info Bar compact ── */}
            <div className="card py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
                    <div className="px-4 first:pl-0">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Nhà cung cấp
                        </p>
                        <p className="font-bold text-sm text-primary truncate">{po.supplier?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{po.supplier?.code}</p>
                    </div>
                    <div className="px-4">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> Kho nhận
                        </p>
                        <p className="font-bold text-sm truncate">{po.warehouse?.name}</p>
                        <p className="text-xs text-gray-400">{po.warehouse?.code}</p>
                    </div>
                    <div className="px-4">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Ngày đặt
                        </p>
                        <p className="font-semibold text-sm">{new Date(po.order_date).toLocaleDateString('vi-VN')}</p>
                        {po.expected_delivery_date && (
                            <p className="text-xs text-gray-400">Giao DK: {new Date(po.expected_delivery_date).toLocaleDateString('vi-VN')}</p>
                        )}
                    </div>
                    <div className="px-4">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Tổng tiền
                        </p>
                        <p className="font-black text-base text-primary">
                            {po.total_amount.toLocaleString('vi-VN')} <span className="text-xs font-normal text-gray-400">VND</span>
                        </p>
                        <p className="text-xs text-gray-400">{(po.items || []).length} mặt hàng</p>
                    </div>
                </div>
            </div>

            {/* ── 2-column grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── LEFT col: Items + Notes + AuditLog ── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Items Table */}
                    <div className="card p-0 overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2 text-sm">
                                <Package className="w-4 h-4 text-primary" /> Danh sách hàng hóa
                            </h3>
                            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
                                {(po.items || []).length} mặt hàng
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 border-b text-xs uppercase tracking-wide">
                                        <th className="py-3 px-4 text-left font-semibold">Mã</th>
                                        <th className="py-3 px-4 text-left font-semibold">Tên nguyên vật liệu</th>
                                        <th className="py-3 px-3 text-right font-semibold">SL</th>
                                        <th className="py-3 px-3 text-left font-semibold">ĐVT</th>
                                        <th className="py-3 px-4 text-right font-semibold">Đơn giá</th>
                                        <th className="py-3 px-3 text-right font-semibold">Thuế</th>
                                        <th className="py-3 px-4 text-left font-semibold">Giao DK</th>
                                        <th className="py-3 px-4 text-right font-semibold">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(po.items || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-10 text-gray-400 italic text-sm">
                                                Không có mặt hàng nào trong đơn này.
                                            </td>
                                        </tr>
                                    ) : (
                                        po.items.map((item: PurchaseOrderItem) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50/80 transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.material?.code}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-sm text-gray-800">{item.material?.trading_name}</p>
                                                    {item.notes && <p className="text-xs text-gray-400 mt-0.5">Ghi chú: {item.notes}</p>}
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
                                                <td className="py-3 px-3 text-right font-semibold text-sm">{item.quantity}</td>
                                                <td className="py-3 px-3 text-left text-xs text-gray-400">{item.material?.unit || '—'}</td>
                                                <td className="py-3 px-4 text-right text-sm">{item.unit_price.toLocaleString('vi-VN')}</td>
                                                <td className="py-3 px-3 text-right text-xs text-gray-400">{item.tax_rate}%</td>
                                                <td className="py-3 px-4 text-left text-xs text-gray-500">
                                                    {(item as any).expected_delivery_date
                                                        ? new Date((item as any).expected_delivery_date).toLocaleDateString('vi-VN')
                                                        : <span className="text-gray-300">—</span>}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-primary text-sm">
                                                    {item.line_total.toLocaleString('vi-VN')}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Totals footer */}
                        <div className="px-6 py-4 bg-gray-50/80 border-t space-y-1.5">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tạm tính</span><span>{po.subtotal.toLocaleString('vi-VN')} VND</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Thuế</span><span>+{po.tax_amount.toLocaleString('vi-VN')} VND</span>
                            </div>
                            {po.discount_amount > 0 && (
                                <div className="flex justify-between text-sm text-red-500">
                                    <span>Giảm giá</span><span>−{po.discount_amount.toLocaleString('vi-VN')} VND</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-1">
                                <span className="font-bold text-gray-700">Tổng cộng</span>
                                <span className="text-xl font-black text-primary">
                                    {po.total_amount.toLocaleString('vi-VN')} <span className="text-xs font-normal text-gray-400">VND</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ghi chú */}
                    {po.notes && (
                        <div className="card">
                            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4" /> Ghi chú
                            </h3>
                            <p className="text-gray-700 whitespace-pre-wrap text-sm">{po.notes}</p>
                        </div>
                    )}

                    {/* Lịch sử thay đổi */}
                    <AuditLogPanel tableName="purchase_orders" recordId={poId} />
                </div>

                {/* ── RIGHT col: Người phụ trách + Tiến trình + Chứng từ ── */}
                <div className="space-y-6">

                    {/* Người phụ trách */}
                    <div className="card">
                        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                            <UserCheck className="w-4 h-4 text-primary" /> Người phụ trách
                        </h3>
                        {po.assigned_to_user ? (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                                    style={{ background: `linear-gradient(135deg, hsl(${(po.assigned_to_user.full_name || po.assigned_to_user.username).charCodeAt(0) * 5 % 360}, 65%, 50%), hsl(${(po.assigned_to_user.full_name || po.assigned_to_user.username).charCodeAt(0) * 5 % 360 + 40}, 65%, 40%))` }}>
                                    {(po.assigned_to_user.full_name || po.assigned_to_user.username).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 truncate">{po.assigned_to_user.full_name || po.assigned_to_user.username}</p>
                                    <p className="text-xs text-gray-400 truncate">@{po.assigned_to_user.username}</p>
                                </div>
                                <button
                                    onClick={() => { setSelectedAssignee(po.assigned_to ?? null); setShowAssignModal(true); }}
                                    className="flex-shrink-0 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                                >Đổi</button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-2">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <UserCheck className="w-5 h-5 text-gray-300" />
                                </div>
                                <p className="text-xs text-gray-400 italic">Chưa có người phụ trách</p>
                                <button
                                    onClick={() => { setSelectedAssignee(null); setShowAssignModal(true); }}
                                    className="btn btn-primary text-xs py-1.5 w-full"
                                >Phân công</button>
                            </div>
                        )}
                    </div>

                    {/* Tiến trình xử lý */}
                    {po.status !== 'draft' && po.status !== 'cancelled' && (
                        <div className="card">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                                <CheckCircle className="w-4 h-4 text-primary" /> Tiến trình xử lý
                            </h3>
                            <div className="space-y-1">

                                {/* B4: Đặt hàng */}
                                <div className="rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                                    <div className="flex items-center justify-between py-2 px-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${po.order_status === 'ordered' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Đặt hàng</p>
                                                <span className={`text-xs font-medium ${po.order_status === 'ordered' ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {po.order_status === 'ordered' ? 'Đã đặt' : 'Chưa đặt'}
                                                </span>
                                            </div>
                                        </div>
                                        {po.order_status !== 'ordered' && (
                                            <button type="button"
                                                onClick={() => { setWorkflowForm(f => ({ ...f, notes: '' })); setActiveWorkflow(activeWorkflow === 'order' ? null : 'order'); }}
                                                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${activeWorkflow === 'order' ? 'bg-gray-100 text-gray-600' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                                                {activeWorkflow === 'order' ? 'Đóng' : 'Xác nhận'}
                                            </button>
                                        )}
                                    </div>
                                    {activeWorkflow === 'order' && (
                                        <div className="mx-1 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-500 mb-2">Ghi chú (tùy chọn)</p>
                                            <textarea className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-primary" rows={2}
                                                placeholder="Ví dụ: Đã gửi PO qua email NCC ngày..."
                                                value={workflowForm.notes} onChange={e => setWorkflowForm(f => ({ ...f, notes: e.target.value }))} />
                                            <button type="button" onClick={handleUpdateOrderStatus} disabled={updateOrderStatusMutation.isPending}
                                                className="mt-2 w-full btn btn-primary text-sm py-1.5">
                                                {updateOrderStatusMutation.isPending ? 'Đang lưu...' : 'Xác nhận đã đặt hàng'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-dashed border-gray-100" />

                                {/* B5: Thanh toán */}
                                <div className="rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                                    <div className="flex items-center justify-between py-2 px-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${po.payment_status === 'completed' ? 'bg-green-500' : po.payment_status === 'partial' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Thanh toán</p>
                                                <span className={`text-xs font-medium ${po.payment_status === 'completed' ? 'text-green-600' : po.payment_status === 'partial' ? 'text-yellow-600' : 'text-gray-400'}`}>
                                                    {po.payment_status === 'completed' ? 'Hoàn thành' : po.payment_status === 'partial' ? 'Một phần' : 'Chưa thanh toán'}
                                                </span>
                                            </div>
                                        </div>
                                        {po.payment_status !== 'completed' && (
                                            <button type="button"
                                                onClick={() => { setWorkflowForm(f => ({ ...f, payment_status: po.payment_status === 'partial' ? 'completed' : 'partial', notes: '' })); setActiveWorkflow(activeWorkflow === 'payment' ? null : 'payment'); }}
                                                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${activeWorkflow === 'payment' ? 'bg-gray-100 text-gray-600' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                                                {activeWorkflow === 'payment' ? 'Đóng' : 'Cập nhật'}
                                            </button>
                                        )}
                                    </div>
                                    {activeWorkflow === 'payment' && (
                                        <div className="mx-1 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-500 mb-2">Trạng thái thanh toán</p>
                                            <select className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-primary mb-2"
                                                value={workflowForm.payment_status} onChange={e => setWorkflowForm(f => ({ ...f, payment_status: e.target.value }))}>
                                                <option value="partial">Thanh toán một phần</option>
                                                <option value="completed">Thanh toán hoàn thành</option>
                                            </select>
                                            <textarea className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-primary" rows={2}
                                                placeholder="Số chứng từ, ngày thanh toán..."
                                                value={workflowForm.notes} onChange={e => setWorkflowForm(f => ({ ...f, notes: e.target.value }))} />
                                            <button type="button" onClick={handleUpdatePaymentStatus} disabled={updatePaymentStatusMutation.isPending}
                                                className="mt-2 w-full btn btn-primary text-sm py-1.5">
                                                {updatePaymentStatusMutation.isPending ? 'Đang lưu...' : 'Lưu trạng thái'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-dashed border-gray-100" />

                                {/* B6: Hóa đơn */}
                                <div className="rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                                    <div className="flex items-center justify-between py-2 px-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${po.invoice_status === 'received' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Hóa đơn</p>
                                                <span className={`text-xs font-medium ${po.invoice_status === 'received' ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {po.invoice_status === 'received' ? `Đã nhận${po.invoice_number ? ` · ${po.invoice_number}` : ''}` : 'Chưa nhận'}
                                                </span>
                                            </div>
                                        </div>
                                        {po.invoice_status !== 'received' && (
                                            <button type="button"
                                                onClick={() => { setWorkflowForm(f => ({ ...f, invoice_number: '', invoice_date: '' })); setActiveWorkflow(activeWorkflow === 'invoice' ? null : 'invoice'); }}
                                                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${activeWorkflow === 'invoice' ? 'bg-gray-100 text-gray-600' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                                                {activeWorkflow === 'invoice' ? 'Đóng' : 'Xác nhận'}
                                            </button>
                                        )}
                                    </div>
                                    {activeWorkflow === 'invoice' && (
                                        <div className="mx-1 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Số hóa đơn</p>
                                                    <input type="text" className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-primary"
                                                        placeholder="HD-2024-001" value={workflowForm.invoice_number}
                                                        onChange={e => setWorkflowForm(f => ({ ...f, invoice_number: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Ngày hóa đơn</p>
                                                    <input type="date" className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-primary"
                                                        value={workflowForm.invoice_date}
                                                        onChange={e => setWorkflowForm(f => ({ ...f, invoice_date: e.target.value }))} />
                                                </div>
                                            </div>
                                            <button type="button" onClick={handleUpdateInvoiceStatus} disabled={updateInvoiceStatusMutation.isPending}
                                                className="w-full btn btn-primary text-sm py-1.5">
                                                {updateInvoiceStatusMutation.isPending ? 'Đang lưu...' : 'Xác nhận nhận hóa đơn'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Chứng từ */}
                    <PODocuments poId={poId} readOnly={po.status !== 'draft'} />

                </div>
            </div>

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-primary" />
                                <h3 className="text-base font-bold text-gray-900">Phân công người phụ trách</h3>
                            </div>
                            <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* User list */}
                        <div className="overflow-y-auto flex-1 p-3 space-y-1">
                            {/* Option: Bỏ phân công */}
                            <button
                                onClick={() => setSelectedAssignee(null)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${selectedAssignee === null
                                    ? 'bg-gray-100 ring-1 ring-gray-300'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Bỏ phân công</p>
                                    <p className="text-xs text-gray-400">Không có người phụ trách</p>
                                </div>
                                {selectedAssignee === null && <div className="ml-auto w-2 h-2 rounded-full bg-primary" />}
                            </button>

                            {/* Divider */}
                            <div className="border-t border-dashed border-gray-100 my-1" />

                            {/* Users */}
                            {users.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => setSelectedAssignee(u.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${selectedAssignee === u.id
                                        ? 'bg-primary/5 ring-1 ring-primary/30'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                                        style={{ background: `linear-gradient(135deg, hsl(${(u.full_name || u.username).charCodeAt(0) * 5 % 360}, 65%, 50%), hsl(${(u.full_name || u.username).charCodeAt(0) * 5 % 360 + 40}, 65%, 40%))` }}
                                    >
                                        {(u.full_name || u.username).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{u.full_name || u.username}</p>
                                        <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                                    </div>
                                    {selectedAssignee === u.id && <div className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                            <button className="btn btn-secondary flex-1" onClick={() => setShowAssignModal(false)}>Hủy</button>
                            <button
                                className="btn btn-primary flex-1"
                                disabled={assignMutation.isPending}
                                onClick={() => {
                                    assignMutation.mutate(
                                        { id: poId, assignedTo: selectedAssignee },
                                        { onSuccess: () => setShowAssignModal(false) }
                                    );
                                }}
                            >
                                {assignMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modals */}
            {
                showConfirmModal && (
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
                )
            }
        </div>
    );
}
