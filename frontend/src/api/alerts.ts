import api from '../lib/axios';
import type { AlertSummary, AlertItem } from '../types/alert';

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export const alertsApi = {
    getSummary: async (): Promise<AlertSummary> => {
        const { data } = await api.get<ApiResponse<AlertSummary>>('/alerts/summary');
        return data.data;
    },

    getLowStock: async (): Promise<AlertItem[]> => {
        const { data } = await api.get<ApiResponse<AlertItem[]>>('/alerts/low-stock');
        return data.data;
    },

    getExpiringSoon: async (days = 30): Promise<AlertItem[]> => {
        const { data } = await api.get<ApiResponse<AlertItem[]>>(`/alerts/expiring-soon?days=${days}`);
        return data.data;
    },
};
