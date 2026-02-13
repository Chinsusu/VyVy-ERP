import axios from '../lib/axios';
import type { CreateReconciliationRequest, AddReconciliationItemInput, ReconciliationFilter } from '../types/reconciliation';

export const reconciliationsAPI = {
    list: async (filter?: ReconciliationFilter) => {
        const params = new URLSearchParams();
        if (filter?.carrier_id) params.append('carrier_id', filter.carrier_id.toString());
        if (filter?.status) params.append('status', filter.status);
        if (filter?.offset) params.append('offset', filter.offset.toString());
        if (filter?.limit) params.append('limit', filter.limit.toString());

        const { data } = await axios.get(`/reconciliations?${params.toString()}`);
        return data;
    },

    getById: async (id: number) => {
        const { data } = await axios.get(`/reconciliations/${id}`);
        return data;
    },

    create: async (payload: CreateReconciliationRequest) => {
        const { data } = await axios.post('/reconciliations', payload);
        return data;
    },

    addItems: async (id: number, items: AddReconciliationItemInput[]) => {
        const { data } = await axios.post(`/reconciliations/${id}/items`, { items });
        return data;
    },

    confirm: async (id: number) => {
        const { data } = await axios.put(`/reconciliations/${id}/confirm`);
        return data;
    },

    delete: async (id: number) => {
        const { data } = await axios.delete(`/reconciliations/${id}`);
        return data;
    },
};
