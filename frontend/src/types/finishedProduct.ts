export interface FinishedProduct {
    id: number;
    code: string;
    name: string;
    name_en?: string;
    category?: string;
    sub_category?: string;
    unit: string;

    // Pricing
    standard_cost?: number;
    selling_price?: number;

    // Specifications
    net_weight?: number;
    gross_weight?: number;
    volume?: number;

    // Stock control
    min_stock_level?: number;
    max_stock_level?: number;
    reorder_point?: number;

    // Product info
    shelf_life_days?: number;
    storage_conditions?: string;
    barcode?: string;

    // Status
    is_active: boolean;
    notes?: string;

    // Audit
    created_at: string;
    updated_at: string;
}

export interface CreateFinishedProductInput {
    code: string;
    name: string;
    name_en?: string;
    category?: string;
    sub_category?: string;
    unit: string;
    standard_cost?: number;
    selling_price?: number;
    net_weight?: number;
    gross_weight?: number;
    volume?: number;
    min_stock_level?: number;
    max_stock_level?: number;
    reorder_point?: number;
    shelf_life_days?: number;
    storage_conditions?: string;
    barcode?: string;
    is_active: boolean;
    notes?: string;
}

export interface UpdateFinishedProductInput {
    code?: string;
    name?: string;
    name_en?: string;
    category?: string;
    sub_category?: string;
    unit?: string;
    standard_cost?: number;
    selling_price?: number;
    net_weight?: number;
    gross_weight?: number;
    volume?: number;
    min_stock_level?: number;
    max_stock_level?: number;
    reorder_point?: number;
    shelf_life_days?: number;
    storage_conditions?: string;
    barcode?: string;
    is_active?: boolean;
    notes?: string;
}

export interface FinishedProductFilters {
    search?: string;
    category?: string;
    sub_category?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface FinishedProductListResponse {
    success: boolean;
    data: FinishedProduct[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    };
}
