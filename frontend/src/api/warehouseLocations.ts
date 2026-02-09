import axios from 'axios';
import type {
    WarehouseLocation,
    CreateWarehouseLocationInput,
    UpdateWarehouseLocationInput,
    WarehouseLocationFilters,
    WarehouseLocationListResponse,
} from '../types/warehouseLocation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const warehouseLocationsAPI = {
    // Get all warehouse locations with optional filters
    getLocations: async (filters?: WarehouseLocationFilters): Promise<WarehouseLocationListResponse> => {
        const response = await axios.get(`${API_BASE_URL}/warehouse-locations`, { params: filters });
        return response.data;
    },

    // Get a single location by ID
    getLocationById: async (id: number): Promise<WarehouseLocation> => {
        const response = await axios.get(`${API_BASE_URL}/warehouse-locations/${id}`);
        return response.data.data;
    },

    // Create a new warehouse location
    createLocation: async (input: CreateWarehouseLocationInput): Promise<WarehouseLocation> => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/warehouse-locations`, input, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    },

    // Update an existing warehouse location
    updateLocation: async (id: number, input: UpdateWarehouseLocationInput): Promise<WarehouseLocation> => {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE_URL}/warehouse-locations/${id}`, input, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    },

    // Delete a warehouse location
    deleteLocation: async (id: number): Promise<void> => {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/warehouse-locations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};
