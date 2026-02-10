import axios from 'axios';
import type {
    FinishedProduct,
    CreateFinishedProductInput,
    UpdateFinishedProductInput,
    FinishedProductFilters,
    FinishedProductListResponse,
} from '../types/finishedProduct';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const finishedProductsAPI = {
    // Get all finished products with optional filters
    getFinishedProducts: async (filters?: FinishedProductFilters): Promise<FinishedProductListResponse> => {
        const response = await axios.get(`${API_BASE_URL}/finished-products`, { params: filters });
        return response.data;
    },

    // Get a single finished product by ID
    getFinishedProductById: async (id: number): Promise<FinishedProduct> => {
        const response = await axios.get(`${API_BASE_URL}/finished-products/${id}`);
        return response.data.data;
    },

    // Create a new finished product
    createFinishedProduct: async (input: CreateFinishedProductInput): Promise<FinishedProduct> => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/finished-products`, input, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    },

    // Update an existing finished product
    updateFinishedProduct: async (id: number, input: UpdateFinishedProductInput): Promise<FinishedProduct> => {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE_URL}/finished-products/${id}`, input, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    },

    // Delete a finished product
    deleteFinishedProduct: async (id: number): Promise<void> => {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/finished-products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};
