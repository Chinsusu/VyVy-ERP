import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersAPI } from '../api/suppliers';
import type {
    Supplier,
    CreateSupplierInput,
    UpdateSupplierInput,
    SupplierFilters,
} from '../types/supplier';

// Query keys
export const supplierKeys = {
    all: ['suppliers'] as const,
    lists: () => [...supplierKeys.all, 'list'] as const,
    list: (filters: SupplierFilters) => [...supplierKeys.lists(), filters] as const,
    details: () => [...supplierKeys.all, 'detail'] as const,
    detail: (id: number) => [...supplierKeys.details(), id] as const,
};

/**
 * Hook to fetch suppliers list with filters
 */
export function useSuppliers(filters?: SupplierFilters) {
    return useQuery({
        queryKey: supplierKeys.list(filters || {}),
        queryFn: () => suppliersAPI.getSuppliers(filters),
    });
}

/**
 * Hook to fetch a single supplier by ID
 */
export function useSupplier(id: number) {
    return useQuery({
        queryKey: supplierKeys.detail(id),
        queryFn: () => suppliersAPI.getSupplierById(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a new supplier
 */
export function useCreateSupplier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateSupplierInput) => suppliersAPI.createSupplier(input),
        onSuccess: () => {
            // Invalidate all supplier lists
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
        },
    });
}

/**
 * Hook to update a supplier
 */
export function useUpdateSupplier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdateSupplierInput }) =>
            suppliersAPI.updateSupplier(id, input),
        onSuccess: (_, variables) => {
            // Invalidate all supplier lists and the specific detail
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
            queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) });
        },
    });
}

/**
 * Hook to delete a supplier
 */
export function useDeleteSupplier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => suppliersAPI.deleteSupplier(id),
        onSuccess: () => {
            // Invalidate all supplier lists
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
        },
    });
}
