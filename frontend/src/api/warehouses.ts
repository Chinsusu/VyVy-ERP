import axios from '../lib/axios';
import type {
    Warehouse,
    CreateWarehouseInput,
    UpdateWarehouseInput,
    WarehouseFilters,
    WarehouseListResponse,
} from '../types/warehouse';
import type { WarehouseLocation } from '../types/warehouseLocation';

export const warehousesAPI = {
    // Get all warehouses with optional filters
    getWarehouses: async (filters?: WarehouseFilters): Promise<WarehouseListResponse> => {
        const response = await axios.get('/warehouses', { params: filters });
        return response.data;
    },

    // Get a single warehouse by ID
    getWarehouseById: async (id: number): Promise<Warehouse> => {
        const response = await axios.get(`/warehouses/${id}`);
        return response.data.data;
    },

    // Get all locations for a warehouse
    getWarehouseLocations: async (id: number): Promise<WarehouseLocation[]> => {
        const response = await axios.get(`/warehouses/${id}/locations`);
        return response.data.data;
    },

    // Create a new warehouse
    createWarehouse: async (input: CreateWarehouseInput): Promise<Warehouse> => {
        const response = await axios.post('/warehouses', input);
        return response.data.data;
    },

    // Update an existing warehouse
    updateWarehouse: async (id: number, input: UpdateWarehouseInput): Promise<Warehouse> => {
        const response = await axios.put(`/warehouses/${id}`, input);
        return response.data.data;
    },

    // Delete a warehouse
    deleteWarehouse: async (id: number): Promise<void> => {
        await axios.delete(`/warehouses/${id}`);
    },
};
