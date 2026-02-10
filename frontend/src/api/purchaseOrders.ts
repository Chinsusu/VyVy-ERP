import axios from 'axios';
import type {
    PurchaseOrder,
    CreatePurchaseOrderInput,
    UpdatePurchaseOrderInput,
    PurchaseOrderFilters,
    PurchaseOrderListResponse,
} from '../types/purchaseOrder';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const purchaseOrdersAPI = {
    // Get all purchase orders with optional filters
    getPurchaseOrders: async (filters?: PurchaseOrderFilters): Promise<PurchaseOrderListResponse> => {
        const response = await axios.get(`${API_BASE_URL}/purchase-orders`, { params: filters });
        return response.data;
    },

    // Get purchase order by ID
    getPurchaseOrderById: async (id: number): Promise<PurchaseOrder> => {
        const response = await axios.get(`${API_BASE_URL}/purchase-orders/${id}`);
        return response.data.data;
    },

    // Create new purchase order
    createPurchaseOrder: async (input: CreatePurchaseOrderInput): Promise<PurchaseOrder> => {
        const response = await axios.post(`${API_BASE_URL}/purchase-orders`, input, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },

    // Update purchase order (only draft)
    updatePurchaseOrder: async (id: number, input: UpdatePurchaseOrderInput): Promise<PurchaseOrder> => {
        const response = await axios.put(`${API_BASE_URL}/purchase-orders/${id}`, input, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },

    // Delete purchase order (only draft)
    deletePurchaseOrder: async (id: number): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/purchase-orders/${id}`, {
            headers: getAuthHeader(),
        });
    },

    // Approve purchase order (draft → approved)
    approvePurchaseOrder: async (id: number): Promise<PurchaseOrder> => {
        const response = await axios.post(`${API_BASE_URL}/purchase-orders/${id}/approve`, {}, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },

    // Cancel purchase order
    cancelPurchaseOrder: async (id: number): Promise<PurchaseOrder> => {
        const response = await axios.post(`${API_BASE_URL}/purchase-orders/${id}/cancel`, {}, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },
};
