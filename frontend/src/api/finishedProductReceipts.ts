import axios from 'axios';
import type { FinishedProductReceipt, CreateFPRNInput, FPRNFilters } from '../types/finishedProductReceipt';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const finishedProductReceiptsAPI = {
    getReceipts: async (filters: FPRNFilters = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        if (filters.warehouse_id) params.append('warehouse_id', filters.warehouse_id.toString());
        if (filters.production_plan_id) params.append('production_plan_id', filters.production_plan_id.toString());
        return api.get(`/finished-product-receipts?${params.toString()}`);
    },

    getReceiptById: async (id: number) => {
        return api.get(`/finished-product-receipts/${id}`);
    },

    createReceipt: async (data: CreateFPRNInput) => {
        return api.post('/finished-product-receipts', data);
    },

    postReceipt: async (id: number) => {
        return api.post(`/finished-product-receipts/${id}/post`);
    },

    cancelReceipt: async (id: number) => {
        return api.post(`/finished-product-receipts/${id}/cancel`);
    },
};
