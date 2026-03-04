import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import type { PurchaseOrder } from '../types/purchaseOrder';

export function useRelatedPOs(mrId: number) {
    return useQuery<PurchaseOrder[]>({
        queryKey: ['mr-related-pos', mrId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/material-requests/${mrId}/purchase-orders`);
            return res.data?.data ?? [];
        },
        enabled: mrId > 0,
    });
}
