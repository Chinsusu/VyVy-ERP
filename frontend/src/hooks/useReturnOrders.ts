import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { returnOrdersApi } from '../api/returnOrders';
import type { CreateReturnOrderRequest, UpdateReturnOrderRequest, ReturnOrderFilter, InspectItemRequest } from '../types/returnOrder';

export function useReturnOrders(filter: ReturnOrderFilter = {}) {
    return useQuery({
        queryKey: ['return-orders', filter],
        queryFn: () => returnOrdersApi.list(filter),
    });
}

export function useReturnOrder(id: number) {
    return useQuery({
        queryKey: ['return-orders', id],
        queryFn: () => returnOrdersApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateReturnOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req: CreateReturnOrderRequest) => returnOrdersApi.create(req),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-orders'] }),
    });
}

export function useUpdateReturnOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateReturnOrderRequest }) => returnOrdersApi.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-orders'] }),
    });
}

export function useDeleteReturnOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => returnOrdersApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-orders'] }),
    });
}

export function useApproveReturnOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => returnOrdersApi.approve(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-orders'] }),
    });
}

export function useReceiveReturnOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => returnOrdersApi.receive(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-orders'] }),
    });
}

export function useInspectReturnItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ roId, itemId, data }: { roId: number; itemId: number; data: InspectItemRequest }) =>
            returnOrdersApi.inspectItem(roId, itemId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-orders'] }),
    });
}

export function useCompleteReturnOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => returnOrdersApi.complete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-orders'] }),
    });
}

export function useCancelReturnOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => returnOrdersApi.cancel(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-orders'] }),
    });
}
