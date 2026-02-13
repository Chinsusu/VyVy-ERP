import axios from '../lib/axios';
import type {
    WarehouseLocation,
    CreateWarehouseLocationInput,
    UpdateWarehouseLocationInput,
    WarehouseLocationFilters,
    WarehouseLocationListResponse,
} from '../types/warehouseLocation';

export const warehouseLocationsAPI = {
    // Get all warehouse locations with optional filters
    getLocations: async (filters?: WarehouseLocationFilters): Promise<WarehouseLocationListResponse> => {
        const response = await axios.get('/warehouse-locations', { params: filters });
        return response.data;
    },

    // Get a single location by ID
    getLocationById: async (id: number): Promise<WarehouseLocation> => {
        const response = await axios.get(`/warehouse-locations/${id}`);
        return response.data.data;
    },

    // Create a new warehouse location
    createLocation: async (input: CreateWarehouseLocationInput): Promise<WarehouseLocation> => {
        const response = await axios.post('/warehouse-locations', input);
        return response.data.data;
    },

    // Update an existing warehouse location
    updateLocation: async (id: number, input: UpdateWarehouseLocationInput): Promise<WarehouseLocation> => {
        const response = await axios.put(`/warehouse-locations/${id}`, input);
        return response.data.data;
    },

    // Delete a warehouse location
    deleteLocation: async (id: number): Promise<void> => {
        await axios.delete(`/warehouse-locations/${id}`);
    },
};
