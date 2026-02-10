import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersAPI } from '../api/purchaseOrders';
import type {
    CreatePurchaseOrderInput,
    UpdatePurchaseOrderInput,
    PurchaseOrderFilters,
} from '../types/purchaseOrder';

// Query key factory
export const purchaseOrderKeys = {
    all: ['purchase-orders'] as const,
    lists: () => [...purchaseOrderKeys.all, 'list'] as const,
    list: (filters?: PurchaseOrderFilters) => [...purchaseOrderKeys.lists(), filters] as const,
    details: () => [...purchaseOrderKeys.all, 'detail'] as const,
    detail: (id: number) => [...purchaseOrderKeys.details(), id] as const,
};

// Query hooks
export const usePurchaseOrders = (filters?: PurchaseOrderFilters) => {
    return useQuery({
        queryKey: purchaseOrderKeys.list(filters),
        queryFn: () => purchaseOrdersAPI.getPurchaseOrders(filters),
    });
};

export const usePurchaseOrder = (id: number) => {
    return useQuery({
        queryKey: purchaseOrderKeys.detail(id),
        queryFn: () => purchaseOrdersAPI.getPurchaseOrderById(id),
        enabled: !!id,
    });
};

// Mutation hooks
export const useCreatePurchaseOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreatePurchaseOrderInput) => purchaseOrdersAPI.createPurchaseOrder(input),
        onSuccess: () => {
            // Invalidate all list queries
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        },
    });
};

export const useUpdatePurchaseOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdatePurchaseOrderInput }) =>
            purchaseOrdersAPI.updatePurchaseOrder(id, input),
        onSuccess: (_: any, variables: { id: number; input: UpdatePurchaseOrderInput }) => {
            // Invalidate specific detail and all lists
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        },
    });
};

export const useDeletePurchaseOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => purchaseOrdersAPI.deletePurchaseOrder(id),
        onSuccess: () => {
            // Invalidate all list queries
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        },
    });
};

export const useApprovePurchaseOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => purchaseOrdersAPI.approvePurchaseOrder(id),
        onSuccess: (_: any, id: number) => {
            // Invalidate specific detail and all lists
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        },
    });
};

export const useCancelPurchaseOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => purchaseOrdersAPI.cancelPurchaseOrder(id),
        onSuccess: (_: any, id: number) => {
            // Invalidate specific detail and all lists
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        },
    });
};
