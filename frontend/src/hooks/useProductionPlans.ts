import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionPlansAPI } from '../api/productionPlans';
import type {
    CreateProductionPlanInput,
    UpdateProductionPlanInput,
    ProductionPlanFilters,
} from '../types/productionPlan';

// Query key factory
export const productionPlanKeys = {
    all: ['production-plans'] as const,
    lists: () => [...productionPlanKeys.all, 'list'] as const,
    list: (filters?: ProductionPlanFilters) => [...productionPlanKeys.lists(), filters] as const,
    details: () => [...productionPlanKeys.all, 'detail'] as const,
    detail: (id: number) => [...productionPlanKeys.details(), id] as const,
};

// Query hooks
export const useProductionPlans = (filters?: ProductionPlanFilters) => {
    return useQuery({
        queryKey: productionPlanKeys.list(filters),
        queryFn: () => productionPlansAPI.getProductionPlans(filters),
    });
};

export const useProductionPlan = (id: number) => {
    return useQuery({
        queryKey: productionPlanKeys.detail(id),
        queryFn: () => productionPlansAPI.getProductionPlanById(id),
        enabled: !!id,
    });
};

// Mutation hooks
export const useCreateProductionPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateProductionPlanInput) => productionPlansAPI.createProductionPlan(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productionPlanKeys.lists() });
        },
    });
};

export const useUpdateProductionPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdateProductionPlanInput }) =>
            productionPlansAPI.updateProductionPlan(id, input),
        onSuccess: (_: any, variables: { id: number; input: UpdateProductionPlanInput }) => {
            queryClient.invalidateQueries({ queryKey: productionPlanKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: productionPlanKeys.lists() });
        },
    });
};

export const useDeleteProductionPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => productionPlansAPI.deleteProductionPlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productionPlanKeys.lists() });
        },
    });
};

export const useApproveProductionPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => productionPlansAPI.approveProductionPlan(id),
        onSuccess: (_: any, id: number) => {
            queryClient.invalidateQueries({ queryKey: productionPlanKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: productionPlanKeys.lists() });
        },
    });
};

export const useCancelProductionPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => productionPlansAPI.cancelProductionPlan(id),
        onSuccess: (_: any, id: number) => {
            queryClient.invalidateQueries({ queryKey: productionPlanKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: productionPlanKeys.lists() });
        },
    });
};
