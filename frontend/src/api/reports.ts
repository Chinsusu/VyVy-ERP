import api from '../lib/axios';
import type { StockMovementReportRow, InventoryValueReportRow, LowStockReportRow, ExpiringSoonReportRow, ReportFilter } from '../types/report';
import type { APIResponse } from '../types/auth';

export const reportApi = {
    getStockMovement: async (filters: ReportFilter): Promise<StockMovementReportRow[]> => {
        const response = await api.get<APIResponse<StockMovementReportRow[]>>('/reports/stock-movement', { params: filters });
        return response.data.data || [];
    },

    getInventoryValue: async (filters: ReportFilter): Promise<InventoryValueReportRow[]> => {
        const response = await api.get<APIResponse<InventoryValueReportRow[]>>('/reports/inventory-value', { params: filters });
        return response.data.data || [];
    },

    getLowStock: async (filters: ReportFilter): Promise<LowStockReportRow[]> => {
        const response = await api.get<APIResponse<LowStockReportRow[]>>('/reports/low-stock', { params: filters });
        return response.data.data || [];
    },

    getExpiringSoon: async (filters: ReportFilter): Promise<ExpiringSoonReportRow[]> => {
        const response = await api.get<APIResponse<ExpiringSoonReportRow[]>>('/reports/expiring-soon', { params: filters });
        return response.data.data || [];
    },
};
