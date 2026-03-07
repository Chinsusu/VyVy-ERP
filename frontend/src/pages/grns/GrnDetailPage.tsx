import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    AlertTriangle,
    Package,
    FileText,
    Save,
    X,
    ClipboardCheck,
    Warehouse,
} from 'lucide-react';
import { useGrn, useUpdateGRNQC, usePostGRN } from '../../hooks/useGrns';
import type { UpdateGRNQCInput, UpdateGRNQCItemInput } from '../../types/grn';
import AuditLogPanel from '../../components/common/AuditLogPanel';

export default function GrnDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const grnId = parseInt(id || '0', 10);

    const { data: grn, isLoading, error } = useGrn(grnId);
    const updateQCMutation = useUpdateGRNQC();
    const postGRNMutation = usePostGRN();

    const [isQCEditMode, setIsQCEditMode] = useState(false);
    const [qcFormData, setQCFormData] = useState<UpdateGRNQCInput>({
        notes: '',
        items: {},
    });

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

    if (error || !grn) {
        return (
            <div className="animate-fade-in p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    Lỗi tải dữ liệu: {error ? (error as Error).message : 'Không tìm thấy lệnh nhập kho'}
                </div>
            </div>
        );
    }

    const startQCEdit = () => {
        const initialItems: Record<number, UpdateGRNQCItemInput> = {};
        (grn.items || []).forEach(item => {
            initialItems[item.id] = {
                received_quantity: item.quantity,
                accepted_quantity: item.accepted_quantity || item.quantity,
                rejected_quantity: item.rejected_quantity || 0,
                qc_status: item.qc_status === 'pending' ? 'pass' : (item.qc_status as any),
                qc_notes: item.qc_notes || '',
            };
        });
        setQCFormData({ notes: grn.notes || '', items: initialItems });
        setIsQCEditMode(true);
    };

    const handleQCInputChange = (itemId: number, field: keyof UpdateGRNQCItemInput, value: any) => {
        setQCFormData(prev => ({
            ...prev,
            items: {
                ...prev.items,
                [itemId]: {
                    ...prev.items[itemId],
                    [field]: value,
                },
            },
        }));
    };

    const handleSaveQC = async () => {
        try {
            await updateQCMutation.mutateAsync({ id: grnId, input: qcFormData });
            setIsQCEditMode(false);
        } catch (err) {
            console.error('QC Update failed:', err);
            alert('Cập nhật KCS thất bại.');
        }
    };

    const handlePost = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn nhập kho? Hành động này không thể hoàn tác.')) return;
        try {
            await postGRNMutation.mutateAsync(grnId);
        } catch (err) {
            console.error('Posting failed:', err);
            alert('Nhập kho thất bại.');
        }
    };

    const getQCBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="badge badge-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Chưa KCS</span>;
            case 'pass':
                return <span className="badge badge-success flex items-center gap-1"><CheckCircle className="w-3 h-3" /> KCS Đạt</span>;
            case 'fail':
                return <span className="badge badge-danger flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> KCS Không Đạt</span>;
            case 'conditional':
                return <span className="badge badge-warning flex items-center gap-1"><Clock className="w-3 h-3" /> KCS Điều Kiện</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const getItemQCColor = (status: string) => {
        if (status === 'pass') return 'text-green-600';
        if (status === 'fail') return 'text-red-600';
        if (status === 'partial') return 'text-blue-600';
        return 'text-gray-400';
    };

    const getItemQCLabel = (status: string) => {
        if (status === 'pass') return 'Đạt';
        if (status === 'fail') return 'Không đạt';
        if (status === 'partial') return 'Một phần';
        return 'Chờ';
    };

    return (
        <div className="animate-fade-in">
            {/* Back */}
            <button
                onClick={() => navigate('/grns')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Lệnh Nhập Kho
            </button>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                        <ClipboardCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{grn.grn_number}</h1>
                            {getQCBadge(grn.overall_qc_status || 'pending')}
                            {grn.posted ? (
                                <span className="badge badge-info flex items-center gap-1">
                                    <Package className="w-3 h-3" /> Đã nhập kho
                                </span>
                            ) : (
                                <span className="badge badge-secondary flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Chưa nhập kho
                                </span>
                            )}
                        </div>
                        {grn.purchase_order?.supplier?.name && (
                            <p className="text-gray-600 mt-0.5">{grn.purchase_order.supplier.name}</p>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-shrink-0">
                    {isQCEditMode ? (
                        <>
                            <button type="button" onClick={() => setIsQCEditMode(false)} className="btn btn-secondary flex items-center gap-2">
                                <X className="w-4 h-4" /> Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveQC}
                                disabled={updateQCMutation.isPending}
                                className="btn btn-success flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {updateQCMutation.isPending ? 'Đang lưu...' : 'Lưu Kết Quả KCS'}
                            </button>
                        </>
                    ) : !grn.posted ? (
                        <>
                            <button type="button" onClick={startQCEdit} className="btn btn-secondary flex items-center gap-2">
                                <ClipboardCheck className="w-4 h-4" /> Cập nhật KCS
                            </button>
                            {grn.overall_qc_status !== 'pending' && (
                                <button
                                    type="button"
                                    onClick={handlePost}
                                    disabled={postGRNMutation.isPending}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    <Package className="w-4 h-4" />
                                    {postGRNMutation.isPending ? 'Đang nhập...' : 'Nhập Kho'}
                                </button>
                            )}
                        </>
                    ) : null}
                </div>
            </div>

            {/* Info Bar */}
            <div className="card mb-6 py-3">
                <div className="flex divide-x divide-gray-200">
                    <div className="flex-1 px-4 first:pl-0">
                        <p className="text-xs text-gray-500">Đơn mua hàng</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">
                            {grn.purchase_order_id ? (
                                <a href={`/purchase-orders/${grn.purchase_order_id}`} className="text-primary hover:underline">
                                    {grn.purchase_order?.po_number || `#${grn.purchase_order_id}`}
                                </a>
                            ) : '—'}
                        </p>
                    </div>
                    <div className="flex-1 px-4">
                        <p className="text-xs text-gray-500">Kho nhập</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">{grn.warehouse?.name || '—'}</p>
                    </div>
                    <div className="flex-1 px-4">
                        <p className="text-xs text-gray-500">Ngày nhập</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">
                            {new Date(grn.receipt_date).toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                    <div className="flex-1 px-4 last:pr-0">
                        <p className="text-xs text-gray-500">Số loại NVL</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">{(grn.items || []).length} loại</p>
                    </div>
                </div>
            </div>

            {/* Main 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items table */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-semibold flex items-center gap-2">
                                <Package className="w-4 h-4 text-primary" />
                                Danh Sách Hàng Nhập
                                <span className="text-sm text-gray-400 font-normal">({(grn.items || []).length})</span>
                            </h3>
                            {isQCEditMode && (
                                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                                    Chế độ cập nhật KCS
                                </span>
                            )}
                        </div>
                        <div className="table-container">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-xs uppercase text-gray-500 font-semibold tracking-wide">
                                        <th className="px-4 py-3 text-left">Nguyên vật liệu</th>
                                        <th className="px-4 py-3 text-right w-24">SL đặt</th>
                                        <th className="px-4 py-3 text-right w-28">SL thực nhận</th>
                                        <th className="px-4 py-3 text-right w-28">Chấp nhận</th>
                                        <th className="px-4 py-3 text-right w-28">Từ chối</th>
                                        <th className="px-4 py-3 text-center w-28">KCS</th>
                                        <th className="px-4 py-3 text-left">Vị trí / Lô</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(grn.items || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10 text-gray-400 italic text-sm">
                                                Chưa có hàng hóa trong lệnh này
                                            </td>
                                        </tr>
                                    ) : (
                                        grn.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 align-top">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-sm text-gray-900">{item.material?.trading_name}</div>
                                                    <div className="text-xs text-gray-400 font-mono uppercase">{item.material?.code}</div>
                                                    {item.unit_cost > 0 && (
                                                        <div className="text-xs text-gray-400 mt-0.5">
                                                            Đơn giá: {Number(item.unit_cost).toLocaleString('vi-VN')}đ
                                                        </div>
                                                    )}
                                                </td>
                                                {/* SL đặt từ PO - readonly, luôn là số lượng đặt gốc */}
                                                <td className="px-4 py-3 text-right text-sm text-gray-400">{item.po_quantity}</td>
                                                {/* SL thực nhận - editable trong QC mode */}
                                                <td className="px-4 py-3 text-right">
                                                    {isQCEditMode ? (
                                                        <input
                                                            type="number"
                                                            className="input w-20 text-right h-8 text-sm"
                                                            value={qcFormData.items[item.id]?.received_quantity ?? item.quantity}
                                                            onChange={(e) => handleQCInputChange(item.id, 'received_quantity', Number(e.target.value))}
                                                            min={0}
                                                            step={1}
                                                        />
                                                    ) : (
                                                        <span className="font-semibold text-sm text-gray-900">{item.quantity}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {isQCEditMode ? (
                                                        <input
                                                            type="number"
                                                            className="input w-20 text-right h-8 text-sm"
                                                            value={qcFormData.items[item.id]?.accepted_quantity ?? item.accepted_quantity}
                                                            onChange={(e) => handleQCInputChange(item.id, 'accepted_quantity', Number(e.target.value))}
                                                            max={qcFormData.items[item.id]?.received_quantity ?? item.quantity}
                                                            min={0}
                                                        />
                                                    ) : (
                                                        <span className="text-green-600 font-semibold text-sm">{item.accepted_quantity ?? '—'}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {isQCEditMode ? (
                                                        <input
                                                            type="number"
                                                            className="input w-20 text-right h-8 text-sm"
                                                            value={qcFormData.items[item.id]?.rejected_quantity ?? item.rejected_quantity}
                                                            onChange={(e) => handleQCInputChange(item.id, 'rejected_quantity', Number(e.target.value))}
                                                            max={item.quantity}
                                                            min={0}
                                                        />
                                                    ) : (
                                                        <span className="text-red-500 text-sm">{item.rejected_quantity ?? '—'}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {isQCEditMode ? (
                                                        <select
                                                            className="input h-8 py-0 text-xs w-28"
                                                            value={qcFormData.items[item.id]?.qc_status ?? item.qc_status}
                                                            onChange={(e) => handleQCInputChange(item.id, 'qc_status', e.target.value)}
                                                        >
                                                            <option value="pass">Đạt</option>
                                                            <option value="fail">Không đạt</option>
                                                            <option value="partial">Một phần</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`text-xs font-bold uppercase ${getItemQCColor(item.qc_status)}`}>
                                                            {getItemQCLabel(item.qc_status)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    <div className="text-gray-600 font-medium">
                                                        {item.warehouse_location?.full_path || (
                                                            <span className="text-gray-400 italic">Chưa có vị trí</span>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-400 mt-0.5">
                                                        {item.batch_number && `Số lô: ${item.batch_number}`}
                                                        {item.expiry_date && (
                                                            <div>HSD: {new Date(item.expiry_date).toLocaleDateString('vi-VN')}</div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes */}
                    {grn.notes && (
                        <div className="card">
                            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" /> Ghi Chú
                            </h3>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{grn.notes}</p>
                        </div>
                    )}

                    {/* Audit Log */}
                    <AuditLogPanel tableName="goods_receipt_notes" recordId={grnId} />
                </div>

                {/* Right sidebar (1/3) */}
                <div className="space-y-6">
                    {/* Status card */}
                    <div className="card">
                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" /> Trạng Thái
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">KCS tổng thể</span>
                                {getQCBadge(grn.overall_qc_status || 'pending')}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Trạng thái kho</span>
                                {grn.posted ? (
                                    <span className="badge badge-info flex items-center gap-1">
                                        <Package className="w-3 h-3" /> Đã nhập kho
                                    </span>
                                ) : (
                                    <span className="badge badge-secondary flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Chưa nhập kho
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-3 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Ngày tạo</span>
                                <span className="text-gray-700 font-medium">
                                    {new Date(grn.created_at).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            {grn.posted_at && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Thời gian nhập kho</span>
                                    <span className="text-primary font-bold">
                                        {new Date(grn.posted_at).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            )}
                            {grn.qc_approved_at && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">KCS hoàn thành</span>
                                    <span className="text-gray-700">
                                        {new Date(grn.qc_approved_at).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stock impact card */}
                    <div className="card">
                        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                            <Warehouse className="w-4 h-4 text-primary" /> Tác Động Tồn Kho
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {grn.posted
                                ? 'Lệnh này đã cập nhật sổ kho. Tồn kho đã được tăng theo số lượng chấp nhận KCS.'
                                : 'Sau khi nhập kho, lệnh này sẽ tăng tồn kho. Chỉ số lượng KCS đạt mới được ghi nhận.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
