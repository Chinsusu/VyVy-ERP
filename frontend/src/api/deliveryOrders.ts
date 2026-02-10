import api from '../lib/axios';
import type {
    DeliveryOrder,
    DeliveryOrderFilter,
    CreateDeliveryOrderRequest,
    UpdateDeliveryOrderRequest,
    ShipDeliveryOrderRequest
} from '../types/deliveryOrder';

export const deliveryOrdersAPI = {
    list: async (filter: DeliveryOrderFilter) => {
        const params = new URLSearchParams();
        if (filter.warehouse_id) params.append('warehouse_id', filter.warehouse_id.toString());
        if (filter.status) params.append('status', filter.status);
        if (filter.do_number) params.append('do_number', filter.do_number);
        if (filter.customer_name) params.append('customer_name', filter.customer_name);
        if (filter.offset !== undefined) params.append('offset', filter.offset.toString());
        if (filter.limit !== undefined) params.append('limit', filter.limit.toString());

        const response = await api.get<{ data: { items: DeliveryOrder[], total: number } }>(`/api/v1/delivery-orders?${params.toString()}`);
        return response.data.data;
    },

    get: async (id: number) => {
        const response = await api.get<{ data: DeliveryOrder }>(`/api/v1/delivery-orders/${id}`);
        return response.data.data;
    },

    create: async (data: CreateDeliveryOrderRequest) => {
        const response = await api.post<{ data: DeliveryOrder }>(`/api/v1/delivery-orders`, data);
        return response.data.data;
    },

    update: async (id: number, data: UpdateDeliveryOrderRequest) => {
        const response = await api.put<{ data: DeliveryOrder }>(`/api/v1/delivery-orders/${id}`, data);
        return response.data.data;
    },

    ship: async (id: number, data: ShipDeliveryOrderRequest) => {
        const response = await api.post<{ data: DeliveryOrder }>(`/api/v1/delivery-orders/${id}/ship`, data);
        return response.data.data;
    },

    cancel: async (id: number) => {
        const response = await api.post<{ data: DeliveryOrder }>(`/api/v1/delivery-orders/${id}/cancel`);
        return response.data.data;
    }
};
