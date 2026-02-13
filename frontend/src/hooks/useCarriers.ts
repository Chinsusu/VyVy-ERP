import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carriersAPI } from '../api/carriers';
import type { CarrierFilter, CreateCarrierRequest, UpdateCarrierRequest } from '../types/carrier';

export function useCarriers(filter?: CarrierFilter) {
    return useQuery({
        queryKey: ['carriers', filter],
        queryFn: () => carriersAPI.list(filter),
    });
}

export function useCarrier(id: number) {
    return useQuery({
        queryKey: ['carriers', id],
        queryFn: () => carriersAPI.getById(id),
        enabled: !!id,
    });
}

export function useCreateCarrier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCarrierRequest) => carriersAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carriers'] });
        },
    });
}

export function useUpdateCarrier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCarrierRequest }) => carriersAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carriers'] });
        },
    });
}

export function useDeleteCarrier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => carriersAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carriers'] });
        },
    });
}
