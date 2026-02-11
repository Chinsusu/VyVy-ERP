export interface StockMovementReportRow {
    item_code: string;
    item_name: string;
    warehouse_name: string;
    unit: string;
    received_qty: number;
    issued_qty: number;
    adjusted_qty: number;
    transferred_qty: number;
}

export interface InventoryValueReportRow {
    item_code: string;
    item_name: string;
    category: string;
    warehouse_name: string;
    quantity: number;
    unit_cost: number;
    total_value: number;
    unit: string;
}

export interface ReportFilter {
    start_date?: string;
    end_date?: string;
    warehouse_id?: number;
    days?: number;
}

export interface LowStockReportRow {
    item_code: string;
    item_name: string;
    warehouse_name: string;
    quantity: number;
    reorder_point: number;
    unit: string;
}

export interface ExpiringSoonReportRow {
    item_code: string;
    item_name: string;
    warehouse_name: string;
    batch_number: string;
    quantity: number;
    expiry_date: string;
    days_to_expiry: number;
    unit: string;
}
