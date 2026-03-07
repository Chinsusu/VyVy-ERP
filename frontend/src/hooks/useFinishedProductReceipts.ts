import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { finishedProductReceiptsAPI } from '../api/finishedProductReceipts';
import type { CreateFPRNInput, FPRNFilters } from '../types/finishedProductReceipt';

const QUERY_KEY = 'finishedProductReceipts';

export function useFinishedProductReceipts(filters: FPRNFilters = {}) {
    return useQuery({
        queryKey: [QUERY_KEY, filters],
        queryFn: () => finishedProductReceiptsAPI.getReceipts(filters),
    });
}

export function useFinishedProductReceipt(id: number) {
    return useQuery({
        queryKey: [QUERY_KEY, id],
        queryFn: () => finishedProductReceiptsAPI.getReceiptById(id),
        enabled: id > 0,
        select: (res) => res.data.data,
    });
}

export function useCreateFinishedProductReceipt() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateFPRNInput) => finishedProductReceiptsAPI.createReceipt(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    });
}

export function usePostFinishedProductReceipt() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => finishedProductReceiptsAPI.postReceipt(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    });
}

export function useCancelFinishedProductReceipt() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => finishedProductReceiptsAPI.cancelReceipt(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    });
}
