import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    AlertTriangle,
    Package,
    Building2,
    Truck,
    FileText,
    History,
    Save,
    X,
    ClipboardCheck
} from 'lucide-react';
import { useGrn, useUpdateGRNQC, usePostGRN } from '../../hooks/useGrns';
import type { UpdateGRNQCInput, UpdateGRNQCItemInput } from '../../types/grn';

export default function GrnDetailPage() {
    const { id } = useParams<{ id: string }>();
    const grnId = parseInt(id || '0', 10);

    const { data: grn, isLoading, error } = useGrn(grnId);
    const updateQCMutation = useUpdateGRNQC();
    const postGRNMutation = usePostGRN();

    // QC Edit Mode State
    const [isQCEditMode, setIsQCEditMode] = useState(false);
    const [qcFormData, setQCFormData] = useState<UpdateGRNQCInput>({
        notes: '',
        items: {},
    });

    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center">
                <p className="text-gray-500">Đang tải thông tin lệnh nhập kho...</p>
            </div>
        );
    }

    if (error || !grn) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error ? `Lỗi: ${(error as Error).message}` : 'Không tìm thấy lệnh nhập kho'}
                    </div>
                    <Link to="/grns" className="btn btn-secondary mt-4">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    const startQCEdit = () => {
        const initialItems: Record<number, UpdateGRNQCItemInput> = {};
        (grn.items || []).forEach(item => {
            initialItems[item.id] = {
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

    const getQCStatusBadge = (status: string) => {
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

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link to="/grns" className="text-primary hover:underline flex items-center gap-2 mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại danh sách
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className="text-slate-900">{grn.grn_number}</h1>
                            <div className="flex gap-2">
                                {getQCStatusBadge(grn.overall_qc_status || 'pending')}
                                {grn.posted ? (
                                    <span className="badge badge-info flex items-center gap-1"><Package className="w-3 h-3" /> Đã nhập kho</span>
                                ) : (
                                    <span className="badge badge-secondary flex items-center gap-1"><Clock className="w-3 h-3" /> Nháp</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {!grn.posted && !isQCEditMode && (
                            <>
                                <button onClick={startQCEdit} className="btn btn-secondary flex items-center gap-2">
                                    <ClipboardCheck className="w-4 h-4" />
                                    Cập nhật KCS
                                </button>
                                {grn.overall_qc_status !== 'pending' && (
                                    <button onClick={handlePost} className="btn btn-primary flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Nhập kho
                                    </button>
                                )}
                            </>
                        )}
                        {isQCEditMode && (
                            <>
                                <button onClick={() => setIsQCEditMode(false)} className="btn btn-secondary flex items-center gap-2">
                                    <X className="w-4 h-4" />
                                    Hủy
                                </button>
                                <button onClick={handleSaveQC} className="btn btn-success flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Lưu Kết Quả KCS
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Primary Info */}
                        <div className="card grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-400 uppercase text-[length:var(--font-size-3xs)] tracking-widest flex items-center gap-2 border-b pb-2">
                                    <Truck className="w-3 h-3" /> Đơn Mua Hàng & Nhà Cung Cấp
                                </h3>
                                <div>
                                    <p className="text-xs text-gray-500">Đơn mua hàng liên kết</p>
                                    <Link to={`/purchase-orders/${grn.purchase_order_id}`} className="font-bold text-primary hover:underline">
                                        {grn.purchase_order?.po_number}
                                    </Link>
                                    <p className="mt-2 text-sm font-medium">{grn.purchase_order?.supplier?.name}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-400 uppercase text-[length:var(--font-size-3xs)] tracking-widest flex items-center gap-2 border-b pb-2">
                                    <Building2 className="w-3 h-3" /> Thông Tin Kho
                                </h3>
                                <div>
                                    <p className="font-bold">{grn.warehouse?.name}</p>
                                    <p className="text-xs text-gray-500">Ngày nhập: {new Date(grn.receipt_date).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="card p-0 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                <h3 className="font-bold text-sm">Danh Sách Hàng Nhập</h3>
                                <span className="text-xs text-gray-500">{(grn.items || []).length} loại NVL</span>
                            </div>
                            <div className="table-container">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-white border-b text-premium-3xs uppercase text-gray-500 font-bold">
                                            <th className="px-4 py-3 text-left">Nguyên vật liệu</th>
                                            <th className="px-4 py-3 text-right">Số lượng nhập</th>
                                            <th className="px-4 py-3 text-right">Chấp nhận</th>
                                            <th className="px-4 py-3 text-right">Từ chối</th>
                                            <th className="px-4 py-3 text-center">Trạng thái KCS</th>
                                            <th className="px-4 py-3 text-left">Vị trí / Lô</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {(grn.items || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-8 text-gray-500 italic">
                                                    No items received in this note.
                                                </td>
                                            </tr>
                                        ) : (
                                            grn.items.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">
                                                        <div className="font-bold text-sm">{item.material?.trading_name}</div>
                                                        <div className="text-[length:var(--font-size-3xs)] text-gray-400 font-mono uppercase">{item.material?.code}</div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-medium">{item.quantity}</td>
                                                    <td className="px-4 py-4 text-right">
                                                        {isQCEditMode ? (
                                                            <input
                                                                type="number"
                                                                className="input input-sm w-20 text-right h-8"
                                                                value={qcFormData.items[item.id]?.accepted_quantity}
                                                                onChange={(e) => handleQCInputChange(item.id, 'accepted_quantity', Number(e.target.value))}
                                                                max={item.quantity}
                                                                min={0}
                                                            />
                                                        ) : (
                                                            <span className="text-green-600 font-bold">{item.accepted_quantity}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        {isQCEditMode ? (
                                                            <input
                                                                type="number"
                                                                className="input input-sm w-20 text-right h-8"
                                                                value={qcFormData.items[item.id]?.rejected_quantity}
                                                                onChange={(e) => handleQCInputChange(item.id, 'rejected_quantity', Number(e.target.value))}
                                                                max={item.quantity}
                                                                min={0}
                                                            />
                                                        ) : (
                                                            <span className="text-red-500">{item.rejected_quantity}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {isQCEditMode ? (
                                                            <select
                                                                className="select select-sm h-8 py-0"
                                                                value={qcFormData.items[item.id]?.qc_status}
                                                                onChange={(e) => handleQCInputChange(item.id, 'qc_status', e.target.value)}
                                                            >
                                                                <option value="pass">KCS Đạt</option>
                                                                <option value="fail">KCS Không Đạt</option>
                                                                <option value="partial">KCS Một Phần</option>
                                                            </select>
                                                        ) : (
                                                            <span className={`text-[length:var(--font-size-3xs)] font-bold uppercase ${item.qc_status === 'pass' ? 'text-green-600' :
                                                                item.qc_status === 'fail' ? 'text-red-600' :
                                                                    item.qc_status === 'partial' ? 'text-blue-600' : 'text-gray-400'
                                                                }`}>
                                                                {item.qc_status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-xs">
                                                        <div className="text-gray-600 font-medium">{item.warehouse_location?.full_path || <span className="text-gray-400 italic">Chưa có vị trí</span>}</div>
                                                        <div className="text-[length:var(--font-size-3xs)] text-gray-400">
                                                            {item.batch_number ? `Lô: ${item.batch_number}` : ''}
                                                            {item.lot_number ? ` | Lot: ${item.lot_number}` : ''}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {grn.notes && (
                            <div className="card space-y-2">
                                <h4 className="text-[length:var(--font-size-3xs)] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> Ghi Chú
                                </h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{grn.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div className="card space-y-6">
                            <div>
                                <h4 className="text-[length:var(--font-size-3xs)] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 mb-4">
                                    <History className="w-3 h-3" /> Trạng Thái & Kiểm Toán
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Ngày tạo</span>
                                        <span className="font-medium text-gray-800">{new Date(grn.created_at).toLocaleString('vi-VN')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Trạng thái kho</span>
                                        <span>{grn.posted ? 'Đã nhập kho' : 'Chưa nhập kho'}</span>
                                    </div>
                                    {grn.posted_at && (
                                        <div className="flex justify-between items-center text-xs border-t pt-3">
                                            <span className="text-gray-500">Thời gian nhập kho</span>
                                            <span className="font-bold text-primary">{new Date(grn.posted_at).toLocaleString('vi-VN')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card bg-gray-50 border-gray-200">
                            <h4 className="font-bold text-sm mb-4">Tác Động Tới Tồn Kho</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                {grn.posted
                                    ? "Lệnh này đã cập nhật sổ kửxể xuất và số dư tồn kho."
                                    : "Sau khi nhập kho, lệnh này sẽ tăng số lượng tồn kho và tạo bút toán trong sổ kất xuất."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
