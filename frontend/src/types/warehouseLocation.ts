export interface WarehouseLocation {
    id: number;
    warehouse_id: number;
    code: string;
    name: string;
    aisle?: string;
    rack?: string;
    shelf?: string;
    bin?: string;
    location_type: string;
    is_active: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
    full_path?: string; // Virtual property from backend or helper
    warehouse?: {
        id: number;
        code: string;
        name: string;
    };
}

export interface CreateWarehouseLocationInput {
    warehouse_id: number;
    code: string;
    name: string;
    aisle?: string;
    rack?: string;
    shelf?: string;
    bin?: string;
    location_type?: string;
    is_active: boolean;
    notes?: string;
}

export interface UpdateWarehouseLocationInput {
    warehouse_id?: number;
    code?: string;
    name?: string;
    aisle?: string;
    rack?: string;
    shelf?: string;
    bin?: string;
    location_type?: string;
    is_active?: boolean;
    notes?: string;
}

export interface WarehouseLocationFilters {
    search?: string;
    warehouse_id?: number;
    location_type?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface WarehouseLocationListResponse {
    success: boolean;
    data: WarehouseLocation[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    };
}

// Helper function to format location hierarchy (Aisle-Rack-Shelf-Bin)
export function formatLocationHierarchy(location: WarehouseLocation): string {
    const parts: string[] = [];

    if (location.aisle) parts.push(location.aisle);
    if (location.rack) parts.push(location.rack);
    if (location.shelf) parts.push(location.shelf);
    if (location.bin) parts.push(location.bin);

    return parts.length > 0 ? parts.join('-') : location.code;
}
