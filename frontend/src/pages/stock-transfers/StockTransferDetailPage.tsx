import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, CheckCircle, XCircle, Package, Clock } from 'lucide-react';
import { useStockTransfer, usePostStockTransfer, useCancelStockTransfer } from '../../hooks/useStockTransfers';
import type { StockTransferItem } from '../../types/stockTransfer';

const STATUS_BADGE: Record<string, string> = {
    draft: 'badge badge-secondary',
    posted: 'badge badge-success',
    cancelled: 'badge badge-danger',
};
const STATUS_LABEL: Record<string, string> = {
    draft: 'Nháp',
    posted: 'Đã xử lý',
    cancelled: 'Đã hủy',
};

export default function StockTransferDetailPage() {
    const { id } = useParams<{ id: string }>();
    const stId = parseInt(id || '0', 10);
    const navigate = useNavigate();

    const { data: st, isLoading, error } = useStockTransfer(stId);
    const postMutation = usePostStockTransfer();
    const cancelMutation = useCancelStockTransfer();

    if (isLoading) return <div className="animate-fade-in p-6 text-gray-400">Đang tải...</div>;
    if (error || !st) return (
        <div className="animate-fade-in p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {(error as Error)?.message || 'Không tìm thấy phiếu chuyển kho'}
            </div>
        </div>
    );

    const handlePost = async () => {
        if (window.confirm('Xác nhận xử lý phiếu chuyển kho? Thao tác này sẽ chuyển tồn kho và không thể hoàn tác.')) {
            try {
                await postMutation.mutateAsync(stId);
            } catch (err) {
                alert('Lỗi: ' + (err as Error).message);
            }
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Bạn có chắc muốn hủy phiếu chuyển kho này?')) {
            try {
                await cancelMutation.mutateAsync(stId);
            } catch (err) {
                alert('Lỗi: ' + (err as Error).message);
            }
        }
    };

    return (
        <div className="animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/stock-transfers" className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-primary-600 border border-transparent hover:border-gray-200">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-gray-900">{st.transfer_number}</h1>
                            <span className={STATUS_BADGE[st.status] || 'badge'}>{STATUS_LABEL[st.status] || st.status}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            Ngày chuyển: {new Date(st.transfer_date).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {st.status === 'draft' && (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={cancelMutation.isPending}
                                className="btn btn-secondary text-red-600 border-red-100 hover:bg-red-50 flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Hủy phiếu
                            </button>
                            <button
                                onClick={handlePost}
                                disabled={postMutation.isPending}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Xử lý chuyển kho
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Details + Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Info Card */}
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5 text-primary-600" />
                            Thông tin phiếu
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Kho xuất</p>
                                <p className="font-medium">{st.from_warehouse?.name || `#${st.from_warehouse_id}`}</p>
                                {st.from_warehouse?.type && <p className="text-xs text-gray-400">{st.from_warehouse.type}</p>}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Kho nhập</p>
                                <p className="font-medium">{st.to_warehouse?.name || `#${st.to_warehouse_id}`}</p>
                                {st.to_warehouse?.type && <p className="text-xs text-gray-400">{st.to_warehouse.type}</p>}
                            </div>
                            {st.notes && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Ghi chú</p>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">{st.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary-600" />
                            Danh sách hàng hóa
                        </h3>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nguyên vật liệu</th>
                                        <th>Lô hàng</th>
                                        <th className="text-right">SL chuyển</th>
                                        <th className="text-right">SL nhận</th>
                                        <th>Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(st.items || []).map((item: StockTransferItem) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="font-medium">{item.material?.trading_name || item.finished_product?.name || `#${item.item_id}`}</div>
                                                <div className="text-xs text-gray-400 font-mono">{item.material?.code || item.finished_product?.code}</div>
                                            </td>
                                            <td className="text-sm text-gray-600">{item.batch_number || '-'}</td>
                                            <td className="text-right font-medium">{item.quantity.toLocaleString()}</td>
                                            <td className="text-right text-gray-600">{item.received_quantity?.toLocaleString() || '0'}</td>
                                            <td className="text-sm text-gray-500">{item.notes || '-'}</td>
                                        </tr>
                                    ))}
                                    {(!st.items || st.items.length === 0) && (
                                        <tr><td colSpan={5} className="text-center text-gray-400 py-6">Không có dòng hàng hóa</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Workflow */}
                <div className="space-y-6">
                    <div className="card bg-gray-50 border-gray-200">
                        <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Trạng thái</h3>
                        <div className="space-y-3">
                            {/* Created */}
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">Đã tạo</span>
                                </div>
                                <span className="text-xs text-gray-500">{new Date(st.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                            {/* Posted */}
                            <div className={`flex items-center justify-between p-3 bg-white rounded-lg border ${st.posted ? 'border-green-200' : 'border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${st.posted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <ArrowRightLeft className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">Đã xử lý</span>
                                </div>
                                {st.posted_at ? (
                                    <span className="text-xs text-gray-500">{new Date(st.posted_at).toLocaleDateString('vi-VN')}</span>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Chờ</span>
                                )}
                            </div>
                            {/* Cancelled */}
                            {st.status === 'cancelled' && (
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-red-100 text-red-600">
                                            <XCircle className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-red-700">Đã hủy</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Info */}
                        {st.created_by_user && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    Tạo bởi: <span className="font-medium">{st.created_by_user.full_name || st.created_by_user.username}</span>
                                </p>
                                <p className="text-xs text-gray-400">{new Date(st.created_at).toLocaleString('vi-VN')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
