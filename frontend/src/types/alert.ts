export interface AlertItem {
    item_code: string;
    item_name: string;
    item_type: 'material' | 'finished_product';
    warehouse_name: string;
    quantity: number;
    unit: string;
    reorder_point?: number;
    batch_number?: string;
    expiry_date?: string;
    days_to_expiry?: number;
}

export interface AlertSummary {
    low_stock_count: number;
    expiring_soon_count: number;
    total_alerts: number;
    low_stock_items: AlertItem[];
    expiring_soon_items: AlertItem[];
}
