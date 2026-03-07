// Stock Transfer types

export interface StockTransferItem {
    id: number;
    stock_transfer_id: number;
    item_type: 'material' | 'finished_product';
    item_id: number;
    from_location_id?: number;
    to_location_id?: number;
    batch_number?: string;
    lot_number?: string;
    expiry_date?: string;
    quantity: number;
    received_quantity: number;
    unit_cost?: number;
    notes?: string;
    // Populated relationships
    material?: {
        id: number;
        code: string;
        trading_name: string;
        unit: string;
        material_type: string;
    };
    finished_product?: {
        id: number;
        code: string;
        name: string;
        unit: string;
    };
}

export interface StockTransfer {
    id: number;
    transfer_number: string;
    from_warehouse_id: number;
    to_warehouse_id: number;
    transfer_date: string;
    status: 'draft' | 'posted' | 'cancelled';
    approved_by?: number;
    approved_at?: string;
    shipped_by?: number;
    shipped_at?: string;
    received_by?: number;
    received_at?: string;
    posted: boolean;
    posted_by?: number;
    posted_at?: string;
    notes?: string;
    created_at: string;
    created_by?: number;
    updated_at: string;
    updated_by?: number;
    // Relationships
    from_warehouse?: { id: number; name: string; type: string };
    to_warehouse?: { id: number; name: string; type: string };
    items?: StockTransferItem[];
    created_by_user?: { id: number; username: string; full_name: string };
}

export interface StockTransferListResponse {
    data: StockTransfer[];
    total: number;
    page: number;
    page_size: number;
}

export interface StockTransferFilters {
    page?: number;
    page_size?: number;
    status?: string;
    from_warehouse_id?: number;
    to_warehouse_id?: number;
    search?: string;
}

export interface CreateStockTransferItemInput {
    item_type: 'material' | 'finished_product';
    item_id: number;
    from_location_id?: number;
    to_location_id?: number;
    batch_number?: string;
    lot_number?: string;
    quantity: number;
    notes?: string;
}

export interface CreateStockTransferInput {
    from_warehouse_id: number;
    to_warehouse_id: number;
    transfer_date: string;
    notes?: string;
    items: CreateStockTransferItemInput[];
}
