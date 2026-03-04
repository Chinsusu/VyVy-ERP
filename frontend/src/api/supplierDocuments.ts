import axios from '../lib/axios';

export interface SupplierDocument {
    id: number;
    supplier_id: number;
    file_name: string;
    original_name: string;
    file_size: number;
    mime_type: string;
    uploaded_by?: number;
    uploaded_by_user?: { id: number; username: string; full_name?: string };
    created_at: string;
}

export const supplierDocumentsAPI = {
    list: async (supplierId: number): Promise<SupplierDocument[]> => {
        const { data } = await axios.get(`/suppliers/${supplierId}/documents`);
        return data.data;
    },

    upload: async (supplierId: number, file: File): Promise<SupplierDocument> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await axios.post(`/suppliers/${supplierId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data;
    },

    delete: async (supplierId: number, docId: number): Promise<void> => {
        await axios.delete(`/suppliers/${supplierId}/documents/${docId}`);
    },

    getDownloadUrl: (doc: SupplierDocument): string => {
        // file_name format: "supplierId/filename"
        const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        return `${apiBase}/uploads/supplier_documents/${doc.file_name}`;
    },
};
