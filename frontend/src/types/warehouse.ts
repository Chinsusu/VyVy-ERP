export interface Warehouse {
    id: number;
    code: string;
    name: string;
    warehouse_type: string;
    address?: string;
    city?: string;
    manager_id?: number;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
    locations_count?: number; // For list view
    manager?: {
        id: number;
        full_name: string;
        email: string;
    };
    locations?: import('./warehouseLocation').WarehouseLocation[];
}

export interface CreateWarehouseInput {
    code: string;
    name: string;
    warehouse_type?: string;
    address?: string;
    city?: string;
    manager_id?: number;
    is_active: boolean;
    notes?: string;
}

export interface UpdateWarehouseInput {
    code?: string;
    name?: string;
    warehouse_type?: string;
    address?: string;
    city?: string;
    manager_id?: number;
    is_active?: boolean;
    notes?: string;
}

export interface WarehouseFilters {
    search?: string;
    warehouse_type?: string;
    city?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface WarehouseListResponse {
    success: boolean;
    data: Warehouse[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    };
}
