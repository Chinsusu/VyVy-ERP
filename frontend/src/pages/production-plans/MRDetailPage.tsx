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
    FileText,
    History,
    AlertCircle,
    Package,
    ClipboardCheck,
    Plus,
    ShoppingCart,
    Truck,
    Wrench
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

    const [isDeleting, setIsDeleting] = useState(false);

    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center">
                <div className="text-gray-500">Đang tải kế hoạch sản xuất...</div>
            </div>
        );
    }

    if (error || !mr) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Lỗi tải: {error?.message || 'Không tìm thấy'}
                    </div>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="badge badge-secondary">Nháp</span>;
            case 'approved':
                return <span className="badge badge-primary">Đã duyệt</span>;
            case 'issued':
                return <span className="badge badge-warning">Đã xuất</span>;
            case 'closed':
                return <span className="badge badge-success">Đã đóng</span>;
            case 'cancelled':
                return <span className="badge badge-danger">Đã hủy</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const getProcurementStatusBadge = (ps: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            draft: { label: 'Chưa đặt hàng', cls: 'badge-secondary' },
            ordering: { label: 'Đang đặt hàng', cls: 'badge-warning' },
            receiving: { label: 'Đang nhận hàng', cls: 'badge-info' },
            received: { label: 'Đã nhận đủ', cls: 'badge-primary' },
            in_production: { label: 'Đang sản xuất', cls: 'badge-warning' },
            completed: { label: 'Hoàn thành', cls: 'badge-success' },
            cancelled: { label: 'Đã hủy', cls: 'badge-danger' },
        };
        const m = map[ps] || { label: ps, cls: '' };
        return <span className={`badge ${m.cls}`}>{m.label}</span>;
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

    const handleApprove = async () => {
        if (window.confirm('Bạn có chắc muốn duyệt kế hoạch sản xuất này không?')) {
            try {
                await approveMutation.mutateAsync(mrId);
            } catch (err) {
                alert('Lỗi khi duyệt: ' + (err as Error).message);
            }
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Bạn có chắc muốn hủy kế hoạch sản xuất này không?')) {
            try {
                await cancelMutation.mutateAsync(mrId);
            } catch (err) {
                alert('Lỗi khi hủy: ' + (err as Error).message);
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc muốn xóa bản nháp này không? Không thể hoàn tác.')) {
            setIsDeleting(true);
            try {
                await deleteMutation.mutateAsync(mrId);
                navigate('/production-plans');
            } catch (err) {
                alert('Lỗi khi xóa: ' + (err as Error).message);
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="animate-fade-in pb-12">
            <div>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/production-plans"
                            className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-primary-600 border border-transparent hover:border-gray-200"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">{mr.plan_number}</h1>
                                {getStatusBadge(mr.status)}
                                {getProcurementStatusBadge((mr as any).procurement_status || 'draft')}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Ngày tạo: {new Date(mr.request_date).toLocaleDateString('vi-VN')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    Phòng ban: {mr.department}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {mr.status === 'draft' && (
                            <>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="btn btn-secondary text-red-600 border-red-100 hover:bg-red-50"
                                >
                                    Xóa bản nháp
                                </button>
                                <Link
                                    to={`/production-plans/${mr.id}/edit`}
                                    className="btn btn-secondary"
                                >
                                    Chỉnh sửa
                                </Link>
                                <button
                                    onClick={handleApprove}
                                    disabled={approveMutation.isPending}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Phê duyệt
                                </button>
                            </>
                        )}
                        {mr.status === 'approved' && (
                            <button
                                onClick={handleCancel}
                                disabled={cancelMutation.isPending}
                                className="btn btn-secondary text-red-600 border-red-100 hover:bg-red-50 flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Hủy kế hoạch
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details & Items */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary Card */}
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-600" />
                                Thông tin chung
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Kho xuất</p>
                                            <p className="font-medium text-gray-900">{mr.warehouse?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Ngày cần</p>
                                            <p className="font-medium text-gray-900">
                                                {mr.required_date ? new Date(mr.required_date).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Mục đích</p>
                                            <p className="text-gray-900">{mr.purpose || 'Chưa có mục đích'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {mr.notes && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Ghi chú thêm</p>
                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">
                                        {mr.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Items Card */}
                        <div className="card scroll-mt-6" id="items">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary-600" />
                                Nguyên vật liệu yêu cầu
                            </h3>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Nguyên liệu</th>
                                            <th className="text-right">SL yêu cầu</th>
                                            <th className="text-right">SL xuất</th>
                                            <th className="text-right">Còn lại</th>
                                            <th>Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mr.items.map((item: ProductionPlanItem) => {
                                            const remaining = item.requested_quantity - item.issued_quantity;
                                            return (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="font-medium text-gray-900">{item.material?.trading_name}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{item.material?.code}</div>
                                                    </td>
                                                    <td className="text-right font-medium">
                                                        {item.requested_quantity.toLocaleString()} {item.material?.unit}
                                                    </td>
                                                    <td className="text-right text-gray-600">
                                                        {item.issued_quantity.toLocaleString()} {item.material?.unit}
                                                    </td>
                                                    <td className="text-right font-semibold text-primary-600">
                                                        {remaining.toLocaleString()} {item.material?.unit}
                                                    </td>
                                                    <td className="text-sm text-gray-500 italic">
                                                        {item.notes || '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Workflow & History */}
                    <div className="space-y-8">
                        {/* Approval Status Card */}
                        <div className="card bg-gray-50 border-gray-200">
                            <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Quy trình</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${mr.status !== 'draft' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <ClipboardCheck className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">Đã duyệt</span>
                                    </div>
                                    {mr.approved_at ? (
                                        <span className="text-xs text-gray-500">
                                            {new Date(mr.approved_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    ) : (
                                        <span className="text-xs italic text-gray-400">Chờ duyệt</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${mr.status === 'issued' || mr.status === 'closed' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">Xuất vật tư</span>
                                    </div>
                                    <span className="text-xs italic text-gray-400">
                                        {mr.status === 'issued' ? 'Đang xuất' : mr.status === 'closed' ? 'Hoàn thành' : 'Chờ'}
                                    </span>
                                </div>
                            </div>

                            {mr.status === 'approved' && (
                                <div className="mt-6">
                                    <Link
                                        to={`/material-issues/new?mr_id=${mr.id}`}
                                        className="btn btn-primary w-full flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Package className="w-4 h-4" />
                                        Xuất vật tư
                                    </Link>
                                    <p className="text-center text-[length:var(--font-size-3xs)] text-gray-400 mt-2">
                                        Tạo phiếu xuất kho cho kế hoạch đã duyệt này
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Procurement Status Card */}
                        {mr.status !== 'draft' && (
                            <div className="card bg-indigo-50 border-indigo-200">
                                <h3 className="text-sm font-bold uppercase text-indigo-600 mb-4 tracking-wider flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    Tiến độ mua hàng
                                </h3>
                                <div className="space-y-2">
                                    {PROCUREMENT_STEPS.map((step) => {
                                        const stepIdx = procurementStepOrder.indexOf(step.key);
                                        const isDone = currentProcurementIdx >= stepIdx && currentProcurementIdx > 0;
                                        const isCurrent = (mr as any).procurement_status === step.key;
                                        const Icon = step.icon;
                                        return (
                                            <div key={step.key} className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? 'bg-indigo-100 border border-indigo-300' :
                                                    isDone ? 'bg-white' : 'opacity-40'
                                                }`}>
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isDone || isCurrent ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
                                                    }`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className={`text-sm font-medium ${isCurrent ? 'text-indigo-900' : isDone ? 'text-gray-700' : 'text-gray-400'
                                                    }`}>{step.label}</span>
                                                {isCurrent && <span className="ml-auto text-xs text-indigo-600 font-semibold">Hiện tại</span>}
                                                {isDone && !isCurrent && <CheckCircle className="ml-auto w-4 h-4 text-green-500" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Timeline Card */}
                        <div className="card">
                            <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Timeline
                            </h3>
                            <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">

                                {/* Đã tạo */}
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-primary-600 rounded-full flex items-center justify-center z-10">
                                        <Plus className="w-3 h-3 text-primary-600" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">Đã tạo</p>
                                    <p className="text-xs text-gray-400">{new Date(mr.created_at).toLocaleString('vi-VN')}</p>
                                    {(mr as any).created_by_user && (
                                        <p className="text-xs text-gray-600 mt-0.5">bởi <span className="font-medium">{(mr as any).created_by_user.full_name || (mr as any).created_by_user.username}</span></p>
                                    )}
                                    {mr.department && <p className="text-xs text-gray-500">Phòng ban: {mr.department}</p>}
                                </div>

                                {/* Đã duyệt */}
                                {mr.approved_at && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-green-500 rounded-full flex items-center justify-center z-10">
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">Đã duyệt</p>
                                        <p className="text-xs text-gray-400">{new Date(mr.approved_at).toLocaleString('vi-VN')}</p>
                                        {(mr as any).approved_by_user && (
                                            <p className="text-xs text-gray-600 mt-0.5">bởi <span className="font-medium text-green-700">{(mr as any).approved_by_user.full_name || (mr as any).approved_by_user.username}</span></p>
                                        )}
                                    </div>
                                )}

                                {/* Đã hủy */}
                                {mr.status === 'cancelled' && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-red-500 rounded-full flex items-center justify-center z-10">
                                            <XCircle className="w-3 h-3 text-red-500" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">Đã hủy</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Production Task Section */}
            <div className="mt-6">
                <ProductionTaskPanel mrId={mrId} editable={mr.status !== 'cancelled' && mr.status !== 'closed'} />
            </div>

            {/* Timeline + Progress */}
            {productionTasks && productionTasks.length > 0 && (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ProductionTimeline tasks={productionTasks} />
                    </div>
                    <div>
                        <ProductionProgressChart tasks={productionTasks} />
                    </div>
                </div>
            )}

            {/* Đơn Mua Hàng Tự Động */}
            <div className="mt-6">
                <RelatedPOsPanel mrId={mrId} />
            </div>

            {/* Lịch Sử Thay Đổi */}
            <div className="mt-6">
                <AuditLogPanel tableName="production_plans" recordId={mrId} />
            </div>
        </div>
    );
}
