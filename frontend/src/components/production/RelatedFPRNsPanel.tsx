import { PackageCheck, ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRelatedFPRNs } from '../../hooks/useRelatedFPRNs';
import type { FinishedProductReceipt } from '../../types/finishedProductReceipt';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    draft: { label: 'Nháp', cls: 'badge-warning' },
    posted: { label: 'Đã nhập kho', cls: 'badge-success' },
    cancelled: { label: 'Đã hủy', cls: 'badge-danger' },
};

interface Props {
    planId: number;
    planNumber?: string;
}

export default function RelatedFPRNsPanel({ planId, planNumber }: Props) {
    const { data: fprns, isLoading } = useRelatedFPRNs(planId);

    return (
        <div className="card border-l-4 border-l-green-400">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <PackageCheck className="w-5 h-5 text-green-500" />
                Nhập Kho Thành Phẩm
                <span className="text-xs font-normal text-gray-400 ml-1">
                    (từ sản xuất KHSX này)
                </span>
                {fprns && fprns.length > 0 && (
                    <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {fprns.length} phiếu
                    </span>
                )}
                <Link
                    to={`/finished-product-receipts/new${planId ? `?production_plan_id=${planId}` : ''}`}
                    className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium border border-green-200 hover:border-green-400 rounded px-2 py-0.5 transition-colors"
                >
                    <Plus className="w-3 h-3" /> Tạo phiếu
                </Link>
            </h3>

            {isLoading ? (
                <p className="text-sm text-gray-400">Đang tải...</p>
            ) : !fprns || fprns.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                    <PackageCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Chưa có phiếu nhập kho thành phẩm nào</p>
                    <Link
                        to={`/finished-product-receipts/new${planId ? `?production_plan_id=${planId}` : ''}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 hover:underline"
                    >
                        <Plus className="w-3 h-3" /> Tạo phiếu đầu tiên
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                                <th className="text-left py-2 px-3 font-medium">Số phiếu</th>
                                <th className="text-left py-2 px-3 font-medium">Kho nhập</th>
                                <th className="text-left py-2 px-3 font-medium">Ngày nhập</th>
                                <th className="text-left py-2 px-3 font-medium">Trạng thái</th>
                                <th className="text-center py-2 px-3 font-medium">Thành phẩm</th>
                                <th className="py-2 px-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {fprns.map((fprn: FinishedProductReceipt) => {
                                const badge = STATUS_BADGE[fprn.status] ?? { label: fprn.status, cls: 'badge-secondary' };
                                const itemCount = fprn.items?.length ?? 0;
                                const totalQty = fprn.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
                                return (
                                    <tr key={fprn.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-2 px-3 font-mono font-semibold text-gray-800">
                                            {fprn.fprn_number}
                                        </td>
                                        <td className="py-2 px-3 text-gray-600">
                                            {fprn.warehouse?.name ?? '—'}
                                        </td>
                                        <td className="py-2 px-3 text-gray-500">
                                            {new Date(fprn.receipt_date).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="py-2 px-3">
                                            <span className={`badge ${badge.cls}`}>{badge.label}</span>
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                                {itemCount} SP · {totalQty.toLocaleString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-right">
                                            <Link
                                                to={`/finished-product-receipts/${fprn.id}`}
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
            )}
        </div>
    );
}
