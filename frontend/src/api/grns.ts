import axios from '../lib/axios';
import type {
    GoodsReceiptNote,
    CreateGRNInput,
    UpdateGRNQCInput,
    GRNFilters,
    GRNListResponse,
} from '../types/grn';

export const grnsAPI = {
    // Get all GRNs with optional filters
    getGRNs: async (filters?: GRNFilters): Promise<GRNListResponse> => {
        const response = await axios.get('/grns', { params: filters });
        return response.data;
    },

    // Get GRN by ID
    getGRNById: async (id: number): Promise<GoodsReceiptNote> => {
        const response = await axios.get(`/grns/${id}`);
        return response.data.data;
    },

    // Create new GRN from PO
    createGRN: async (input: CreateGRNInput): Promise<GoodsReceiptNote> => {
        const response = await axios.post('/grns', input);
        return response.data.data;
    },

    // Update QC status
    updateQC: async (id: number, input: UpdateGRNQCInput): Promise<GoodsReceiptNote> => {
        const response = await axios.post(`/grns/${id}/qc`, input);
        return response.data.data;
    },

    // Post GRN to inventory
    postGRN: async (id: number): Promise<GoodsReceiptNote> => {
        const response = await axios.post(`/grns/${id}/post`, {});
        return response.data.data;
    },
};
