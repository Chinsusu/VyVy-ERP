import axios from '../lib/axios';
import type {
    MaterialRequest,
    CreateMaterialRequestInput,
    UpdateMaterialRequestInput,
    MaterialRequestFilters,
    MaterialRequestListResponse,
} from '../types/materialRequest';

export const materialRequestsAPI = {
    // Get all material requests with optional filters
    getMaterialRequests: async (filters?: MaterialRequestFilters): Promise<MaterialRequestListResponse> => {
        const response = await axios.get('/material-requests', { params: filters });
        return response.data;
    },

    // Get material request by ID
    getMaterialRequestById: async (id: number): Promise<MaterialRequest> => {
        const response = await axios.get(`/material-requests/${id}`);
        return response.data.data;
    },

    // Create new material request
    createMaterialRequest: async (input: CreateMaterialRequestInput): Promise<MaterialRequest> => {
        const response = await axios.post('/material-requests', input);
        return response.data.data;
    },

    // Update material request (only draft)
    updateMaterialRequest: async (id: number, input: UpdateMaterialRequestInput): Promise<MaterialRequest> => {
        const response = await axios.put(`/material-requests/${id}`, input);
        return response.data.data;
    },

    // Delete material request (only draft)
    deleteMaterialRequest: async (id: number): Promise<void> => {
        await axios.delete(`/material-requests/${id}`);
    },

    // Approve material request (draft → approved)
    approveMaterialRequest: async (id: number): Promise<MaterialRequest> => {
        const response = await axios.post(`/material-requests/${id}/approve`, {});
        return response.data.data;
    },

    // Cancel material request
    cancelMaterialRequest: async (id: number): Promise<MaterialRequest> => {
        const response = await axios.post(`/material-requests/${id}/cancel`, {});
        return response.data.data;
    },
};
