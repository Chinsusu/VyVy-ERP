import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import type { FinishedProductReceipt } from '../types/finishedProductReceipt';

export function useRelatedFPRNs(planId: number) {
    return useQuery<FinishedProductReceipt[]>({
        queryKey: ['plan-related-fprns', planId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/production-plans/${planId}/finished-product-receipts`);
            return res.data?.data ?? [];
        },
        enabled: planId > 0,
    });
}
