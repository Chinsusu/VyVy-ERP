export interface ShippingReconciliation {
    id: number;
    reconciliation_number: string;
    carrier_id: number;
    carrier_name?: string;
    carrier_code?: string;
    period_start?: string;
    period_end?: string;
    status: string; // draft, processing, completed, confirmed
    total_orders: number;
    total_matched: number;
    total_discrepancy: number;
    total_cod_expected: number;
    total_cod_actual: number;
    total_shipping_fee: number;
    notes?: string;
    created_at: string;
    created_by_name?: string;
    updated_at: string;
    items?: ReconciliationItem[];
}

export interface ReconciliationItem {
    id: number;
    reconciliation_id: number;
    delivery_order_id?: number;
    do_number?: string;
    customer_name?: string;
    tracking_number: string;
    carrier_status?: string;
    cod_amount: number;
    shipping_fee: number;
    actual_received: number;
    match_status: string; // pending, matched, discrepancy, unmatched
    discrepancy_amount: number;
    discrepancy_note?: string;
    created_at: string;
}

export interface CreateReconciliationRequest {
    carrier_id: number;
    period_start?: string;
    period_end?: string;
    notes?: string;
}

export interface AddReconciliationItemInput {
    tracking_number: string;
    carrier_status?: string;
    cod_amount: number;
    shipping_fee: number;
    actual_received: number;
}

export interface ReconciliationFilter {
    carrier_id?: number;
    status?: string;
    offset?: number;
    limit?: number;
}
