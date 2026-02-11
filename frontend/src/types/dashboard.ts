export interface DashboardStats {
    total_purchase_orders: number;
    pending_grns: number;
    total_material_requests: number;
    total_delivery_orders: number;
    inventory_value: number;
    low_stock_count: number;
    expiring_soon_count: number;
    last_updated_at: string;
}
