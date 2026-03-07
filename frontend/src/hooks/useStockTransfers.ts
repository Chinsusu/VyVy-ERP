import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockTransfersAPI } from '../api/stockTransfers';
import type { StockTransferFilters, CreateStockTransferInput } from '../types/stockTransfer';

const TRANSFER_KEYS = {
    all: ['stockTransfers'] as const,
    lists: () => [...TRANSFER_KEYS.all, 'list'] as const,
    list: (filters: StockTransferFilters) => [...TRANSFER_KEYS.lists(), filters] as const,
    details: () => [...TRANSFER_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...TRANSFER_KEYS.details(), id] as const,
};

export function useStockTransfers(filters: StockTransferFilters = {}) {
    return useQuery({
        queryKey: TRANSFER_KEYS.list(filters),
        queryFn: () => stockTransfersAPI.getTransfers(filters),
    });
}

export function useStockTransfer(id: number) {
    return useQuery({
        queryKey: TRANSFER_KEYS.detail(id),
        queryFn: () => stockTransfersAPI.getTransferById(id),
        enabled: !!id,
    });
}

export function useCreateStockTransfer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateStockTransferInput) => stockTransfersAPI.createTransfer(input),
        onSuccess: () => qc.invalidateQueries({ queryKey: TRANSFER_KEYS.lists() }),
    });
}

export function usePostStockTransfer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => stockTransfersAPI.postTransfer(id),
        onSuccess: (_data, id) => {
            qc.invalidateQueries({ queryKey: TRANSFER_KEYS.detail(id) });
            qc.invalidateQueries({ queryKey: TRANSFER_KEYS.lists() });
        },
    });
}

export function useCancelStockTransfer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => stockTransfersAPI.cancelTransfer(id),
        onSuccess: (_data, id) => {
            qc.invalidateQueries({ queryKey: TRANSFER_KEYS.detail(id) });
            qc.invalidateQueries({ queryKey: TRANSFER_KEYS.lists() });
        },
    });
}
