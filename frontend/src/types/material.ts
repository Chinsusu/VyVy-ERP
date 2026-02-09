export interface Material {
    id: number;
    code: string;
    trading_name: string;
    inci_name?: string | null;
    material_type: string;
    category?: string | null;
    sub_category?: string | null;
    unit: string;
    supplier_id?: number | null;
    standard_cost?: number | null;
    last_purchase_price?: number | null;
    min_stock_level?: number | null;
    max_stock_level?: number | null;
    reorder_point?: number | null;
    reorder_quantity?: number | null;
    requires_qc: boolean;
    shelf_life_days?: number | null;
    storage_conditions?: string | null;
    hazardous: boolean;
    is_active: boolean;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateMaterialInput {
    code: string;
    trading_name: string;
    inci_name?: string;
    material_type: string;
    category?: string;
    sub_category?: string;
    unit: string;
    supplier_id?: number;
    standard_cost?: number;
    last_purchase_price?: number;
    min_stock_level?: number;
    max_stock_level?: number;
    reorder_point?: number;
    reorder_quantity?: number;
    requires_qc: boolean;
    shelf_life_days?: number;
    storage_conditions?: string;
    hazardous: boolean;
    is_active: boolean;
    notes?: string;
}

export interface UpdateMaterialInput {
    trading_name?: string;
    inci_name?: string;
    material_type?: string;
    category?: string;
    sub_category?: string;
    unit?: string;
    supplier_id?: number;
    standard_cost?: number;
    last_purchase_price?: number;
    min_stock_level?: number;
    max_stock_level?: number;
    reorder_point?: number;
    reorder_quantity?: number;
    requires_qc?: boolean;
    shelf_life_days?: number;
    storage_conditions?: string;
    hazardous?: boolean;
    is_active?: boolean;
    notes?: string;
}

export interface MaterialFilters {
    search?: string;
    material_type?: string;
    category?: string;
    supplier_id?: number;
    requires_qc?: boolean;
    hazardous?: boolean;
    is_active?: boolean;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface MaterialListResponse {
    success: boolean;
    data: Material[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}
