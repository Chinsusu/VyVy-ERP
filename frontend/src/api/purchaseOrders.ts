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

    // Update order status (B4: procurement confirms order placed)
    updateOrderStatus: async (id: number, input: { order_status: string; notes?: string }): Promise<PurchaseOrder> => {
        const response = await axios.put(`/purchase-orders/${id}/order-status`, input);
        return response.data.data;
    },

    // Update payment status (B5: accounting marks payment)
    updatePaymentStatus: async (id: number, input: { payment_status: string; notes?: string }): Promise<PurchaseOrder> => {
        const response = await axios.put(`/purchase-orders/${id}/payment-status`, input);
        return response.data.data;
    },

    // Update invoice status (B6: accounting confirms invoice received)
    updateInvoiceStatus: async (id: number, input: { invoice_status: string; invoice_number?: string; invoice_date?: string }): Promise<PurchaseOrder> => {
        const response = await axios.put(`/purchase-orders/${id}/invoice-status`, input);
        return response.data.data;
    },
};

