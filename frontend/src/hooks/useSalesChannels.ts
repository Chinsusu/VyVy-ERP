import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesChannelsAPI } from '../api/salesChannels';
import type {
    CreateSalesChannelInput,
    UpdateSalesChannelInput,
    SalesChannelFilters,
} from '../types/salesChannel';

// Query keys
export const salesChannelKeys = {
    all: ['salesChannels'] as const,
    lists: () => [...salesChannelKeys.all, 'list'] as const,
    list: (filters: SalesChannelFilters) => [...salesChannelKeys.lists(), filters] as const,
    details: () => [...salesChannelKeys.all, 'detail'] as const,
    detail: (id: number) => [...salesChannelKeys.details(), id] as const,
};

/**
 * Hook to fetch sales channels list with filters
 */
export function useSalesChannels(filters?: SalesChannelFilters) {
    return useQuery({
        queryKey: salesChannelKeys.list(filters || {}),
        queryFn: () => salesChannelsAPI.getSalesChannels(filters),
    });
}

/**
 * Hook to fetch a single sales channel by ID
 */
export function useSalesChannel(id: number) {
    return useQuery({
        queryKey: salesChannelKeys.detail(id),
        queryFn: () => salesChannelsAPI.getSalesChannelById(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a new sales channel
 */
export function useCreateSalesChannel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateSalesChannelInput) => salesChannelsAPI.createSalesChannel(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesChannelKeys.lists() });
        },
    });
}

/**
 * Hook to update a sales channel
 */
export function useUpdateSalesChannel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdateSalesChannelInput }) =>
            salesChannelsAPI.updateSalesChannel(id, input),
        onSuccess: (_: any, variables: { id: number; input: UpdateSalesChannelInput }) => {
            queryClient.invalidateQueries({ queryKey: salesChannelKeys.lists() });
            queryClient.invalidateQueries({ queryKey: salesChannelKeys.detail(variables.id) });
        },
    });
}

/**
 * Hook to delete a sales channel
 */
export function useDeleteSalesChannel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => salesChannelsAPI.deleteSalesChannel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: salesChannelKeys.lists() });
        },
    });
}
