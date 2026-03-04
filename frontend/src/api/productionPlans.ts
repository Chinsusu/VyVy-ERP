import axios from '../lib/axios';
import type {
    ProductionPlan,
    CreateProductionPlanInput,
    UpdateProductionPlanInput,
    ProductionPlanFilters,
    ProductionPlanListResponse,
} from '../types/productionPlan';

export const productionPlansAPI = {
    // Get all material requests with optional filters
    getProductionPlans: async (filters?: ProductionPlanFilters): Promise<ProductionPlanListResponse> => {
        const response = await axios.get('/production-plans', { params: filters });
        return response.data;
    },

    // Get material request by ID
    getProductionPlanById: async (id: number): Promise<ProductionPlan> => {
        const response = await axios.get(`/production-plans/${id}`);
        return response.data.data;
    },

    // Create new material request
    createProductionPlan: async (input: CreateProductionPlanInput): Promise<ProductionPlan> => {
        const response = await axios.post('/production-plans', input);
        return response.data.data;
    },

    // Update material request (only draft)
    updateProductionPlan: async (id: number, input: UpdateProductionPlanInput): Promise<ProductionPlan> => {
        const response = await axios.put(`/production-plans/${id}`, input);
        return response.data.data;
    },

    // Delete material request (only draft)
    deleteProductionPlan: async (id: number): Promise<void> => {
        await axios.delete(`/production-plans/${id}`);
    },

    // Approve material request (draft → approved)
    approveProductionPlan: async (id: number): Promise<ProductionPlan> => {
        const response = await axios.post(`/production-plans/${id}/approve`, {});
        return response.data.data;
    },

    // Cancel material request
    cancelProductionPlan: async (id: number): Promise<ProductionPlan> => {
        const response = await axios.post(`/production-plans/${id}/cancel`, {});
        return response.data.data;
    },
};
