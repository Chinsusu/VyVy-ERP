import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, Calendar, Building2,
    Package, Clock, ClipboardCheck, History, FileText,
} from 'lucide-react';
import {
    useFinishedProductReceipt,
    usePostFinishedProductReceipt,
    useCancelFinishedProductReceipt,
} from '../../hooks/useFinishedProductReceipts';
import type { FinishedProductReceiptItem } from '../../types/finishedProductReceipt';

export default function FPRNDetailPage() {
    const { id } = useParams<{ id: string }>();
    const fprnId = parseInt(id || '0', 10);
    const navigate = useNavigate();

    const { data: fprn, isLoading, error } = useFinishedProductReceipt(fprnId);
    const postMutation = usePostFinishedProductReceipt();
    const cancelMutation = useCancelFinishedProductReceipt();

    if (isLoading) return (
        <div className="animate-fade-in flex items-center justify-center h-64 text-gray-500">Đang tải...</div>
    );
    if (error || !fprn) return (
        <div className="animate-fade-in p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                Lỗi tải phiếu nhập kho: {(error as Error)?.message || 'Không tìm thấy'}
            </div>
        </div>
    );

    const handlePost = async () => {
        if (!window.confirm('Xác nhận nhập kho? Hành động này sẽ cập nhật tồn kho thành phẩm.')) return;
        try {
            await postMutation.mutateAsync(fprnId);
            alert('Nhập kho thành công!');
        } catch (err) {
            alert('Lỗi: ' + (err as Error).message);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Xác nhận hủy phiếu này?')) return;
        try {
            await cancelMutation.mutateAsync(fprnId);
            navigate('/finished-product-receipts');
        } catch (err) {
            alert('Lỗi: ' + (err as Error).message);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <span className="badge badge-secondary uppercase">Nháp</span>;
            case 'posted': return <span className="badge badge-success uppercase">Đã nhập kho</span>;
            case 'cancelled': return <span className="badge badge-danger uppercase">Đã hủy</span>;
            default: return <span className="badge uppercase">{status}</span>;
        }
    };

    return (
        <div className="animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        to="/finished-product-receipts"
                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-primary-600 border border-transparent hover:border-gray-200"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-gray-900">{fprn.fprn_number}</h1>
                            {getStatusBadge(fprn.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(fprn.receipt_date).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {fprn.warehouse?.name}
                            </span>
                        </div>
                    </div>
                </div>

                {fprn.status === 'draft' && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={cancelMutation.isPending}
                            className="btn btn-secondary text-red-600 border-red-100 hover:bg-red-50"
                        >
                            Hủy phiếu
                        </button>
                        <button
                            onClick={handlePost}
                            disabled={postMutation.isPending}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Nhập kho
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Details + Items */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Info card */}
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-600" />
                            Thông tin phiếu nhập
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Kho nhập</p>
                                        <p className="font-medium text-gray-900">{fprn.warehouse?.name}</p>
                                    </div>
                                </div>
                                {fprn.production_plan && (
                                    <div className="flex items-start gap-3">
                                        <History className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">KHSX liên kết</p>
                                            <Link to={`/production-plans/${fprn.production_plan_id}`} className="font-medium text-primary-600 hover:underline">
                                                {fprn.production_plan.plan_number}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Tổng dòng</p>
                                        <p className="font-medium text-gray-900">{(fprn.items || []).length} thành phẩm</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {fprn.notes && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Ghi chú</p>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">{fprn.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Items table */}
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary-600" />
                            Danh sách thành phẩm
                        </h3>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="text-left">Thành phẩm</th>
                                        <th className="text-left">Số lô / Hết hạn</th>
                                        <th className="text-right">Số lượng</th>
                                        <th className="text-right">Đơn giá</th>
                                        <th className="text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(fprn.items || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-gray-500 italic">Không có dữ liệu</td>
                                        </tr>
                                    ) : (fprn.items || []).map((item: FinishedProductReceiptItem) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="font-medium text-gray-900">{item.finished_product?.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{item.finished_product?.code}</div>
                                            </td>
                                            <td>
                                                <div className="text-sm font-medium">{item.batch_number || '-'}</div>
                                                {item.expiry_date && (
                                                    <div className="text-xs text-gray-500">Hết hạn: {new Date(item.expiry_date).toLocaleDateString('vi-VN')}</div>
                                                )}
                                            </td>
                                            <td className="text-right font-semibold">
                                                {item.quantity.toLocaleString()} {item.finished_product?.unit}
                                            </td>
                                            <td className="text-right text-sm text-gray-600">
                                                {item.unit_cost > 0 ? item.unit_cost.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '-'}
                                            </td>
                                            <td className="text-right text-sm font-semibold text-gray-800">
                                                {item.unit_cost > 0
                                                    ? (item.quantity * item.unit_cost).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {(fprn.items || []).some((i: FinishedProductReceiptItem) => i.unit_cost > 0) && (
                                    <tfoot>
                                        <tr className="bg-gray-50 font-bold">
                                            <td colSpan={4} className="text-right text-sm">Tổng giá trị:</td>
                                            <td className="text-right text-primary-700">
                                                {(fprn.items || []).reduce(
                                                    (sum: number, i: FinishedProductReceiptItem) => sum + (i.quantity * i.unit_cost),
                                                    0
                                                ).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Workflow status */}
                <div className="space-y-8">
                    <div className={`card ${fprn.posted ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                        <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Trạng thái giao dịch</h3>
                        <div className="flex items-start gap-3">
                            {fprn.posted ? (
                                <>
                                    <div className="p-2 bg-green-100 text-green-600 rounded-full">
                                        <ClipboardCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-800">Đã nhập kho</p>
                                        <p className="text-xs text-green-600 mt-1">Tồn kho thành phẩm đã được cập nhật</p>
                                        {fprn.posted_at && (
                                            <p className="text-xs text-green-500 mt-1">
                                                {new Date(fprn.posted_at).toLocaleString('vi-VN')}
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-orange-800">Đang chờ nhập kho</p>
                                        <p className="text-xs text-orange-600 mt-1">Nhấn "Nhập kho" để xác nhận</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="card">
                        <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider flex items-center gap-2">
                            <History className="w-4 h-4" /> Lịch sử
                        </h3>
                        <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-primary-600 rounded-full flex items-center justify-center z-10">
                                    <span className="w-2 h-2 bg-primary-600 rounded-full" />
                                </div>
                                <p className="text-sm font-bold text-gray-900">Tạo phiếu</p>
                                <p className="text-xs text-gray-500">{new Date(fprn.created_at).toLocaleString('vi-VN')}</p>
                            </div>
                            {fprn.posted_at && (
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-green-500 rounded-full flex items-center justify-center z-10">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">Nhập kho</p>
                                    <p className="text-xs text-gray-500">{new Date(fprn.posted_at).toLocaleString('vi-VN')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
