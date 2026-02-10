import type { Material } from './material';
import type { Warehouse } from './warehouse';
import type { WarehouseLocation } from './warehouseLocation';
import type { MaterialRequest } from './materialRequest';

export interface MaterialIssueNote {
    id: number;
    min_number: string;
    material_request_id: number;
    material_request?: MaterialRequest;
    warehouse_id: number;
    warehouse?: Warehouse;
    issue_date: string;
    status: 'draft' | 'posted' | 'cancelled';
    is_posted: boolean;
    posted_by?: number | null;
    posted_at?: string | null;
    notes?: string | null;
    items: MaterialIssueNoteItem[];
    created_at: string;
    updated_at: string;
}

export interface MaterialIssueNoteItem {
    id: number;
    min_id: number;
    mr_item_id: number;
    material_id: number;
    material?: Material;
    warehouse_location_id?: number | null;
    warehouse_location?: WarehouseLocation;
    batch_number?: string | null;
    lot_number?: string | null;
    expiry_date?: string | null;
    quantity: number;
    unit_cost?: number | null;
    notes?: string | null;
}

export interface CreateMaterialIssueNoteInput {
    material_request_id: number;
    warehouse_id: number;
    issue_date: string;
    notes?: string;
    items: CreateMaterialIssueNoteItemInput[];
}

export interface CreateMaterialIssueNoteItemInput {
    mr_item_id: number;
    material_id: number;
    warehouse_location_id: number;
    batch_number: string;
    lot_number?: string;
    expiry_date?: string;
    quantity: number;
    unit_cost?: number;
    notes?: string;
}

export interface MaterialIssueNoteFilters {
    min_number?: string;
    warehouse_id?: number;
    material_request_id?: number;
    status?: string;
    page?: number;
    limit?: number;
}

export interface MaterialIssueNoteListResponse {
    success: boolean;
    data: {
        items: MaterialIssueNote[];
        total: number;
        page: number;
        limit: number;
    };
}
