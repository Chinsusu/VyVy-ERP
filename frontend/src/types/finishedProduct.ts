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
        limit: number;
        total_items: number;
        total_pages: number;
    };
}

// ===== BOM / Product Formula Types =====

export interface FormulaItemMaterial {
    id: number;
    code: string;
    trading_name: string;
    unit: string;
}

export interface ProductFormulaItem {
    id: number;
    formula_id: number;
    material_id: number;
    quantity: number;
    unit: string;
    notes?: string;
    material?: FormulaItemMaterial;
}

export interface ProductFormula {
    id: number;
    finished_product_id: number;
    name: string;
    description?: string;
    batch_size: number;
    batch_unit: string;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
    items?: ProductFormulaItem[];
}

export interface FormulaItemInput {
    material_id: number;
    quantity: number;
    unit: string;
    notes?: string;
}

export interface CreateFormulaInput {
    name: string;
    description?: string;
    batch_size?: number;
    batch_unit?: string;
    is_active: boolean;
    notes?: string;
    items: FormulaItemInput[];
}

export interface UpdateFormulaInput {
    name?: string;
    description?: string;
    batch_size?: number;
    batch_unit?: string;
    is_active?: boolean;
    notes?: string;
    items?: FormulaItemInput[];
}
