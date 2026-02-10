import api from '../lib/axios';
import type {
    StockAdjustment, CreateStockAdjustmentRequest, StockAdjustmentFilters,
    StockTransfer, CreateStockTransferRequest, StockTransferFilters
} from '../types/inventory';

const inventoryApi = {
    // Stock Adjustments
    getAdjustments: async (filters?: StockAdjustmentFilters) => {
        const response = await api.get<{ data: StockAdjustment[]; total: number }>('/inventory/adjustments', { params: filters });
        return response.data;
    },

    getAdjustment: async (id: number) => {
        const response = await api.get<StockAdjustment>(`/inventory/adjustments/${id}`);
        return response.data;
    },

    createAdjustment: async (data: CreateStockAdjustmentRequest) => {
        const response = await api.post<StockAdjustment>('/inventory/adjustments', data);
        return response.data;
    },

    postAdjustment: async (id: number) => {
        const response = await api.post<StockAdjustment>(`/inventory/adjustments/${id}/post`);
        return response.data;
    },

    cancelAdjustment: async (id: number) => {
        const response = await api.post<StockAdjustment>(`/inventory/adjustments/${id}/cancel`);
        return response.data;
    },

    // Stock Transfers
    getTransfers: async (filters?: StockTransferFilters) => {
        const response = await api.get<{ data: StockTransfer[]; total: number }>('/inventory/transfers', { params: filters });
        return response.data;
    },

    getTransfer: async (id: number) => {
        const response = await api.get<StockTransfer>(`/inventory/transfers/${id}`);
        return response.data;
    },

    createTransfer: async (data: CreateStockTransferRequest) => {
        const response = await api.post<StockTransfer>('/inventory/transfers', data);
        return response.data;
    },

    postTransfer: async (id: number) => {
        const response = await api.post<StockTransfer>(`/inventory/transfers/${id}/post`);
        return response.data;
    },

    cancelTransfer: async (id: number) => {
        const response = await api.post<StockTransfer>(`/inventory/transfers/${id}/cancel`);
        return response.data;
    },
};

export default inventoryApi;
