export interface SalesChannel {
    id: number;
    code: string;
    name: string;
    platform_type: string; // marketplace, social, branch, other
    is_active: boolean;
    description?: string;
    config?: string;
    created_at: string;
    created_by_name?: string;
    updated_at: string;
}

export interface CreateSalesChannelInput {
    code: string;
    name: string;
    platform_type: string;
    description?: string;
}

export interface UpdateSalesChannelInput {
    name?: string;
    platform_type?: string;
    is_active?: boolean;
    description?: string;
}

export interface SalesChannelFilters {
    platform_type?: string;
    is_active?: boolean;
    search?: string;
    offset?: number;
    limit?: number;
}

export interface SalesChannelListResponse {
    data: SalesChannel[];
    total: number;
}
