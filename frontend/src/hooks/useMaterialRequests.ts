import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialRequestsAPI } from '../api/materialRequests';
import type {
    CreateMaterialRequestInput,
    UpdateMaterialRequestInput,
    MaterialRequestFilters,
} from '../types/materialRequest';

// Query key factory
export const materialRequestKeys = {
    all: ['material-requests'] as const,
    lists: () => [...materialRequestKeys.all, 'list'] as const,
    list: (filters?: MaterialRequestFilters) => [...materialRequestKeys.lists(), filters] as const,
    details: () => [...materialRequestKeys.all, 'detail'] as const,
    detail: (id: number) => [...materialRequestKeys.details(), id] as const,
};

// Query hooks
export const useMaterialRequests = (filters?: MaterialRequestFilters) => {
    return useQuery({
        queryKey: materialRequestKeys.list(filters),
        queryFn: () => materialRequestsAPI.getMaterialRequests(filters),
    });
};

export const useMaterialRequest = (id: number) => {
    return useQuery({
        queryKey: materialRequestKeys.detail(id),
        queryFn: () => materialRequestsAPI.getMaterialRequestById(id),
        enabled: !!id,
    });
};

// Mutation hooks
export const useCreateMaterialRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateMaterialRequestInput) => materialRequestsAPI.createMaterialRequest(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() });
        },
    });
};

export const useUpdateMaterialRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdateMaterialRequestInput }) =>
            materialRequestsAPI.updateMaterialRequest(id, input),
        onSuccess: (_: any, variables: { id: number; input: UpdateMaterialRequestInput }) => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() });
        },
    });
};

export const useDeleteMaterialRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => materialRequestsAPI.deleteMaterialRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() });
        },
    });
};

export const useApproveMaterialRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => materialRequestsAPI.approveMaterialRequest(id),
        onSuccess: (_: any, id: number) => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() });
        },
    });
};

export const useCancelMaterialRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => materialRequestsAPI.cancelMaterialRequest(id),
        onSuccess: (_: any, id: number) => {
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() });
        },
    });
};
