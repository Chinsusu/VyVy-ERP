import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { grnsAPI } from '../api/grns';
import type {
    CreateGRNInput,
    UpdateGRNQCInput,
    GRNFilters,
} from '../types/grn';

// Query key factory
export const grnKeys = {
    all: ['grns'] as const,
    lists: () => [...grnKeys.all, 'list'] as const,
    list: (filters?: GRNFilters) => [...grnKeys.lists(), filters] as const,
    details: () => [...grnKeys.all, 'detail'] as const,
    detail: (id: number) => [...grnKeys.details(), id] as const,
};

// Query hooks
export const useGrns = (filters?: GRNFilters) => {
    return useQuery({
        queryKey: grnKeys.list(filters),
        queryFn: () => grnsAPI.getGRNs(filters),
    });
};

export const useGrn = (id: number) => {
    return useQuery({
        queryKey: grnKeys.detail(id),
        queryFn: () => grnsAPI.getGRNById(id),
        enabled: !!id,
    });
};

// Mutation hooks
export const useCreateGRN = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateGRNInput) => grnsAPI.createGRN(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: grnKeys.lists() });
        },
    });
};

export const useUpdateGRNQC = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdateGRNQCInput }) =>
            grnsAPI.updateQC(id, input),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: grnKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: grnKeys.lists() });
        },
    });
};

export const usePostGRN = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => grnsAPI.postGRN(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: grnKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: grnKeys.lists() });
        },
    });
};
