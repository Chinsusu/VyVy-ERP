import type { Supplier } from './supplier';
import type { Warehouse } from './warehouse';
import type { Material } from './material';

export interface UserBrief {
    id: number;
    username: string;
    full_name: string;
    email?: string;
    role?: string;
}

export interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier_id: number;
    warehouse_id: number;
    supplier?: Supplier;
    warehouse?: Warehouse;
    order_date: string; // YYYY-MM-DD
    expected_delivery_date?: string; // YYYY-MM-DD
    status: 'draft' | 'approved' | 'cancelled' | 'completed';
    // Workflow status fields (B4-B7)
    order_status?: 'pending' | 'ordered';
    payment_status?: 'pending' | 'partial' | 'completed';
    invoice_status?: 'pending' | 'received';
    receipt_status?: 'pending' | 'completed';
    invoice_number?: string;
    invoice_date?: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    payment_terms?: string;
    shipping_method?: string;
    notes?: string;
    approved_by?: number;
    approved_at?: string;
    assigned_to?: number;
    assigned_to_user?: UserBrief;
    created_by_user?: UserBrief;
    updated_by_user?: UserBrief;
    approved_by_user?: UserBrief;
    items: PurchaseOrderItem[];
    created_at: string;
    updated_at: string;
}


export interface PurchaseOrderItem {
    id: number;
    purchase_order_id: number;
    material_id: number;
    material?: Material;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    discount_rate: number;
    line_total: number;
    received_quantity: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePurchaseOrderItemInput {
    material_id: number;
    quantity: number;
    unit_price: number;
    tax_rate?: number;
    discount_rate?: number;
    notes?: string;
    expected_delivery_date?: string;
    attachments?: string;
}

export interface CreatePurchaseOrderInput {
    po_number: string;
    supplier_id: number;
    warehouse_id: number;
    order_date: string; // YYYY-MM-DD
    expected_delivery_date?: string; // YYYY-MM-DD
    payment_terms?: string;
    shipping_method?: string;
    notes?: string;
    items: CreatePurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderItemInput {
    material_id?: number;
    quantity?: number;
    unit_price?: number;
    tax_rate?: number;
    discount_rate?: number;
    notes?: string;
}

export interface UpdatePurchaseOrderInput {
    po_number?: string;
    supplier_id?: number;
    warehouse_id?: number;
    order_date?: string;
    expected_delivery_date?: string;
    payment_terms?: string;
    shipping_method?: string;
    notes?: string;
    items?: UpdatePurchaseOrderItemInput[];
}

export interface PurchaseOrderFilters {
    search?: string;
    supplier_id?: number;
    warehouse_id?: number;
    status?: string;
    payment_status?: string;
    order_date_from?: string;
    order_date_to?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: string;
}


export interface PurchaseOrderListResponse {
    data: PurchaseOrder[];
    pagination: {
        page: number;
        limit: number;
        total_items: number;
        total_pages: number;
    };
}
