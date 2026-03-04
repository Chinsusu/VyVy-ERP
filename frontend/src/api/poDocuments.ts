import axios from '../lib/axios';

export interface PODocument {
    id: number;
    po_id: number;
    file_name: string;
    original_name: string;
    file_size: number;
    mime_type: string;
    uploaded_by?: number;
    created_at: string;
}

export const poDocumentsAPI = {
    list: async (poId: number): Promise<PODocument[]> => {
        const { data } = await axios.get(`/purchase-orders/${poId}/documents`);
        return data.data;
    },

    upload: async (poId: number, file: File): Promise<PODocument> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await axios.post(`/purchase-orders/${poId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data;
    },

    delete: async (poId: number, docId: number): Promise<void> => {
        await axios.delete(`/purchase-orders/${poId}/documents/${docId}`);
    },

    getDownloadUrl: (doc: PODocument): string => {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        return `${apiBase}/uploads/po_documents/${doc.file_name}`;
    },
};
