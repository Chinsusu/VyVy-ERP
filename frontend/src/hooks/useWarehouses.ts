import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehousesAPI } from '../api/warehouses';
import type {
    CreateWarehouseInput,
    UpdateWarehouseInput,
    WarehouseFilters,
} from '../types/warehouse';

// Query keys factory
export const warehouseKeys = {
    all: ['warehouses'] as const,
    lists: () => [...warehouseKeys.all, 'list'] as const,
    list: (filters?: WarehouseFilters) => [...warehouseKeys.lists(), filters] as const,
    details: () => [...warehouseKeys.all, 'detail'] as const,
    detail: (id: number) => [...warehouseKeys.details(), id] as const,
    locations: (id: number) => [...warehouseKeys.detail(id), 'locations'] as const,
};

// Fetch warehouses with filters
export function useWarehouses(filters?: WarehouseFilters) {
    return useQuery({
        queryKey: warehouseKeys.list(filters),
        queryFn: () => warehousesAPI.getWarehouses(filters),
    });
}

// Fetch single warehouse by ID
export function useWarehouse(id: number) {
    return useQuery({
        queryKey: warehouseKeys.detail(id),
        queryFn: () => warehousesAPI.getWarehouseById(id),
        enabled: !!id,
    });
}

// Fetch warehouse locations
export function useWarehouseLocations(warehouseId: number) {
    return useQuery({
        queryKey: warehouseKeys.locations(warehouseId),
        queryFn: () => warehousesAPI.getWarehouseLocations(warehouseId),
        enabled: !!warehouseId,
    });
}

// Create warehouse mutation
export function useCreateWarehouse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateWarehouseInput) => warehousesAPI.createWarehouse(input),
        onSuccess: () => {
            // Invalidate warehouse lists to trigger refetch
            queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
        },
    });
}

// Update warehouse mutation
export function useUpdateWarehouse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdateWarehouseInput }) =>
            warehousesAPI.updateWarehouse(id, input),
        onSuccess: (_: any, variables: { id: number; input: UpdateWarehouseInput }) => {
            // Invalidate lists and the specific warehouse detail
            queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
            queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(variables.id) });
        },
    });
}

// Delete warehouse mutation
export function useDeleteWarehouse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => warehousesAPI.deleteWarehouse(id),
        onSuccess: () => {
            // Invalidate warehouse lists
            queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
        },
    });
}
