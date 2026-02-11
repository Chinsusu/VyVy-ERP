import api from '../lib/axios';
import type { DashboardStats } from '../types/dashboard';
import type { APIResponse } from '../types/auth';

export const dashboardApi = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.get<APIResponse<DashboardStats>>('/dashboard/stats');
        return response.data.data!;
    },
};
