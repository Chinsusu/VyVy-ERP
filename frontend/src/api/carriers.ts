import axios from '../lib/axios';
import type { CreateCarrierRequest, UpdateCarrierRequest, CarrierFilter } from '../types/carrier';

export const carriersAPI = {
    list: async (filter?: CarrierFilter) => {
        const params = new URLSearchParams();
        if (filter?.carrier_type) params.append('carrier_type', filter.carrier_type);
        if (filter?.is_active !== undefined) params.append('is_active', String(filter.is_active));
        if (filter?.search) params.append('search', filter.search);
        if (filter?.offset) params.append('offset', filter.offset.toString());
        if (filter?.limit) params.append('limit', filter.limit.toString());

        const { data } = await axios.get(`/carriers?${params.toString()}`);
        return data;
    },

    getById: async (id: number) => {
        const { data } = await axios.get(`/carriers/${id}`);
        return data;
    },

    create: async (payload: CreateCarrierRequest) => {
        const { data } = await axios.post('/carriers', payload);
        return data;
    },

    update: async (id: number, payload: UpdateCarrierRequest) => {
        const { data } = await axios.put(`/carriers/${id}`, payload);
        return data;
    },

    delete: async (id: number) => {
        const { data } = await axios.delete(`/carriers/${id}`);
        return data;
    },
};
