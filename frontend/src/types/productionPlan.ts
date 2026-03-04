import type { Material } from './material';
import type { Warehouse } from './warehouse';

export interface ProductionPlan {
    id: number;
    plan_number: string;
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
    items: ProductionPlanItem[];
    created_at: string;
    updated_at: string;
}

export interface ProductionPlanItem {
    id: number;
    production_plan_id: number;
    material_id: number;
    material?: Material;
    requested_quantity: number;
    issued_quantity: number;
    notes?: string | null;
}

export interface CreateProductionPlanInput {
    plan_number: string;
    warehouse_id: number;
    department: string;
    request_date: string;
    required_date?: string;
    purpose?: string;
    notes?: string;
    items: CreateProductionPlanItemInput[];
}

export interface CreateProductionPlanItemInput {
    material_id: number;
    requested_quantity: number;
    notes?: string;
}

export interface UpdateProductionPlanInput {
    plan_number?: string;
    warehouse_id?: number;
    department?: string;
    request_date?: string;
    required_date?: string;
    purpose?: string;
    notes?: string;
    items?: UpdateProductionPlanItemInput[];
}

export interface UpdateProductionPlanItemInput {
    material_id: number;
    requested_quantity: number;
    notes?: string;
}

export interface ProductionPlanFilters {
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

export interface ProductionPlanListResponse {
    success: boolean;
    data: ProductionPlan[];
    pagination: {
        page: number;
        limit: number;
        total_items: number;
        total_pages: number;
    };
}

// Production Tasks
export interface ProductionTask {
    id: number;
    production_plan_id: number;
    category: string;
    task_name: string;
    description?: string;
    assigned_to?: number | null;
    assigned_user_name?: string;
    planned_start?: string | null;
    planned_end?: string | null;
    actual_start?: string | null;
    actual_end?: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    progress_percent: number;
    sort_order: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateProductionTaskInput {
    category: string;
    task_name: string;
    description?: string;
    assigned_to?: number | null;
    planned_start?: string;
    planned_end?: string;
    status?: string;
    progress_percent?: number;
    sort_order?: number;
    notes?: string;
}

export interface UpdateProductionTaskInput {
    category?: string;
    task_name?: string;
    description?: string;
    assigned_to?: number | null;
    planned_start?: string;
    planned_end?: string;
    actual_start?: string;
    actual_end?: string;
    status?: string;
    progress_percent?: number;
    sort_order?: number;
    notes?: string;
}
