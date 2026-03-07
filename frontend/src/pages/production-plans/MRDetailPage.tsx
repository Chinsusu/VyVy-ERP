import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    Building2,
    Package,
    ClipboardCheck,
    ShoppingCart,
    Truck,
    Wrench,
    Edit,
    Trash2,
} from 'lucide-react';
import {
    useProductionPlan,
    useApproveProductionPlan,
    useCancelProductionPlan,
    useDeleteProductionPlan
} from '../../hooks/useProductionPlans';
import type { ProductionPlanItem } from '../../types/productionPlan';
import AuditLogPanel from '../../components/common/AuditLogPanel';
import ProductionTaskPanel from '../../components/production/ProductionTaskPanel';
import ProductionTimeline from '../../components/production/ProductionTimeline';
import ProductionProgressChart from '../../components/production/ProductionProgressChart';
import RelatedPOsPanel from '../../components/production/RelatedPOsPanel';
import RelatedFPRNsPanel from '../../components/production/RelatedFPRNsPanel';
import { useProductionTasks } from '../../hooks/useProductionTasks';

export default function MRDetailPage() {
    const { id } = useParams<{ id: string }>();
    const mrId = parseInt(id || '0', 10);
    const navigate = useNavigate();
    const { data: productionTasks } = useProductionTasks(mrId);

    const { data: mr, isLoading, error } = useProductionPlan(mrId);
    const approveMutation = useApproveProductionPlan();
    const cancelMutation = useCancelProductionPlan();
    const deleteMutation = useDeleteProductionPlan();

    const [showConfirmModal, setShowConfirmModal] = useState<'approve' | 'cancel' | 'delete' | null>(null);

    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center h-64">
                <div className="text-gray-500">Đang tải kế hoạch sản xuất...</div>
            </div>
        );
    }

    if (error || !mr) {
        return (
            <div className="animate-fade-in p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error ? `Lỗi: ${(error as Error).message}` : 'Không tìm thấy kế hoạch sản xuất'}
                </div>
                <Link to="/production-plans" className="btn btn-secondary mt-4">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <span className="badge badge-secondary py-1.5 px-3 text-sm">Nháp</span>;
            case 'approved': return <span className="badge badge-success py-1.5 px-3 text-sm">Đã duyệt</span>;
            case 'issued': return <span className="badge badge-warning py-1.5 px-3 text-sm">Đã xuất</span>;
            case 'closed': return <span className="badge badge-success py-1.5 px-3 text-sm">Đã đóng</span>;
            case 'cancelled': return <span className="badge badge-danger py-1.5 px-3 text-sm">Đã hủy</span>;
            default: return <span className="badge py-1.5 px-3 text-sm">{status}</span>;
        }
    };

    const getProcurementLabel = (ps: string) => {
        const map: Record<string, { label: string; color: string }> = {
            draft: { label: 'Chưa đặt hàng', color: 'text-gray-400' },
            ordering: { label: 'Đang đặt hàng', color: 'text-yellow-600' },
            receiving: { label: 'Đang nhận hàng', color: 'text-blue-600' },
            received: { label: 'Đã nhận đủ', color: 'text-indigo-600' },
            in_production: { label: 'Đang sản xuất', color: 'text-orange-600' },
            completed: { label: 'Hoàn thành', color: 'text-green-600' },
            cancelled: { label: 'Đã hủy', color: 'text-red-500' },
        };
        return map[ps] || { label: ps, color: 'text-gray-400' };
    };

    const PROCUREMENT_STEPS = [
        { key: 'ordering', icon: ShoppingCart, label: 'Đặt hàng' },
        { key: 'receiving', icon: Truck, label: 'Nhận hàng' },
        { key: 'received', icon: Package, label: 'Nhập kho đủ' },
        { key: 'in_production', icon: Wrench, label: 'Sản xuất' },
        { key: 'completed', icon: CheckCircle, label: 'Hoàn thành' },
    ];
    const procurementStepOrder = ['draft', 'ordering', 'receiving', 'received', 'in_production', 'completed'];
    const currentProcurementIdx = procurementStepOrder.indexOf((mr as any).procurement_status || 'draft');
    const procStatus = getProcurementLabel((mr as any).procurement_status || 'draft');

    const handleApprove = async () => {
        try {
            await approveMutation.mutateAsync(mrId);
            setShowConfirmModal(null);
        } catch (err) {
            alert('Lỗi khi duyệt: ' + (err as Error).message);
        }
    };

    const handleCancel = async () => {
        try {
            await cancelMutation.mutateAsync(mrId);
            setShowConfirmModal(null);
        } catch (err) {
            alert('Lỗi khi hủy: ' + (err as Error).message);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(mrId);
            navigate('/production-plans');
        } catch (err) {
            alert('Lỗi khi xóa: ' + (err as Error).message);
            setShowConfirmModal(null);
        }
    };

    const totalItems = mr.items?.length || 0;

    return (
        <div className="animate-fade-in space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/production-plans" className="text-primary hover:underline flex items-center gap-2 mb-1 text-sm">
                        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-slate-900">{mr.plan_number}</h1>
                        {getStatusBadge(mr.status)}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {mr.status === 'draft' && (
                        <>
                            <Link to={`/production-plans/${mr.id}/edit`} className="btn btn-secondary flex items-center gap-2">
                                <Edit className="w-4 h-4" /> Chỉnh sửa
                            </Link>
                            <button onClick={() => setShowConfirmModal('approve')} className="btn btn-success flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Duyệt kế hoạch
                            </button>
                            <button onClick={() => setShowConfirmModal('delete')} className="btn btn-danger flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Xóa bản nháp
                            </button>
                        </>
                    )}
                    {mr.status === 'approved' && (
                        <button onClick={() => setShowConfirmModal('cancel')} className="btn btn-warning flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Hủy kế hoạch
                        </button>
                    )}
                </div>
            </div>

            {/* ── Info Bar Compact ── */}
            <div className="card py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
                    <div className="px-4 first:pl-0">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> Phòng ban
                        </p>
                        <p className="font-bold text-sm text-gray-800 truncate">{mr.department || '—'}</p>
                    </div>
                    <div className="px-4">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> Kho xuất
                        </p>
                        <p className="font-bold text-sm truncate">{mr.warehouse?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{mr.warehouse?.code}</p>
                    </div>
                    <div className="px-4">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Ngày tạo
                        </p>
                        <p className="font-semibold text-sm">{new Date(mr.request_date).toLocaleDateString('vi-VN')}</p>
                        {mr.required_date && (
                            <p className="text-xs text-gray-400">Cần: {new Date(mr.required_date).toLocaleDateString('vi-VN')}</p>
                        )}
                    </div>
                    <div className="px-4">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" /> Tiến độ mua hàng
                        </p>
                        <p className={`font-bold text-sm ${procStatus.color}`}>{procStatus.label}</p>
                        <p className="text-xs text-gray-400">{totalItems} nguyên vật liệu</p>
                    </div>
                </div>
            </div>

            {/* ── 2-column grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── LEFT col: Items + Notes + Related Panels + AuditLog ── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Items Table */}
                    <div className="card p-0 overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2 text-sm">
                                <Package className="w-4 h-4 text-primary" /> Nguyên vật liệu yêu cầu
                            </h3>
                            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
                                {totalItems} mặt hàng
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 border-b text-xs uppercase tracking-wide">
                                        <th className="py-3 px-4 text-left font-semibold">Mã</th>
                                        <th className="py-3 px-4 text-left font-semibold">Tên nguyên vật liệu</th>
                                        <th className="py-3 px-3 text-right font-semibold">SL yêu cầu</th>
                                        <th className="py-3 px-4 text-left font-semibold w-40">SL xuất / Còn lại</th>
                                        <th className="py-3 px-4 text-left font-semibold">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(mr.items || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-10 text-gray-400 italic text-sm">
                                                Chưa có nguyên vật liệu nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        mr.items.map((item: ProductionPlanItem) => {
                                            const remaining = item.requested_quantity - item.issued_quantity;
                                            const pct = item.requested_quantity > 0
                                                ? Math.min(100, Math.round((item.issued_quantity / item.requested_quantity) * 100))
                                                : 0;
                                            return (
                                                <tr key={item.id} className="border-b hover:bg-gray-50/80 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.material?.code}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="font-medium text-sm text-gray-800">{item.material?.trading_name}</p>
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-semibold text-sm">
                                                        {item.requested_quantity.toLocaleString()} <span className="text-xs text-gray-400">{item.material?.unit}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[48px]">
                                                                <div
                                                                    className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-blue-400' : 'bg-gray-200'}`}
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                                {item.issued_quantity.toLocaleString()} / <span className={remaining > 0 ? 'text-primary-600 font-semibold' : 'text-green-600 font-semibold'}>{remaining.toLocaleString()}</span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-400 italic">{item.notes || '—'}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Ghi chú */}
                    {mr.notes && (
                        <div className="card">
                            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2 mb-3">
                                Ghi chú
                            </h3>
                            <p className="text-gray-700 whitespace-pre-wrap text-sm">{mr.notes}</p>
                        </div>
                    )}

                    {/* Mục đích */}
                    {mr.purpose && (
                        <div className="card">
                            <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2 mb-3">
                                Mục đích sản xuất
                            </h3>
                            <p className="text-gray-700 text-sm">{mr.purpose}</p>
                        </div>
                    )}

                    {/* Production Tasks */}
                    <ProductionTaskPanel mrId={mrId} editable={mr.status !== 'cancelled' && mr.status !== 'closed'} />

                    {/* Gantt + Donut */}
                    {productionTasks && productionTasks.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <ProductionTimeline tasks={productionTasks} />
                            </div>
                            <div>
                                <ProductionProgressChart tasks={productionTasks} />
                            </div>
                        </div>
                    )}

                    {/* Đơn mua hàng liên quan */}
                    <RelatedPOsPanel mrId={mrId} />

                    {/* Nhập kho thành phẩm liên quan */}
                    <RelatedFPRNsPanel planId={mrId} planNumber={mr.plan_number} />

                    {/* Lịch sử thay đổi — cuối cột trái */}
                    <AuditLogPanel tableName="production_plans" recordId={mrId} />
                </div>

                {/* ── RIGHT col: Workflow + Procurement ── */}
                <div className="space-y-6">

                    {/* Quy trình duyệt */}
                    <div className="card">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                            <ClipboardCheck className="w-4 h-4 text-primary" /> Quy trình
                        </h3>
                        <div className="space-y-1">

                            {/* Bước Duyệt */}
                            <div className="rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                                <div className="flex items-center justify-between py-2 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${mr.status !== 'draft' && mr.status !== 'cancelled' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Phê duyệt</p>
                                            <span className={`text-xs font-medium ${mr.status !== 'draft' && mr.status !== 'cancelled' ? 'text-green-600' : 'text-gray-400'}`}>
                                                {mr.approved_at
                                                    ? new Date(mr.approved_at).toLocaleDateString('vi-VN')
                                                    : mr.status === 'cancelled' ? 'Đã hủy' : 'Chờ duyệt'}
                                            </span>
                                        </div>
                                    </div>
                                    {(mr as any).approved_by_user && (
                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {(mr as any).approved_by_user.full_name || (mr as any).approved_by_user.username}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-100" />

                            {/* Bước Xuất vật tư */}
                            <div className="rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                                <div className="flex items-center justify-between py-2 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${mr.status === 'issued' || mr.status === 'closed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Xuất vật tư</p>
                                            <span className={`text-xs font-medium ${mr.status === 'issued' ? 'text-blue-600' : mr.status === 'closed' ? 'text-green-600' : 'text-gray-400'}`}>
                                                {mr.status === 'issued' ? 'Đang xuất' : mr.status === 'closed' ? 'Hoàn thành' : 'Chờ'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Nút xuất vật tư */}
                        {mr.status === 'approved' && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <Link
                                    to={`/material-issue-notes/new?mr_id=${mr.id}`}
                                    className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm"
                                >
                                    <Package className="w-4 h-4" />
                                    Tạo phiếu xuất kho
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Tiến độ mua hàng */}
                    {mr.status !== 'draft' && (
                        <div className="card">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                                <ShoppingCart className="w-4 h-4 text-primary" /> Tiến độ mua hàng
                            </h3>
                            <div className="space-y-1">
                                {PROCUREMENT_STEPS.map((step) => {
                                    const stepIdx = procurementStepOrder.indexOf(step.key);
                                    const isDone = currentProcurementIdx > stepIdx;
                                    const isCurrent = (mr as any).procurement_status === step.key;
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.key} className="flex items-center gap-2 py-1.5 px-1">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isDone ? 'bg-green-500' : isCurrent ? 'bg-primary' : 'bg-gray-200'}`} />
                                            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isDone ? 'text-green-500' : isCurrent ? 'text-primary' : 'text-gray-300'}`} />
                                            <span className={`text-sm ${isCurrent ? 'font-semibold text-gray-900' : isDone ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {step.label}
                                            </span>
                                            {isDone && <CheckCircle className="ml-auto w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                                            {isCurrent && <span className="ml-auto text-[10px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">Hiện tại</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Người tạo */}
                    <div className="card">
                        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                            <User className="w-4 h-4 text-primary" /> Thông tin tạo
                        </h3>
                        <div className="space-y-2 text-sm">
                            {(mr as any).created_by_user && (
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                                        style={{ background: `linear-gradient(135deg, hsl(${((mr as any).created_by_user.full_name || (mr as any).created_by_user.username).charCodeAt(0) * 5 % 360}, 65%, 50%), hsl(${((mr as any).created_by_user.full_name || (mr as any).created_by_user.username).charCodeAt(0) * 5 % 360 + 40}, 65%, 40%))` }}>
                                        {((mr as any).created_by_user.full_name || (mr as any).created_by_user.username).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{(mr as any).created_by_user.full_name || (mr as any).created_by_user.username}</p>
                                        <p className="text-xs text-gray-400">@{(mr as any).created_by_user.username}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-xs text-gray-400 pt-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(mr.created_at).toLocaleString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Confirm Modal ── */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 space-y-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {showConfirmModal === 'approve' ? 'Duyệt kế hoạch?' :
                                    showConfirmModal === 'cancel' ? 'Hủy kế hoạch?' : 'Xóa bản nháp?'}
                            </h3>
                            <p className="text-gray-500">
                                Bạn có chắc muốn {showConfirmModal === 'approve' ? 'duyệt' :
                                    showConfirmModal === 'cancel' ? 'hủy' : 'xóa'} kế hoạch <strong>{mr.plan_number}</strong>?
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
                                onClick={showConfirmModal === 'approve' ? handleApprove :
                                    showConfirmModal === 'cancel' ? handleCancel : handleDelete}
                                className={`btn flex-1 ${showConfirmModal === 'delete' ? 'btn-danger' :
                                    showConfirmModal === 'approve' ? 'btn-success' : 'btn-warning'}`}
                                disabled={approveMutation.isPending || cancelMutation.isPending || deleteMutation.isPending}
                            >
                                {approveMutation.isPending || cancelMutation.isPending || deleteMutation.isPending
                                    ? 'Đang xử lý...'
                                    : showConfirmModal === 'approve' ? 'Xác nhận duyệt' :
                                        showConfirmModal === 'cancel' ? 'Xác nhận hủy' : 'Xác nhận xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
