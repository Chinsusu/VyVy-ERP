import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialsAPI } from '../api/materials';
import type {
    Material,
    CreateMaterialInput,
    UpdateMaterialInput,
    MaterialFilters,
} from '../types/material';

// Query keys
export const materialKeys = {
    all: ['materials'] as const,
    lists: () => [...materialKeys.all, 'list'] as const,
    list: (filters: MaterialFilters) => [...materialKeys.lists(), filters] as const,
    details: () => [...materialKeys.all, 'detail'] as const,
    detail: (id: number) => [...materialKeys.details(), id] as const,
};

/**
 * Hook to fetch materials list with filters
 */
export function useMaterials(filters?: MaterialFilters) {
    return useQuery({
        queryKey: materialKeys.list(filters || {}),
        queryFn: () => materialsAPI.getMaterials(filters),
    });
}

/**
 * Hook to fetch a single material by ID
 */
export function useMaterial(id: number) {
    return useQuery({
        queryKey: materialKeys.detail(id),
        queryFn: () => materialsAPI.getMaterialById(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a new material
 */
export function useCreateMaterial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateMaterialInput) => materialsAPI.createMaterial(input),
        onSuccess: () => {
            // Invalidate all material lists
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
        },
    });
}

/**
 * Hook to update a material
 */
export function useUpdateMaterial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdateMaterialInput }) =>
            materialsAPI.updateMaterial(id, input),
        onSuccess: (_, variables) => {
            // Invalidate all material lists and the specific detail
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
            queryClient.invalidateQueries({ queryKey: materialKeys.detail(variables.id) });
        },
    });
}

/**
 * Hook to delete a material
 */
export function useDeleteMaterial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => materialsAPI.deleteMaterial(id),
        onSuccess: () => {
            // Invalidate all material lists
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
        },
    });
}
