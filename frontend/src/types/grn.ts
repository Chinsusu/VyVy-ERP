import type { PurchaseOrder, PurchaseOrderItem } from './purchaseOrder';
import type { Warehouse } from './warehouse';
import type { Material } from './material';
import type { WarehouseLocation } from './warehouseLocation';

export interface GoodsReceiptNote {
    id: number;
    grn_number: string;
    purchase_order_id: number;
    purchase_order?: PurchaseOrder;
    warehouse_id: number;
    warehouse?: Warehouse;
    receipt_date: string;
    overall_qc_status: 'pending' | 'pass' | 'fail' | 'conditional';
    posted: boolean;
    posted_at?: string;
    posted_by?: number;
    notes?: string;
    items: GoodsReceiptNoteItem[];
    created_at: string;
    updated_at: string;
}

export interface GoodsReceiptNoteItem {
    id: number;
    grn_id: number;
    po_item_id: number;
    po_item?: PurchaseOrderItem;
    material_id: number;
    material?: Material;
    warehouse_location_id: number;
    warehouse_location?: WarehouseLocation;
    quantity: number;
    unit_cost: number;
    batch_number?: string;
    lot_number?: string;
    manufacture_date?: string;
    expiry_date?: string;
    accepted_quantity: number;
    rejected_quantity: number;
    qc_status: 'pending' | 'pass' | 'fail' | 'partial';
    qc_notes?: string;
    notes?: string;
}

export interface CreateGRNItemInput {
    po_item_id: number;
    material_id: number;
    warehouse_location_id: number;
    quantity: number;
    unit_cost: number;
    batch_number?: string;
    lot_number?: string;
    manufacture_date?: string; // YYYY-MM-DD
    expiry_date?: string; // YYYY-MM-DD
    notes?: string;
}

export interface CreateGRNInput {
    grn_number: string;
    purchase_order_id: number;
    warehouse_id: number;
    receipt_date: string; // YYYY-MM-DD
    notes?: string;
    items: CreateGRNItemInput[];
}

export interface UpdateGRNQCItemInput {
    accepted_quantity: number;
    rejected_quantity: number;
    qc_status: 'pass' | 'fail' | 'partial';
    qc_notes?: string;
}

export interface UpdateGRNQCInput {
    notes?: string;
    items: Record<number, UpdateGRNQCItemInput>; // Map of item ID to QC data
}

export interface GRNFilters {
    search?: string;
    warehouse_id?: number;
    purchase_order_id?: number;
    overall_qc_status?: string;
    posted?: boolean;
    receipt_date_from?: string;
    receipt_date_to?: string;
    page?: number;
    page_size?: number;
}

export interface GRNListResponse {
    success: boolean;
    data: GoodsReceiptNote[];
    pagination: {
        page: number;
        limit: number;
        total_items: number;
        total_pages: number;
    };
}
