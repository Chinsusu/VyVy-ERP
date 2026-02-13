import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';

export const useStockBalance = (filters: { item_id?: number; warehouse_id?: number; item_type?: string }) => {
    return useQuery({
        queryKey: ['stock-balance', filters],
        queryFn: async () => {
            const response = await axios.get('/inventory/balance', { params: filters });
            return response.data.data;
        },
        enabled: !!filters.item_id && !!filters.warehouse_id,
    });
};
