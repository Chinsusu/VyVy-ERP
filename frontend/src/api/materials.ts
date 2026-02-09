import api from '../lib/axios';
import type {
    Material,
    CreateMaterialInput,
    UpdateMaterialInput,
    MaterialFilters,
    MaterialListResponse,
} from '../types/material';
import type { APIResponse } from '../types/auth';

export const materialsAPI = {
    /**
     * Get list of materials with filters and pagination
     */
    getMaterials: async (filters?: MaterialFilters): Promise<MaterialListResponse> => {
        const { data } = await api.get<MaterialListResponse>('/materials', {
            params: filters,
        });
        return data;
    },

    /**
     * Get a single material by ID
     */
    getMaterialById: async (id: number): Promise<Material> => {
        const { data } = await api.get<APIResponse<Material>>(`/materials/${id}`);
        return data.data;
    },

    /**
     * Create a new material
     */
    createMaterial: async (input: CreateMaterialInput): Promise<Material> => {
        const { data } = await api.post<APIResponse<Material>>('/materials', input);
        return data.data;
    },

    /**
     * Update an existing material
     */
    updateMaterial: async (id: number, input: UpdateMaterialInput): Promise<Material> => {
        const { data } = await api.put<APIResponse<Material>>(`/materials/${id}`, input);
        return data.data;
    },

    /**
     * Delete a material (soft delete)
     */
    deleteMaterial: async (id: number): Promise<void> => {
        await api.delete(`/materials/${id}`);
    },
};
