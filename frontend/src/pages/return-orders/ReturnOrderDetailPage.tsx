import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useReturnOrder,
    useApproveReturnOrder,
    useReceiveReturnOrder,
    useInspectReturnItem,
    useCompleteReturnOrder,
    useCancelReturnOrder,
} from '../../hooks/useReturnOrders';
import { useWarehouses } from '../../hooks/useWarehouses';
import { RotateCcw, ArrowLeft, CheckCircle, XCircle, Package, Truck, Search, ClipboardCheck } from 'lucide-react';
import type { InspectItemRequest, ReturnOrderItem } from '../../types/returnOrder';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Chờ duyệt', color: 'text-yellow-700', bg: 'bg-yellow-100' },
    approved: { label: 'Đã duyệt', color: 'text-blue-700', bg: 'bg-blue-100' },
    receiving: { label: 'Đang nhận', color: 'text-indigo-700', bg: 'bg-indigo-100' },
    inspecting: { label: 'Đang kiểm tra', color: 'text-purple-700', bg: 'bg-purple-100' },
    completed: { label: 'Hoàn tất', color: 'text-green-700', bg: 'bg-green-100' },
    cancelled: { label: 'Đã hủy', color: 'text-red-700', bg: 'bg-red-100' },
};

const conditionConfig: Record<string, { label: string; color: string }> = {
    pending_inspection: { label: 'Chờ kiểm tra', color: 'text-yellow-600' },
    good: { label: 'Tốt', color: 'text-green-600' },
    damaged: { label: 'Hư hỏng', color: 'text-red-600' },
    defective: { label: 'Lỗi', color: 'text-orange-600' },
};

const typeLabels: Record<string, string> = {
    customer_return: 'Khách trả',
    damaged: 'Hư hỏng',
    wrong_item: 'Sai hàng',
    refused: 'Từ chối nhận',
};

const resolutionLabels: Record<string, string> = {
    refund: 'Hoàn tiền',
    replace: 'Đổi hàng',
    restock: 'Nhập kho lại',
    scrap: 'Thanh lý',
};

export default function ReturnOrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: ro, isLoading } = useReturnOrder(Number(id));
    const { data: warehousesData } = useWarehouses({});
    const approveMutation = useApproveReturnOrder();
    const receiveMutation = useReceiveReturnOrder();
    const inspectMutation = useInspectReturnItem();
    const completeMutation = useCompleteReturnOrder();
    const cancelMutation = useCancelReturnOrder();

    const [inspectingItem, setInspectingItem] = useState<ReturnOrderItem | null>(null);
    const [inspectForm, setInspectForm] = useState<InspectItemRequest>({
        condition: 'good',
        quantity_restocked: 0,
        quantity_scrapped: 0,
        warehouse_id: undefined,
        notes: '',
    });

    if (isLoading) return <div className="animate-fade-in p-8 text-center text-slate-400">Đang tải...</div>;
    if (!ro) return <div className="animate-fade-in p-8 text-center text-slate-400">Không tìm thấy đơn hoàn hàng</div>;

    const status = statusConfig[ro.status] || statusConfig.pending;

    const handleApprove = () => approveMutation.mutate(ro.id);
    const handleReceive = () => receiveMutation.mutate(ro.id);
    const handleComplete = () => {
        if (confirm('Xác nhận hoàn tất đơn hoàn hàng?')) {
            completeMutation.mutate(ro.id);
        }
    };
    const handleCancel = () => {
        if (confirm('Xác nhận hủy đơn hoàn hàng?')) {
            cancelMutation.mutate(ro.id);
        }
    };

    const openInspect = (item: ReturnOrderItem) => {
        setInspectingItem(item);
        setInspectForm({
            condition: item.condition === 'pending_inspection' ? 'good' : item.condition,
            quantity_restocked: item.quantity_restocked || item.quantity_returned,
            quantity_scrapped: item.quantity_scrapped || 0,
            warehouse_id: item.warehouse_id || undefined,
            notes: item.notes || '',
        });
    };

    const handleInspect = () => {
        if (!inspectingItem) return;
        inspectMutation.mutate(
            { roId: ro.id, itemId: inspectingItem.id, data: inspectForm },
            { onSuccess: () => setInspectingItem(null) }
        );
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/return-orders')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <RotateCcw className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 font-mono">{ro.return_number}</h1>
                        <p className="text-slate-500 text-sm">Đơn hoàn hàng</p>
                    </div>
                    <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                        {status.label}
                    </span>
                </div>

                {/* Workflow buttons */}
                <div className="flex gap-2">
                    {ro.status === 'pending' && (
                        <>
                            <button onClick={handleApprove} disabled={approveMutation.isPending} className="btn-primary flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Duyệt
                            </button>
                            <button onClick={handleCancel} disabled={cancelMutation.isPending} className="btn-danger flex items-center gap-2">
                                <XCircle className="w-4 h-4" /> Hủy
                            </button>
                        </>
                    )}
                    {ro.status === 'approved' && (
                        <button onClick={handleReceive} disabled={receiveMutation.isPending} className="btn-primary flex items-center gap-2">
                            <Truck className="w-4 h-4" /> Nhận hàng
                        </button>
                    )}
                    {(ro.status === 'inspecting' || ro.status === 'receiving') && (
                        <button onClick={handleComplete} disabled={completeMutation.isPending} className="btn-success flex items-center gap-2">
                            <ClipboardCheck className="w-4 h-4" /> Hoàn tất
                        </button>
                    )}
                    {ro.status !== 'completed' && ro.status !== 'cancelled' && ro.status !== 'pending' && (
                        <button onClick={handleCancel} disabled={cancelMutation.isPending} className="btn-danger flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Hủy
                        </button>
                    )}
                </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="card p-5">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Thông tin chung</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Đơn giao:</span><span className="font-mono font-medium">{ro.do_number || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Khách hàng:</span><span>{ro.customer_name || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Loại hoàn:</span><span>{typeLabels[ro.return_type] || ro.return_type}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Ngày hoàn:</span><span>{new Date(ro.return_date).toLocaleDateString('vi-VN')}</span></div>
                        {ro.resolution && <div className="flex justify-between"><span className="text-slate-500">Xử lý:</span><span>{resolutionLabels[ro.resolution] || ro.resolution}</span></div>}
                        {ro.carrier_name && <div className="flex justify-between"><span className="text-slate-500">Vận chuyển:</span><span>{ro.carrier_name}</span></div>}
                        {ro.tracking_number && <div className="flex justify-between"><span className="text-slate-500">Mã vận đơn:</span><span className="font-mono">{ro.tracking_number}</span></div>}
                    </div>
                </div>

                <div className="card p-5">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Tổng quan</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{ro.total_items}</div>
                            <div className="text-xs text-slate-500">Tổng hoàn</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{ro.total_restocked}</div>
                            <div className="text-xs text-slate-500">Nhập kho</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{ro.total_scrapped}</div>
                            <div className="text-xs text-slate-500">Thanh lý</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{ro.refund_amount?.toLocaleString('vi-VN') || '0'}</div>
                            <div className="text-xs text-slate-500">Hoàn tiền (₫)</div>
                        </div>
                    </div>
                    {ro.reason && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 mb-1">Lý do:</p>
                            <p className="text-sm text-slate-700">{ro.reason}</p>
                        </div>
                    )}
                    {ro.notes && (
                        <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 mb-1">Ghi chú:</p>
                            <p className="text-sm text-slate-700">{ro.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Items table */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-slate-400" />
                        Sản phẩm hoàn trả ({ro.items?.length || 0})
                    </h3>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b">
                            <th className="text-left p-3 text-sm font-semibold text-slate-600">Sản phẩm</th>
                            <th className="text-right p-3 text-sm font-semibold text-slate-600">SL hoàn</th>
                            <th className="text-right p-3 text-sm font-semibold text-slate-600">Nhập kho</th>
                            <th className="text-right p-3 text-sm font-semibold text-slate-600">Thanh lý</th>
                            <th className="text-left p-3 text-sm font-semibold text-slate-600">Tình trạng</th>
                            <th className="text-left p-3 text-sm font-semibold text-slate-600">Kho</th>
                            {(ro.status === 'receiving' || ro.status === 'inspecting') && (
                                <th className="text-center p-3 text-sm font-semibold text-slate-600">Kiểm tra</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {ro.items?.map(item => {
                            const cond = conditionConfig[item.condition] || conditionConfig.pending_inspection;
                            return (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-3">
                                        <div className="font-medium text-sm">{item.product_name}</div>
                                        <div className="font-mono text-xs text-slate-400">{item.product_sku}</div>
                                        {item.reason && <div className="text-xs text-slate-500 mt-1">Lý do: {item.reason}</div>}
                                    </td>
                                    <td className="p-3 text-right font-medium">{item.quantity_returned}</td>
                                    <td className="p-3 text-right text-green-600">{item.quantity_restocked}</td>
                                    <td className="p-3 text-right text-red-600">{item.quantity_scrapped}</td>
                                    <td className="p-3">
                                        <span className={`text-sm font-medium ${cond.color}`}>{cond.label}</span>
                                    </td>
                                    <td className="p-3 text-sm text-slate-600">{item.warehouse_name || '-'}</td>
                                    {(ro.status === 'receiving' || ro.status === 'inspecting') && (
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => openInspect(item)}
                                                className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors"
                                                title="Kiểm tra"
                                            >
                                                <Search className="w-4 h-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Inspection Modal */}
            {inspectingItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setInspectingItem(null)}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Kiểm tra sản phẩm</h3>
                        <p className="text-sm text-slate-500 mb-4">{inspectingItem.product_name} ({inspectingItem.product_sku})</p>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Tình trạng</label>
                                <select value={inspectForm.condition} onChange={e => setInspectForm({ ...inspectForm, condition: e.target.value })} className="input w-full">
                                    <option value="good">Tốt - Có thể nhập kho</option>
                                    <option value="damaged">Hư hỏng</option>
                                    <option value="defective">Lỗi sản xuất</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">SL nhập kho</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={inspectingItem.quantity_returned}
                                        value={inspectForm.quantity_restocked}
                                        onChange={e => {
                                            const v = parseInt(e.target.value) || 0;
                                            setInspectForm({ ...inspectForm, quantity_restocked: v, quantity_scrapped: inspectingItem.quantity_returned - v });
                                        }}
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="label">SL thanh lý</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={inspectingItem.quantity_returned}
                                        value={inspectForm.quantity_scrapped}
                                        onChange={e => {
                                            const v = parseInt(e.target.value) || 0;
                                            setInspectForm({ ...inspectForm, quantity_scrapped: v, quantity_restocked: inspectingItem.quantity_returned - v });
                                        }}
                                        className="input w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Kho nhập</label>
                                <select
                                    value={inspectForm.warehouse_id || ''}
                                    onChange={e => setInspectForm({ ...inspectForm, warehouse_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="input w-full"
                                >
                                    <option value="">-- Chọn kho --</option>
                                    {warehousesData?.data?.map((w: any) => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Ghi chú</label>
                                <textarea value={inspectForm.notes} onChange={e => setInspectForm({ ...inspectForm, notes: e.target.value })} className="input w-full" rows={2} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setInspectingItem(null)} className="btn-secondary">Đóng</button>
                            <button onClick={handleInspect} disabled={inspectMutation.isPending} className="btn-primary">
                                {inspectMutation.isPending ? 'Đang lưu...' : 'Lưu kết quả'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
