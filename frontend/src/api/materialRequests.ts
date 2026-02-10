import axios from 'axios';
import type {
    MaterialRequest,
    CreateMaterialRequestInput,
    UpdateMaterialRequestInput,
    MaterialRequestFilters,
    MaterialRequestListResponse,
} from '../types/materialRequest';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const materialRequestsAPI = {
    // Get all material requests with optional filters
    getMaterialRequests: async (filters?: MaterialRequestFilters): Promise<MaterialRequestListResponse> => {
        const response = await axios.get(`${API_BASE_URL}/material-requests`, { params: filters });
        return response.data;
    },

    // Get material request by ID
    getMaterialRequestById: async (id: number): Promise<MaterialRequest> => {
        const response = await axios.get(`${API_BASE_URL}/material-requests/${id}`);
        return response.data.data;
    },

    // Create new material request
    createMaterialRequest: async (input: CreateMaterialRequestInput): Promise<MaterialRequest> => {
        const response = await axios.post(`${API_BASE_URL}/material-requests`, input, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },

    // Update material request (only draft)
    updateMaterialRequest: async (id: number, input: UpdateMaterialRequestInput): Promise<MaterialRequest> => {
        const response = await axios.put(`${API_BASE_URL}/material-requests/${id}`, input, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },

    // Delete material request (only draft)
    deleteMaterialRequest: async (id: number): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/material-requests/${id}`, {
            headers: getAuthHeader(),
        });
    },

    // Approve material request (draft → approved)
    approveMaterialRequest: async (id: number): Promise<MaterialRequest> => {
        const response = await axios.post(`${API_BASE_URL}/material-requests/${id}/approve`, {}, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },

    // Cancel material request
    cancelMaterialRequest: async (id: number): Promise<MaterialRequest> => {
        const response = await axios.post(`${API_BASE_URL}/material-requests/${id}/cancel`, {}, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },
};
