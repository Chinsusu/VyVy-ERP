import axios from 'axios';
import type {
    GoodsReceiptNote,
    CreateGRNInput,
    UpdateGRNQCInput,
    GRNFilters,
    GRNListResponse,
} from '../types/grn';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const grnsAPI = {
    // Get all GRNs with optional filters
    getGRNs: async (filters?: GRNFilters): Promise<GRNListResponse> => {
        const response = await axios.get(`${API_BASE_URL}/grns`, {
            params: filters,
            headers: getAuthHeader(),
        });
        return response.data;
    },

    // Get GRN by ID
    getGRNById: async (id: number): Promise<GoodsReceiptNote> => {
        const response = await axios.get(`${API_BASE_URL}/grns/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },

    // Create new GRN from PO
    createGRN: async (input: CreateGRNInput): Promise<GoodsReceiptNote> => {
        const response = await axios.post(`${API_BASE_URL}/grns`, input, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },

    // Update QC status
    updateQC: async (id: number, input: UpdateGRNQCInput): Promise<GoodsReceiptNote> => {
        const response = await axios.post(`${API_BASE_URL}/grns/${id}/qc`, input, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },

    // Post GRN to inventory
    postGRN: async (id: number): Promise<GoodsReceiptNote> => {
        const response = await axios.post(`${API_BASE_URL}/grns/${id}/post`, {}, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },
};
