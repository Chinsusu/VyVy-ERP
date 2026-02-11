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
}
