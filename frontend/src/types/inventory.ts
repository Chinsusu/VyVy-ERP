export type StockAdjustmentStatus = 'draft' | 'approved' | 'posted' | 'cancelled';
export type StockAdjustmentType = 'physical_count' | 'cycle_count' | 'damage' | 'write_off' | 'initial_stock';

export interface StockAdjustmentItem {
    id: number;
    item_type: 'material' | 'finished_product';
    item_id: number;
    item_name?: string;
    item_code?: string;
    warehouse_location_id?: number;
    location_code?: string;
    batch_number?: string;
    lot_number?: string;
    adjustment_quantity: number;
    previous_quantity: number;
    new_quantity: number;
    unit_cost: number;
    notes?: string;
}

export interface StockAdjustment {
    id: number;
    adjustment_number: string;
    warehouse_id: number;
    warehouse_name?: string;
    adjustment_date: string;
    adjustment_type: StockAdjustmentType;
    reason: string;
    status: StockAdjustmentStatus;
    is_posted: boolean;
    posted_by_name?: string;
    posted_at?: string;
    approved_by_name?: string;
    approved_at?: string;
    notes?: string;
    created_at: string;
    created_by_name?: string;
    items: StockAdjustmentItem[];
}

export interface CreateStockAdjustmentRequest {
    warehouse_id: number;
    adjustment_date: string;
    adjustment_type: StockAdjustmentType;
    reason: string;
    notes?: string;
    items: {
        item_type: 'material' | 'finished_product';
        item_id: number;
        warehouse_location_id?: number;
        batch_number?: string;
        lot_number?: string;
        adjustment_quantity: number;
        notes?: string;
    }[];
}

export type StockTransferStatus = 'draft' | 'approved' | 'shipped' | 'received' | 'posted' | 'cancelled';

export interface StockTransferItem {
    id: number;
    item_type: 'material' | 'finished_product';
    item_id: number;
    item_name?: string;
    item_code?: string;
    from_location_id?: number;
    from_location_code?: string;
    to_location_id?: number;
    to_location_code?: string;
    batch_number?: string;
    lot_number?: string;
    quantity: number;
    received_quantity: number;
    unit_cost: number;
}

export interface StockTransfer {
    id: number;
    transfer_number: string;
    from_warehouse_id: number;
    from_warehouse_name?: string;
    to_warehouse_id: number;
    to_warehouse_name?: string;
    transfer_date: string;
    status: StockTransferStatus;
    is_posted: boolean;
    posted_by_name?: string;
    posted_at?: string;
    approved_by_name?: string;
    shipped_by_name?: string;
    received_by_name?: string;
    notes?: string;
    created_at: string;
    created_by_name?: string;
    items: StockTransferItem[];
}

export interface CreateStockTransferRequest {
    from_warehouse_id: number;
    to_warehouse_id: number;
    transfer_date: string;
    notes?: string;
    items: {
        item_type: 'material' | 'finished_product';
        item_id: number;
        from_location_id?: number;
        to_location_id?: number;
        batch_number?: string;
        lot_number?: string;
        quantity: number;
        notes?: string;
    }[];
}

export interface StockAdjustmentFilters {
    warehouse_id?: number;
    status?: string;
    adjustment_number?: string;
    adjustment_type?: string;
    offset?: number;
    limit?: number;
}

export interface StockTransferFilters {
    from_warehouse_id?: number;
    to_warehouse_id?: number;
    status?: string;
    transfer_number?: string;
    offset?: number;
    limit?: number;
}
