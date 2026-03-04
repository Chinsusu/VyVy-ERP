import { ShoppingCart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRelatedPOs } from '../../hooks/useRelatedPOs';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    draft: { label: 'Nháp', cls: 'badge-warning' },
    approved: { label: 'Đã duyệt', cls: 'badge-success' },
    cancelled: { label: 'Đã hủy', cls: 'badge-danger' },
    closed: { label: 'Đã đóng', cls: 'badge-secondary' },
};

interface Props {
    mrId: number;
}

export default function RelatedPOsPanel({ mrId }: Props) {
    const { data: pos, isLoading } = useRelatedPOs(mrId);

    if (isLoading) return null;
    if (!pos || pos.length === 0) return null;

    return (
        <div className="card border-l-4 border-l-amber-400">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                Đơn Mua Hàng Tự Động
                <span className="text-xs font-normal text-gray-400 ml-1">
                    (tạo tự động do thiếu tồn kho khi duyệt KHSX)
                </span>
                <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pos.length} đơn
                </span>
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                            <th className="text-left py-2 px-3 font-medium">Số PO</th>
                            <th className="text-left py-2 px-3 font-medium">Nhà cung cấp</th>
                            <th className="text-left py-2 px-3 font-medium">Ngày tạo</th>
                            <th className="text-left py-2 px-3 font-medium">Trạng thái</th>
                            <th className="text-right py-2 px-3 font-medium">Tổng tiền</th>
                            <th className="text-center py-2 px-3 font-medium">Mặt hàng</th>
                            <th className="py-2 px-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {pos.map((po) => {
                            const badge = STATUS_BADGE[po.status] ?? { label: po.status, cls: 'badge-secondary' };
                            const itemCount = po.items?.length ?? 0;
                            return (
                                <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-2 px-3 font-mono font-semibold text-gray-800">
                                        {po.po_number}
                                    </td>
                                    <td className="py-2 px-3 text-gray-600">
                                        {po.supplier?.name ?? '—'}
                                    </td>
                                    <td className="py-2 px-3 text-gray-500">
                                        {new Date(po.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-2 px-3">
                                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                                    </td>
                                    <td className="py-2 px-3 text-right font-medium text-gray-800">
                                        {po.total_amount > 0
                                            ? po.total_amount.toLocaleString('vi-VN') + 'đ'
                                            : <span className="text-gray-400 text-xs">Chưa có giá</span>
                                        }
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                            {itemCount} NVL
                                        </span>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                        <Link
                                            to={`/purchase-orders/${po.id}`}
                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                            Xem <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Items detail expandable */}
            {pos.some(p => (p.items?.length ?? 0) > 0) && (
                <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-gray-500 text-xs hover:text-gray-700 select-none">
                        Xem chi tiết nguyên vật liệu cần mua
                    </summary>
                    <div className="mt-2 space-y-3">
                        {pos.map(po => (
                            po.items && po.items.length > 0 && (
                                <div key={po.id}>
                                    <p className="text-xs font-semibold text-gray-500 mb-1">{po.po_number}</p>
                                    <table className="w-full text-xs border rounded overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left px-3 py-1.5 font-medium text-gray-500">Nguyên vật liệu</th>
                                                <th className="text-right px-3 py-1.5 font-medium text-gray-500">SL cần mua</th>
                                                <th className="text-right px-3 py-1.5 font-medium text-gray-500">Đơn giá</th>
                                                <th className="text-right px-3 py-1.5 font-medium text-gray-500">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {po.items.map(item => (
                                                <tr key={item.id}>
                                                    <td className="px-3 py-1.5 text-gray-700">
                                                        {item.material?.trading_name ?? item.notes ?? `Material #${item.material_id}`}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-right text-gray-600">
                                                        {item.quantity.toLocaleString('vi-VN')} {item.material?.unit ?? ''}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-right text-gray-600">
                                                        {item.unit_price > 0
                                                            ? item.unit_price.toLocaleString('vi-VN') + 'đ'
                                                            : '—'}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-right font-medium text-gray-700">
                                                        {item.line_total > 0
                                                            ? item.line_total.toLocaleString('vi-VN') + 'đ'
                                                            : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
}
