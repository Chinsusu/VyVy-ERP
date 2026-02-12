import axios from 'axios';
import { CreateReconciliationRequest, AddReconciliationItemInput, ReconciliationFilter } from '../types/reconciliation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const reconciliationsAPI = {
    list: async (filter?: ReconciliationFilter) => {
        const params = new URLSearchParams();
        if (filter?.carrier_id) params.append('carrier_id', filter.carrier_id.toString());
        if (filter?.status) params.append('status', filter.status);
        if (filter?.offset) params.append('offset', filter.offset.toString());
        if (filter?.limit) params.append('limit', filter.limit.toString());

        const response = await axios.get(`${API_URL}/reconciliations?${params.toString()}`);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await axios.get(`${API_URL}/reconciliations/${id}`);
        return response.data;
    },

    create: async (data: CreateReconciliationRequest) => {
        const response = await axios.post(`${API_URL}/reconciliations`, data);
        return response.data;
    },

    addItems: async (id: number, items: AddReconciliationItemInput[]) => {
        const response = await axios.post(`${API_URL}/reconciliations/${id}/items`, { items });
        return response.data;
    },

    confirm: async (id: number) => {
        const response = await axios.put(`${API_URL}/reconciliations/${id}/confirm`);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await axios.delete(`${API_URL}/reconciliations/${id}`);
        return response.data;
    },
};
