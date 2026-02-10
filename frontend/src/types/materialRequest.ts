import type { Material } from './material';
import type { Warehouse } from './warehouse';

export interface MaterialRequest {
    id: number;
    mr_number: string;
    warehouse_id: number;
    warehouse?: Warehouse;
    department: string;
    request_date: string;
    required_date?: string | null;
    status: 'draft' | 'approved' | 'issued' | 'closed' | 'cancelled';
    purpose?: string | null;
    notes?: string | null;
    approved_by?: number | null;
    approved_at?: string | null;
    items: MaterialRequestItem[];
    created_at: string;
    updated_at: string;
}

export interface MaterialRequestItem {
    id: number;
    material_request_id: number;
    material_id: number;
    material?: Material;
    requested_quantity: number;
    issued_quantity: number;
    notes?: string | null;
}

export interface CreateMaterialRequestInput {
    mr_number: string;
    warehouse_id: number;
    department: string;
    request_date: string;
    required_date?: string;
    purpose?: string;
    notes?: string;
    items: CreateMaterialRequestItemInput[];
}

export interface CreateMaterialRequestItemInput {
    material_id: number;
    requested_quantity: number;
    notes?: string;
}

export interface UpdateMaterialRequestInput {
    mr_number?: string;
    warehouse_id?: number;
    department?: string;
    request_date?: string;
    required_date?: string;
    purpose?: string;
    notes?: string;
    items?: UpdateMaterialRequestItemInput[];
}

export interface UpdateMaterialRequestItemInput {
    material_id: number;
    requested_quantity: number;
    notes?: string;
}

export interface MaterialRequestFilters {
    search?: string;
    warehouse_id?: number;
    department?: string;
    status?: string;
    request_date_from?: string;
    request_date_to?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface MaterialRequestListResponse {
    success: boolean;
    data: MaterialRequest[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}
