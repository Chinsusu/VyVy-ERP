import api from '../lib/axios';
import type { StockMovementReportRow, InventoryValueReportRow, ReportFilter } from '../types/report';
import type { APIResponse } from '../types/auth';

export const reportApi = {
    getStockMovement: async (filters: ReportFilter): Promise<StockMovementReportRow[]> => {
        const response = await api.get<APIResponse<StockMovementReportRow[]>>('/reports/stock-movement', { params: filters });
        return response.data.data!;
    },

    getInventoryValue: async (filters: ReportFilter): Promise<InventoryValueReportRow[]> => {
        const response = await api.get<APIResponse<InventoryValueReportRow[]>>('/reports/inventory-value', { params: filters });
        return response.data.data!;
    },
};
