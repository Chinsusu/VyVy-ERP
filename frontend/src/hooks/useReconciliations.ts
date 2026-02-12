import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reconciliationsAPI } from '../api/reconciliations';
import { ReconciliationFilter, CreateReconciliationRequest, AddReconciliationItemInput } from '../types/reconciliation';

export function useReconciliations(filter?: ReconciliationFilter) {
    return useQuery({
        queryKey: ['reconciliations', filter],
        queryFn: () => reconciliationsAPI.list(filter),
    });
}

export function useReconciliation(id: number) {
    return useQuery({
        queryKey: ['reconciliations', id],
        queryFn: () => reconciliationsAPI.getById(id),
        enabled: !!id,
    });
}

export function useCreateReconciliation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReconciliationRequest) => reconciliationsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
        },
    });
}

export function useAddReconciliationItems() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, items }: { id: number; items: AddReconciliationItemInput[] }) => reconciliationsAPI.addItems(id, items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
        },
    });
}

export function useConfirmReconciliation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => reconciliationsAPI.confirm(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
        },
    });
}

export function useDeleteReconciliation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => reconciliationsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
        },
    });
}
