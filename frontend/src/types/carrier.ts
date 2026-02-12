export interface Carrier {
    id: number;
    code: string;
    name: string;
    carrier_type: string; // express, freight, internal
    contact_phone?: string;
    contact_email?: string;
    website?: string;
    tracking_url_template?: string;
    shipping_fee_config?: string;
    is_active: boolean;
    description?: string;
    created_at: string;
    created_by_name?: string;
    updated_at: string;
}

export interface CreateCarrierRequest {
    code: string;
    name: string;
    carrier_type?: string;
    contact_phone?: string;
    contact_email?: string;
    website?: string;
    tracking_url_template?: string;
    shipping_fee_config?: string;
    is_active?: boolean;
    description?: string;
}

export interface UpdateCarrierRequest {
    name?: string;
    carrier_type?: string;
    contact_phone?: string;
    contact_email?: string;
    website?: string;
    tracking_url_template?: string;
    shipping_fee_config?: string;
    is_active?: boolean;
    description?: string;
}

export interface CarrierFilter {
    carrier_type?: string;
    is_active?: boolean;
    search?: string;
    offset?: number;
    limit?: number;
}
