import { History, User, Clock, ArrowRight, Plus, Trash2, Edit } from 'lucide-react';
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
};

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Có' : 'Không';
    if (typeof value === 'number') return value.toLocaleString('vi-VN');
    if (typeof value === 'string') {
        // ISO date
        if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return new Date(value).toLocaleString('vi-VN');
        }
        return value;
    }
    return String(value);
}

function ActionBadge({ action }: { action: string }) {
    if (action === 'CREATE') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                <Plus className="w-3 h-3" />
                Tạo mới
            </span>
        );
    }
    if (action === 'UPDATE') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                <Edit className="w-3 h-3" />
                Chỉnh sửa
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
            <Trash2 className="w-3 h-3" />
            Xóa
        </span>
    );
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
                        {logs.map((log) => (
                            <div key={log.id} className="relative pl-10">
                                {/* Timeline dot */}
                                <div className={`absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-white ${log.action === 'CREATE' ? 'bg-green-500' :
                                        log.action === 'DELETE' ? 'bg-red-500' : 'bg-blue-500'
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

                                    {/* Changed fields */}
                                    {log.action === 'UPDATE' && log.changed_fields && log.changed_fields.length > 0 && (
                                        <div className="space-y-1 mt-2">
                                            {log.changed_fields.map((field) => {
                                                const label = FIELD_LABELS[field] || field;
                                                const oldVal = log.old_values?.[field];
                                                const newVal = log.new_values?.[field];
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
                                            })}
                                        </div>
                                    )}

                                    {/* Summary for CREATE */}
                                    {log.action === 'CREATE' && (
                                        <p className="text-xs text-gray-500 mt-1">Bản ghi được tạo lần đầu</p>
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
