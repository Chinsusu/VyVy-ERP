import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const useStockBalance = (filters: { item_id?: number; warehouse_id?: number; item_type?: string }) => {
    return useQuery({
        queryKey: ['stock-balance', filters],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE_URL}/inventory/balance`, { params: filters });
            return response.data.data;
        },
        enabled: !!filters.item_id && !!filters.warehouse_id,
    });
};
