import axios from 'axios';
import { Carrier, CreateCarrierRequest, UpdateCarrierRequest, CarrierFilter } from '../types/carrier';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const carriersAPI = {
    list: async (filter?: CarrierFilter) => {
        const params = new URLSearchParams();
        if (filter?.carrier_type) params.append('carrier_type', filter.carrier_type);
        if (filter?.is_active !== undefined) params.append('is_active', String(filter.is_active));
        if (filter?.search) params.append('search', filter.search);
        if (filter?.offset) params.append('offset', filter.offset.toString());
        if (filter?.limit) params.append('limit', filter.limit.toString());

        const response = await axios.get(`${API_URL}/carriers?${params.toString()}`);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await axios.get(`${API_URL}/carriers/${id}`);
        return response.data;
    },

    create: async (data: CreateCarrierRequest) => {
        const response = await axios.post(`${API_URL}/carriers`, data);
        return response.data;
    },

    update: async (id: number, data: UpdateCarrierRequest) => {
        const response = await axios.put(`${API_URL}/carriers/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await axios.delete(`${API_URL}/carriers/${id}`);
        return response.data;
    },
};
