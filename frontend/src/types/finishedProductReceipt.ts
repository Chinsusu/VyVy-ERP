export interface FinishedProductReceipt {
    id: number;
    fprn_number: string;
    production_plan_id?: number;
    warehouse_id: number;
    receipt_date: string;
    status: 'draft' | 'posted' | 'cancelled';
    posted: boolean;
    posted_by?: number;
    posted_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;

    // Relations
    production_plan?: { id: number; plan_number: string };
    warehouse?: { id: number; name: string; warehouse_type: string };
    items?: FinishedProductReceiptItem[];
}

export interface FinishedProductReceiptItem {
    id: number;
    fprn_id: number;
    finished_product_id: number;
    warehouse_location_id?: number;
    quantity: number;
    batch_number?: string;
    manufacture_date?: string;
    expiry_date?: string;
    unit_cost: number;
    notes?: string;

    // Relations
    finished_product?: {
        id: number;
        code: string;
        name: string;
        unit: string;
    };
    warehouse_location?: { id: number; code: string; name: string };
}

export interface CreateFPRNInput {
    production_plan_id?: number;
    warehouse_id: number;
    receipt_date: string;
    notes?: string;
    items: CreateFPRNItemInput[];
}

export interface CreateFPRNItemInput {
    finished_product_id: number;
    warehouse_location_id?: number;
    quantity: number;
    batch_number?: string;
    manufacture_date?: string;
    expiry_date?: string;
    unit_cost?: number;
    notes?: string;
}

export interface FPRNFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    warehouse_id?: number;
    production_plan_id?: number;
}
