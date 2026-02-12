export interface ReturnOrder {
    id: number;
    return_number: string;
    delivery_order_id: number;
    do_number?: string;
    customer_name?: string;
    carrier_id?: number;
    carrier_name?: string;
    return_type: string;
    status: string;
    return_date: string;
    tracking_number?: string;
    reason?: string;
    resolution?: string;
    total_items: number;
    total_restocked: number;
    total_scrapped: number;
    refund_amount: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    items?: ReturnOrderItem[];
}

export interface ReturnOrderItem {
    id: number;
    return_order_id: number;
    delivery_order_item_id?: number;
    finished_product_id: number;
    product_name?: string;
    product_sku?: string;
    quantity_returned: number;
    quantity_restocked: number;
    quantity_scrapped: number;
    condition: string;
    warehouse_id?: number;
    warehouse_name?: string;
    reason?: string;
    notes?: string;
}

export interface CreateReturnOrderRequest {
    delivery_order_id: number;
    carrier_id?: number;
    return_type?: string;
    return_date?: string;
    tracking_number?: string;
    reason?: string;
    resolution?: string;
    notes?: string;
    items: CreateReturnOrderItemRequest[];
}

export interface CreateReturnOrderItemRequest {
    delivery_order_item_id?: number;
    finished_product_id: number;
    quantity_returned: number;
    reason?: string;
    notes?: string;
}

export interface UpdateReturnOrderRequest {
    carrier_id?: number;
    return_type?: string;
    tracking_number?: string;
    reason?: string;
    resolution?: string;
    refund_amount?: number;
    notes?: string;
}

export interface ReturnOrderFilter {
    status?: string;
    return_type?: string;
    delivery_order_id?: number;
    offset?: number;
    limit?: number;
}

export interface InspectItemRequest {
    condition: string;
    quantity_restocked: number;
    quantity_scrapped: number;
    warehouse_id?: number;
    notes?: string;
}
