export type DeliveryOrderStatus = 'draft' | 'picking' | 'shipped' | 'delivered' | 'cancelled';

export interface DeliveryOrder {
    id: number;
    do_number: string;
    warehouse_id: number;
    warehouse_name?: string;
    sales_channel_id?: number;
    sales_channel_name?: string;
    customer_name: string;
    customer_address?: string;
    delivery_date: string;
    status: DeliveryOrderStatus;
    is_posted: boolean;
    posted_by?: number;
    posted_by_name?: string;
    posted_at?: string;
    shipping_method?: string;
    tracking_number?: string;
    notes?: string;
    created_at: string;
    created_by_name?: string;
    updated_at: string;
    items?: DeliveryOrderItem[];
}

export interface DeliveryOrderItem {
    id: number;
    finished_product_id: number;
    product_name?: string;
    product_sku?: string;
    warehouse_location_id?: number;
    location_code?: string;
    batch_number?: string;
    lot_number?: string;
    expiry_date?: string;
    quantity: number;
    unit_cost?: number;
    notes?: string;
}

export interface CreateDeliveryOrderRequest {
    warehouse_id: number;
    sales_channel_id?: number;
    customer_name: string;
    customer_address?: string;
    delivery_date: string; // YYYY-MM-DD
    shipping_method?: string;
    notes?: string;
    items: CreateDeliveryOrderItem[];
}

export interface CreateDeliveryOrderItem {
    finished_product_id: number;
    quantity: number;
    warehouse_location_id?: number;
    batch_number?: string;
    lot_number?: string;
    notes?: string;
}

export interface DeliveryOrderFilter {
    warehouse_id?: number;
    sales_channel_id?: number;
    status?: string;
    do_number?: string;
    customer_name?: string;
    offset?: number;
    limit?: number;
}

export interface UpdateDeliveryOrderRequest {
    sales_channel_id?: number;
    customer_name?: string;
    customer_address?: string;
    delivery_date?: string;
    shipping_method?: string;
    tracking_number?: string;
    notes?: string;
    items?: CreateDeliveryOrderItem[];
}

export interface ShipDeliveryOrderRequest {
    tracking_number?: string;
    notes?: string;
}
