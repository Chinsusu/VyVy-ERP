import axios from 'axios';
import type {
    Warehouse,
    CreateWarehouseInput,
    UpdateWarehouseInput,
    WarehouseFilters,
    WarehouseListResponse,
} from '../types/warehouse';
import type { WarehouseLocation } from '../types/warehouseLocation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const warehousesAPI = {
    // Get all warehouses with optional filters
    getWarehouses: async (filters?: WarehouseFilters): Promise<WarehouseListResponse> => {
        const response = await axios.get(`${API_BASE_URL}/warehouses`, { params: filters });
        return response.data;
    },

    // Get a single warehouse by ID
    getWarehouseById: async (id: number): Promise<Warehouse> => {
        const response = await axios.get(`${API_BASE_URL}/warehouses/${id}`);
        return response.data.data;
    },

    // Get all locations for a warehouse
    getWarehouseLocations: async (id: number): Promise<WarehouseLocation[]> => {
        const response = await axios.get(`${API_BASE_URL}/warehouses/${id}/locations`);
        return response.data.data;
    },

    // Create a new warehouse
    createWarehouse: async (input: CreateWarehouseInput): Promise<Warehouse> => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/warehouses`, input, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    },

    // Update an existing warehouse
    updateWarehouse: async (id: number, input: UpdateWarehouseInput): Promise<Warehouse> => {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE_URL}/warehouses/${id}`, input, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    },

    // Delete a warehouse
    deleteWarehouse: async (id: number): Promise<void> => {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/warehouses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};
