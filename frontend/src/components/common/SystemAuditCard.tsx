import { User, ShieldCheck, Clock } from 'lucide-react';

interface AuditUser {
    full_name?: string;
    username?: string;
}

interface SystemAuditCardProps {
    createdByUser?: AuditUser | null;
    createdAt?: string | null;
    updatedByUser?: AuditUser | null;
    updatedAt?: string | null;
    approvedByUser?: AuditUser | null;
    approvedAt?: string | null;
    /** Extra slots below the approved row */
    extra?: React.ReactNode;
}

function AuditRow({
    label,
    user,
    date,
    highlight,
}: {
    label: string;
    user?: AuditUser | null;
    date?: string | null;
    highlight?: boolean;
}) {
    const name = user?.full_name || user?.username;
    return (
        <div className="space-y-1 border-b pb-3 last:border-b-0 last:pb-0">
            <span className="text-gray-400 uppercase font-semibold tracking-wider text-[10px]">
                {label}
            </span>
            <p className={`font-semibold text-sm ${highlight ? 'text-green-700' : 'text-gray-800'}`}>
                {name ? name : <span className="text-gray-400 italic font-normal">—</span>}
            </p>
            {date && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(date).toLocaleString('vi-VN')}
                </p>
            )}
        </div>
    );
}

/**
 * SystemAuditCard — reusable sidebar card that shows who created,
 * last edited, and approved a record.
 * 
 * Usage:
 *   <SystemAuditCard
 *     createdByUser={entity.created_by_user}
 *     createdAt={entity.created_at}
 *     updatedByUser={entity.updated_by_user}
 *     updatedAt={entity.updated_at}
 *     approvedByUser={entity.approved_by_user}
 *     approvedAt={entity.approved_at}
 *   />
 */
export default function SystemAuditCard({
    createdByUser,
    createdAt,
    updatedByUser,
    updatedAt,
    approvedByUser,
    approvedAt,
    extra,
}: SystemAuditCardProps) {
    return (
        <div className="card space-y-4 bg-white">
            <h4 className="text-[length:var(--font-size-3xs)] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" />
                Kiểm Soát Hệ Thống
            </h4>
            <div className="text-xs space-y-3">
                <AuditRow
                    label="Người tạo đơn"
                    user={createdByUser}
                    date={createdAt}
                />
                <AuditRow
                    label="Chỉnh sửa gần nhất"
                    user={updatedByUser}
                    date={updatedAt}
                />
                {(approvedByUser || approvedAt) && (
                    <AuditRow
                        label="Người duyệt đơn"
                        user={approvedByUser}
                        date={approvedAt}
                        highlight
                    />
                )}
            </div>
            {extra && (
                <div className="pt-2 border-t space-y-4">
                    {extra}
                </div>
            )}
            {/* Access badge */}
            <div className="pt-2 border-t flex items-center gap-1.5 text-[10px] text-gray-400">
                <ShieldCheck className="w-3 h-3" />
                <span>Dữ liệu được bảo vệ bởi hệ thống</span>
            </div>
        </div>
    );
}
