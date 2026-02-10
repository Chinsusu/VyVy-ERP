import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryApi from '../api/inventory';
import type { StockAdjustmentFilters, StockTransferFilters, CreateStockAdjustmentRequest, CreateStockTransferRequest } from '../types/inventory';

export const inventoryKeys = {
    all: ['inventory'] as const,
    adjustments: () => [...inventoryKeys.all, 'adjustments'] as const,
    adjustmentList: (filters?: StockAdjustmentFilters) => [...inventoryKeys.adjustments(), 'list', filters] as const,
    adjustmentDetails: (id: number) => [...inventoryKeys.adjustments(), 'detail', id] as const,
    transfers: () => [...inventoryKeys.all, 'transfers'] as const,
    transferList: (filters?: StockTransferFilters) => [...inventoryKeys.transfers(), 'list', filters] as const,
    transferDetails: (id: number) => [...inventoryKeys.transfers(), 'detail', id] as const,
};

// --- Stock Adjustments ---

export const useAdjustments = (filters?: StockAdjustmentFilters) => {
    return useQuery({
        queryKey: inventoryKeys.adjustmentList(filters),
        queryFn: () => inventoryApi.getAdjustments(filters),
    });
};

export const useAdjustment = (id: number) => {
    return useQuery({
        queryKey: inventoryKeys.adjustmentDetails(id),
        queryFn: () => inventoryApi.getAdjustment(id),
        enabled: !!id,
    });
};

export const useCreateAdjustment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateStockAdjustmentRequest) => inventoryApi.createAdjustment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.adjustments() });
        },
    });
};

export const usePostAdjustment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => inventoryApi.postAdjustment(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.adjustments() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.adjustmentDetails(data.id) });
        },
    });
};

export const useCancelAdjustment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => inventoryApi.cancelAdjustment(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.adjustments() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.adjustmentDetails(data.id) });
        },
    });
};

// --- Stock Transfers ---

export const useTransfers = (filters?: StockTransferFilters) => {
    return useQuery({
        queryKey: inventoryKeys.transferList(filters),
        queryFn: () => inventoryApi.getTransfers(filters),
    });
};

export const useTransfer = (id: number) => {
    return useQuery({
        queryKey: inventoryKeys.transferDetails(id),
        queryFn: () => inventoryApi.getTransfer(id),
        enabled: !!id,
    });
};

export const useCreateTransfer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateStockTransferRequest) => inventoryApi.createTransfer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers() });
        },
    });
};

export const usePostTransfer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => inventoryApi.postTransfer(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transferDetails(data.id) });
        },
    });
};

export const useCancelTransfer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => inventoryApi.cancelTransfer(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.transferDetails(data.id) });
        },
    });
};
