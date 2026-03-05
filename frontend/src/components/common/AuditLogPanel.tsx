import { History, User, Clock, ArrowRight, Plus, Trash2, Edit, CheckCircle, XCircle, Truck, CreditCard, FileText } from 'lucide-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';

interface AuditLogPanelProps {
    tableName: string;
    recordId: number;
}

// Map of field keys to Vietnamese labels
const FIELD_LABELS: Record<string, string> = {
    code: 'Mã',
    trading_name: 'Tên thương mại',
    inci_name: 'Tên INCI',
    material_type: 'Loại NVL',
    category: 'Danh mục',
    sub_category: 'Danh mục phụ',
    unit: 'Đơn vị',
    supplier_id: 'Nhà cung cấp',
    standard_cost: 'Giá vốn chuẩn',
    last_purchase_price: 'Giá mua gần nhất',
    min_stock_level: 'Tồn kho tối thiểu',
    max_stock_level: 'Tồn kho tối đa',
    reorder_point: 'Điểm đặt lại',
    reorder_quantity: 'Số lượng đặt lại',
    requires_qc: 'Cần KCS',
    shelf_life_days: 'Hạn sử dụng (ngày)',
    storage_conditions: 'Điều kiện bảo quản',
    hazardous: 'Nguy hiểm',
    is_active: 'Trạng thái',
    notes: 'Ghi chú',
    name: 'Tên',
    name_en: 'Tên tiếng Anh',
    selling_price: 'Giá bán',
    net_weight: 'Khối lượng tịnh',
    gross_weight: 'Khối lượng thô',
    volume: 'Thể tích',
    barcode: 'Barcode',
    tax_code: 'Mã số thuế',
    contact_person: 'Người liên hệ',
    phone: 'Điện thoại',
    email: 'Email',
    address: 'Địa chỉ',
    city: 'Thành phố',
    country: 'Quốc gia',
    payment_terms: 'Điều khoản thanh toán',
    credit_limit: 'Hạn mức tín dụng',
    created_at: 'Ngày tạo',
    updated_at: 'Cập nhật lúc',
    // PO fields
    order_date: 'Ngày đặt hàng',
    expected_delivery_date: 'Ngày giao dự kiến',
    status: 'Trạng thái',
    warehouse_id: 'Kho nhận',
    subtotal: 'Tạm tính',
    tax_amount: 'Thuế',
    discount_amount: 'Giảm giá',
    total_amount: 'Tổng cộng',
    shipping_method: 'Phương thức vận chuyển',
    // MR fields
    requested_by_id: 'Người yêu cầu',
    approved_by_id: 'Người duyệt',
    approved_at: 'Ngày duyệt',
    required_date: 'Ngày cần',
    mr_number: 'Mã MR',
    po_number: 'Mã PO',
};

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '\u2014';
    if (typeof value === 'boolean') return value ? 'Có' : 'Không';
    if (typeof value === 'number') return value.toLocaleString('vi-VN');
    if (typeof value === 'string') {
        // ISO date
        if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return new Date(value).toLocaleString('vi-VN');
        }
        return value;
    }
    if (Array.isArray(value)) return `(${value.length} mục)`;
    if (typeof value === 'object') {
        // Try to extract a meaningful label from common objects
        const obj = value as Record<string, unknown>;
        if (obj.name) return String(obj.name);
        if (obj.trading_name) return String(obj.trading_name);
        return JSON.stringify(value);
    }
    return String(value);
}

const WORKFLOW_FIELD_LABELS: Record<string, string> = {
    order_status: 'Trạng thái đặt hàng',
    payment_status: 'Thanh toán',
    invoice_status: 'Hóa đơn',
    invoice_number: 'Số hóa đơn',
    invoice_date: 'Ngày hóa đơn',
    notes: 'Ghi chú',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xử lý',
    ordered: 'Đã đặt',
    partial: 'Một phần',
    completed: 'Hoàn thành',
    received: 'Đã nhận',
};

function ActionBadge({ action }: { action: string }) {
    if (action === 'CREATE') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700"><Plus className="w-3 h-3" />Tạo mới</span>;
    if (action === 'UPDATE') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"><Edit className="w-3 h-3" />Chỉnh sửa</span>;
    if (action === 'DELETE') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700"><Trash2 className="w-3 h-3" />Xóa</span>;
    if (action === 'APPROVE') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" />Đã duyệt</span>;
    if (action === 'CANCEL') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3 h-3" />Đã hủy</span>;
    if (action === 'UPDATE_ORDER_STATUS') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700"><Truck className="w-3 h-3" />Cập nhật đặt hàng</span>;
    if (action === 'UPDATE_PAYMENT_STATUS') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700"><CreditCard className="w-3 h-3" />Cập nhật thanh toán</span>;
    if (action === 'UPDATE_INVOICE_STATUS') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700"><FileText className="w-3 h-3" />Cập nhật hóa đơn</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"><Edit className="w-3 h-3" />{action}</span>;
}


export default function AuditLogPanel({ tableName, recordId }: AuditLogPanelProps) {
    const { data: logs, isLoading, error } = useAuditLogs(tableName, recordId);

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Lịch Sử Chỉnh Sửa
            </h3>

            {isLoading && (
                <div className="text-center py-8 text-gray-500 text-sm">Đang tải lịch sử...</div>
            )}

            {error && (
                <div className="text-center py-4 text-red-500 text-sm">Không thể tải lịch sử</div>
            )}

            {!isLoading && !error && logs && logs.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">Chưa có lịch sử thay đổi</div>
            )}

            {logs && logs.length > 0 && (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

                    <div className="space-y-4">
                        {[...logs].reverse().map((log) => (
                            <div key={log.id} className="relative pl-10">
                                {/* Timeline dot */}
                                <div className={`absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-white ${log.action === 'CREATE' ? 'bg-green-500' :
                                    log.action === 'DELETE' ? 'bg-red-500' :
                                        log.action === 'APPROVE' ? 'bg-emerald-500' :
                                            log.action === 'CANCEL' ? 'bg-red-500' :
                                                log.action === 'UPDATE_PAYMENT_STATUS' ? 'bg-yellow-500' :
                                                    log.action === 'UPDATE_INVOICE_STATUS' ? 'bg-purple-500' :
                                                        'bg-blue-500'
                                    }`} />

                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    {/* Header */}
                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <ActionBadge action={log.action} />
                                            <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                {log.username || 'Hệ thống'}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.created_at).toLocaleString('vi-VN')}
                                        </span>
                                    </div>

                                    {/* Changed fields for UPDATE */}
                                    {log.action === 'UPDATE' && (() => {
                                        const NOISE = new Set(['updated_at', 'created_at', 'deleted_at', 'updated_by', 'created_by']);
                                        const ARRAY_FIELDS = new Set(['items', 'suppliers']);
                                        const changedFields: string[] = log.changed_fields || [];
                                        const visible = changedFields.filter((f: string) => !NOISE.has(f));

                                        if (visible.length === 0) {
                                            return (
                                                <p className="text-xs text-gray-400 mt-1 italic">Cập nhật hệ thống</p>
                                            );
                                        }

                                        const rows = visible.map((field: string) => {
                                            const label = FIELD_LABELS[field] || field;
                                            const oldVal = log.old_values?.[field];
                                            const newVal = log.new_values?.[field];
                                            if (oldVal === undefined && newVal === undefined) return null;
                                            // Normalize: treat null, undefined, "" as equivalent → skip if no real change
                                            const norm = (v: unknown) => (v === null || v === undefined || v === '') ? '__EMPTY__' : String(v);
                                            if (!ARRAY_FIELDS.has(field) && norm(oldVal) === norm(newVal)) return null;
                                            if (ARRAY_FIELDS.has(field)) {
                                                return (
                                                    <div key={field} className="flex items-start gap-2 text-xs">
                                                        <span className="text-gray-500 min-w-[120px] pt-0.5">{label}:</span>
                                                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Đã cập nhật</span>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div key={field} className="flex items-start gap-2 text-xs">
                                                    <span className="text-gray-500 min-w-[120px] pt-0.5">{label}:</span>
                                                    <div className="flex items-center gap-1 flex-wrap">
                                                        <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded line-through">
                                                            {formatValue(oldVal)}
                                                        </span>
                                                        <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                                                        <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                                                            {formatValue(newVal)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }).filter(Boolean);

                                        if (rows.length === 0) {
                                            return <p className="text-xs text-gray-400 mt-1 italic">Cập nhật hệ thống</p>;
                                        }
                                        return <div className="space-y-1 mt-2">{rows}</div>;
                                    })()}

                                    {/* Workflow status updates: B4/B5/B6 */}
                                    {['UPDATE_ORDER_STATUS', 'UPDATE_PAYMENT_STATUS', 'UPDATE_INVOICE_STATUS'].includes(log.action) && (
                                        <div className="space-y-1 mt-2">
                                            {Object.entries(log.new_values || {}).map(([field, newVal]) => {
                                                const label = WORKFLOW_FIELD_LABELS[field] || field;
                                                const oldVal = log.old_values?.[field];
                                                const displayNew = STATUS_LABELS[String(newVal)] || String(newVal);
                                                const displayOld = oldVal ? (STATUS_LABELS[String(oldVal)] || String(oldVal)) : null;
                                                if (field === 'notes') {
                                                    if (!newVal) return null;
                                                    return (
                                                        <div key={field} className="flex items-start gap-2 text-xs">
                                                            <span className="text-gray-500 min-w-[100px] pt-0.5">{label}:</span>
                                                            <span className="text-gray-700 italic">{String(newVal)}</span>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div key={field} className="flex items-start gap-2 text-xs">
                                                        <span className="text-gray-500 min-w-[100px] pt-0.5">{label}:</span>
                                                        <div className="flex items-center gap-1">
                                                            {displayOld && (
                                                                <><span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded line-through">{displayOld}</span>
                                                                    <ArrowRight className="w-3 h-3 text-gray-400" /></>
                                                            )}
                                                            <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{displayNew}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }).filter(Boolean)}
                                        </div>
                                    )}

                                    {/* Summary for CREATE */}
                                    {log.action === 'CREATE' && (
                                        <p className="text-xs text-gray-500 mt-1">Bản ghi được tạo lần đầu</p>
                                    )}

                                    {/* Summary for APPROVE/CANCEL */}
                                    {log.action === 'APPROVE' && (
                                        <p className="text-xs text-gray-500 mt-1">Đơn hàng đã được duyệt</p>
                                    )}
                                    {log.action === 'CANCEL' && (
                                        <p className="text-xs text-gray-500 mt-1">Đơn hàng đã bị hủy</p>
                                    )}

                                    {/* Summary for DELETE */}
                                    {log.action === 'DELETE' && (
                                        <p className="text-xs text-gray-500 mt-1">Bản ghi đã bị xóa</p>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
