import axios from '../lib/axios';
import type { ReturnOrder, CreateReturnOrderRequest, UpdateReturnOrderRequest, ReturnOrderFilter, InspectItemRequest } from '../types/returnOrder';

export const returnOrdersApi = {
    list: async (filter: ReturnOrderFilter = {}) => {
        const params = new URLSearchParams();
        if (filter.status) params.append('status', filter.status);
        if (filter.return_type) params.append('return_type', filter.return_type);
        if (filter.delivery_order_id) params.append('delivery_order_id', filter.delivery_order_id.toString());
        if (filter.offset !== undefined) params.append('offset', filter.offset.toString());
        if (filter.limit) params.append('limit', filter.limit.toString());
        const { data } = await axios.get(`/return-orders?${params.toString()}`);
        return { items: data.data as ReturnOrder[], total: data.total as number };
    },

    getById: async (id: number) => {
        const { data } = await axios.get(`/return-orders/${id}`);
        return data.data as ReturnOrder;
    },

    create: async (req: CreateReturnOrderRequest) => {
        const { data } = await axios.post('/return-orders', req);
        return data.data as ReturnOrder;
    },

    update: async (id: number, req: UpdateReturnOrderRequest) => {
        const { data } = await axios.put(`/return-orders/${id}`, req);
        return data.data as ReturnOrder;
    },

    delete: async (id: number) => {
        await axios.delete(`/return-orders/${id}`);
    },

    approve: async (id: number) => {
        const { data } = await axios.post(`/return-orders/${id}/approve`);
        return data.data as ReturnOrder;
    },

    receive: async (id: number) => {
        const { data } = await axios.post(`/return-orders/${id}/receive`);
        return data.data as ReturnOrder;
    },

    inspectItem: async (roId: number, itemId: number, req: InspectItemRequest) => {
        const { data } = await axios.put(`/return-orders/${roId}/items/${itemId}/inspect`, req);
        return data.data as ReturnOrder;
    },

    complete: async (id: number) => {
        const { data } = await axios.post(`/return-orders/${id}/complete`);
        return data.data as ReturnOrder;
    },

    cancel: async (id: number) => {
        const { data } = await axios.post(`/return-orders/${id}/cancel`);
        return data.data as ReturnOrder;
    },
};
