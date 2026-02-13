import axios from '../lib/axios';
import type {
    FinishedProduct,
    CreateFinishedProductInput,
    UpdateFinishedProductInput,
    FinishedProductFilters,
    FinishedProductListResponse,
} from '../types/finishedProduct';

export const finishedProductsAPI = {
    // Get all finished products with optional filters
    getFinishedProducts: async (filters?: FinishedProductFilters): Promise<FinishedProductListResponse> => {
        const response = await axios.get('/finished-products', { params: filters });
        return response.data;
    },

    // Get a single finished product by ID
    getFinishedProductById: async (id: number): Promise<FinishedProduct> => {
        const response = await axios.get(`/finished-products/${id}`);
        return response.data.data;
    },

    // Create a new finished product
    createFinishedProduct: async (input: CreateFinishedProductInput): Promise<FinishedProduct> => {
        const response = await axios.post('/finished-products', input);
        return response.data.data;
    },

    // Update an existing finished product
    updateFinishedProduct: async (id: number, input: UpdateFinishedProductInput): Promise<FinishedProduct> => {
        const response = await axios.put(`/finished-products/${id}`, input);
        return response.data.data;
    },

    // Delete a finished product
    deleteFinishedProduct: async (id: number): Promise<void> => {
        await axios.delete(`/finished-products/${id}`);
    },
};
