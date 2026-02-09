export interface Supplier {
    id: number;
    code: string;
    name: string;
    name_en?: string;
    tax_code?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country: string;
    payment_terms?: string;
    credit_limit?: number;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateSupplierInput {
    code: string;
    name: string;
    name_en?: string;
    tax_code?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    payment_terms?: string;
    credit_limit?: number;
    is_active?: boolean;
    notes?: string;
}

export interface UpdateSupplierInput {
    code?: string;
    name?: string;
    name_en?: string;
    tax_code?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    payment_terms?: string;
    credit_limit?: number;
    is_active?: boolean;
    notes?: string;
}

export interface SupplierFilters {
    search?: string;
    country?: string;
    city?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface SupplierListResponse {
    success: boolean;
    data: Supplier[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    };
}
