import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export interface AuditLog {
    id: number;
    table_name: string;
    record_id: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'CANCEL' | 'UPDATE_ORDER_STATUS' | 'UPDATE_PAYMENT_STATUS' | 'UPDATE_INVOICE_STATUS' | string;
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    changed_fields?: string[];
    user_id?: number;
    username: string;
    ip_address?: string;
    created_at: string;
}

export function useAuditLogs(tableName: string, recordId: number | undefined) {
    return useQuery<AuditLog[]>({
        queryKey: ['audit-logs', tableName, recordId],
        queryFn: async () => {
            const res = await api.get('/audit-logs', {
                params: { table: tableName, record_id: recordId },
            });
            return res.data.data || [];
        },
        enabled: !!recordId,
        staleTime: 30_000,
    });
}
