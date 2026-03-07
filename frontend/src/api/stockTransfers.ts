import axios from '../lib/axios';
import type {
    StockTransfer,
    CreateStockTransferInput,
    StockTransferFilters,
    StockTransferListResponse,
} from '../types/stockTransfer';

export const stockTransfersAPI = {
    // List transfers with filters
    getTransfers: async (filters?: StockTransferFilters): Promise<StockTransferListResponse> => {
        const response = await axios.get('/transfers', { params: filters });
        return response.data;
    },

    // Get single transfer by ID
    getTransferById: async (id: number): Promise<StockTransfer> => {
        const response = await axios.get(`/transfers/${id}`);
        return response.data.data;
    },

    // Create new transfer
    createTransfer: async (input: CreateStockTransferInput): Promise<StockTransfer> => {
        const response = await axios.post('/transfers', input);
        return response.data.data;
    },

    // Post transfer (move stock)
    postTransfer: async (id: number): Promise<StockTransfer> => {
        const response = await axios.post(`/transfers/${id}/post`, {});
        return response.data.data;
    },

    // Cancel transfer
    cancelTransfer: async (id: number): Promise<StockTransfer> => {
        const response = await axios.post(`/transfers/${id}/cancel`, {});
        return response.data.data;
    },
};
