import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseLocationsAPI } from '../api/warehouseLocations';
import { warehouseKeys } from './useWarehouses';
import type {
    WarehouseLocation,
    CreateWarehouseLocationInput,
    UpdateWarehouseLocationInput,
    WarehouseLocationFilters,
} from '../types/warehouseLocation';

// Query keys factory
export const locationKeys = {
    all: ['warehouse-locations'] as const,
    lists: () => [...locationKeys.all, 'list'] as const,
    list: (filters?: WarehouseLocationFilters) => [...locationKeys.lists(), filters] as const,
    details: () => [...locationKeys.all, 'detail'] as const,
    detail: (id: number) => [...locationKeys.details(), id] as const,
};

// Fetch warehouse locations with filters
export function useWarehouseLocations(filters?: WarehouseLocationFilters) {
    return useQuery({
        queryKey: locationKeys.list(filters),
        queryFn: () => warehouseLocationsAPI.getLocations(filters),
    });
}

// Fetch single location by ID
export function useWarehouseLocation(id: number) {
    return useQuery({
        queryKey: locationKeys.detail(id),
        queryFn: () => warehouseLocationsAPI.getLocationById(id),
        enabled: !!id,
    });
}

// Create location mutation
export function useCreateLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateWarehouseLocationInput) =>
            warehouseLocationsAPI.createLocation(input),
        onSuccess: (_, variables) => {
            // Invalidate location lists
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            // Invalidate the specific warehouse's locations cache
            queryClient.invalidateQueries({
                queryKey: warehouseKeys.locations(variables.warehouse_id)
            });
            // Invalidate warehouse lists (to update locations count)
            queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
        },
    });
}

// Update location mutation
export function useUpdateLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdateWarehouseLocationInput }) =>
            warehouseLocationsAPI.updateLocation(id, input),
        onSuccess: (data, variables) => {
            // Invalidate location lists and the specific location detail
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: locationKeys.detail(variables.id) });

            // Invalidate warehouse locations if warehouse_id changed
            if (variables.input.warehouse_id) {
                queryClient.invalidateQueries({
                    queryKey: warehouseKeys.locations(variables.input.warehouse_id)
                });
            }

            // Invalidate the location's original warehouse locations
            if (data.warehouse_id) {
                queryClient.invalidateQueries({
                    queryKey: warehouseKeys.locations(data.warehouse_id)
                });
            }
        },
    });
}

// Delete location mutation
export function useDeleteLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => warehouseLocationsAPI.deleteLocation(id),
        onSuccess: () => {
            // Invalidate location lists
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            // Invalidate all warehouse locations caches
            queryClient.invalidateQueries({ queryKey: warehouseKeys.all });
        },
    });
}
