import axios from '../lib/axios';
import type {
    PurchaseOrder,
    CreatePurchaseOrderInput,
    UpdatePurchaseOrderInput,
    PurchaseOrderFilters,
    PurchaseOrderListResponse,
} from '../types/purchaseOrder';

export const purchaseOrdersAPI = {
    // Get all purchase orders with optional filters
    getPurchaseOrders: async (filters?: PurchaseOrderFilters): Promise<PurchaseOrderListResponse> => {
        const response = await axios.get('/purchase-orders', { params: filters });
        return response.data;
    },

    // Get purchase order by ID
    getPurchaseOrderById: async (id: number): Promise<PurchaseOrder> => {
        const response = await axios.get(`/purchase-orders/${id}`);
        return response.data.data;
    },

    // Create new purchase order
    createPurchaseOrder: async (input: CreatePurchaseOrderInput): Promise<PurchaseOrder> => {
        const response = await axios.post('/purchase-orders', input);
        return response.data.data;
    },

    // Update purchase order (only draft)
    updatePurchaseOrder: async (id: number, input: UpdatePurchaseOrderInput): Promise<PurchaseOrder> => {
        const response = await axios.put(`/purchase-orders/${id}`, input);
        return response.data.data;
    },

    // Delete purchase order (only draft)
    deletePurchaseOrder: async (id: number): Promise<void> => {
        await axios.delete(`/purchase-orders/${id}`);
    },

    // Approve purchase order (draft → approved)
    approvePurchaseOrder: async (id: number): Promise<PurchaseOrder> => {
        const response = await axios.post(`/purchase-orders/${id}/approve`, {});
        return response.data.data;
    },

    // Cancel purchase order
    cancelPurchaseOrder: async (id: number): Promise<PurchaseOrder> => {
        const response = await axios.post(`/purchase-orders/${id}/cancel`, {});
        return response.data.data;
    },
};
