import axios from '../lib/axios';
import type {
    Supplier,
    CreateSupplierInput,
    UpdateSupplierInput,
    SupplierFilters,
    SupplierListResponse,
} from '../types/supplier';

const BASE_URL = '/suppliers';

export const suppliersAPI = {
    /**
     * Get suppliers list with filters
     */
    getSuppliers: async (filters?: SupplierFilters): Promise<SupplierListResponse> => {
        const { data } = await axios.get(BASE_URL, { params: filters });
        return data;
    },

    /**
     * Get single supplier by ID
     */
    getSupplierById: async (id: number): Promise<Supplier> => {
        const { data } = await axios.get(`${BASE_URL}/${id}`);
        return data.data;
    },

    /**
     * Create new supplier
     */
    createSupplier: async (input: CreateSupplierInput): Promise<Supplier> => {
        const { data } = await axios.post(BASE_URL, input);
        return data.data;
    },

    /**
     * Update supplier
     */
    updateSupplier: async (id: number, input: UpdateSupplierInput): Promise<Supplier> => {
        const { data } = await axios.put(`${BASE_URL}/${id}`, input);
        return data.data;
    },

    /**
     * Delete supplier (soft delete)
     */
    deleteSupplier: async (id: number): Promise<void> => {
        await axios.delete(`${BASE_URL}/${id}`);
    },
};
