import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { finishedProductsAPI } from '../api/finishedProducts';
import type {
    CreateFinishedProductInput,
    UpdateFinishedProductInput,
    FinishedProductFilters,
} from '../types/finishedProduct';

// Query keys factory
export const finishedProductKeys = {
    all: ['finished-products'] as const,
    lists: () => [...finishedProductKeys.all, 'list'] as const,
    list: (filters?: FinishedProductFilters) => [...finishedProductKeys.lists(), filters] as const,
    details: () => [...finishedProductKeys.all, 'detail'] as const,
    detail: (id: number) => [...finishedProductKeys.details(), id] as const,
};

// Fetch finished products with filters
export function useFinishedProducts(filters?: FinishedProductFilters) {
    return useQuery({
        queryKey: finishedProductKeys.list(filters),
        queryFn: () => finishedProductsAPI.getFinishedProducts(filters),
    });
}

// Fetch single finished product by ID
export function useFinishedProduct(id: number) {
    return useQuery({
        queryKey: finishedProductKeys.detail(id),
        queryFn: () => finishedProductsAPI.getFinishedProductById(id),
        enabled: !!id,
    });
}

// Create finished product mutation
export function useCreateFinishedProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateFinishedProductInput) => finishedProductsAPI.createFinishedProduct(input),
        onSuccess: () => {
            // Invalidate finished product lists to trigger refetch
            queryClient.invalidateQueries({ queryKey: finishedProductKeys.lists() });
        },
    });
}

// Update finished product mutation
export function useUpdateFinishedProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdateFinishedProductInput }) =>
            finishedProductsAPI.updateFinishedProduct(id, input),
        onSuccess: (_, variables) => {
            // Invalidate lists and the specific finished product detail
            queryClient.invalidateQueries({ queryKey: finishedProductKeys.lists() });
            queryClient.invalidateQueries({ queryKey: finishedProductKeys.detail(variables.id) });
        },
    });
}

// Delete finished product mutation
export function useDeleteFinishedProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => finishedProductsAPI.deleteFinishedProduct(id),
        onSuccess: () => {
            // Invalidate finished product lists
            queryClient.invalidateQueries({ queryKey: finishedProductKeys.lists() });
        },
    });
}
