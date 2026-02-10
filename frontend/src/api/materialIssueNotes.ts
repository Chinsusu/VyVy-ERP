import axios from 'axios';
import type {
    MaterialIssueNote,
    CreateMaterialIssueNoteInput,
    MaterialIssueNoteFilters,
    MaterialIssueNoteListResponse,
} from '../types/materialIssueNote';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const materialIssueNotesAPI = {
    // Get all material issue notes with optional filters
    getMaterialIssueNotes: async (filters?: MaterialIssueNoteFilters): Promise<MaterialIssueNoteListResponse> => {
        const response = await axios.get(`${API_BASE_URL}/material-issue-notes`, {
            params: filters,
            headers: getAuthHeader(),
        });
        return response.data;
    },

    // Get material issue note by ID
    getMaterialIssueNoteById: async (id: number): Promise<MaterialIssueNote> => {
        const response = await axios.get(`${API_BASE_URL}/material-issue-notes/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },

    // Create new material issue note
    createMaterialIssueNote: async (input: CreateMaterialIssueNoteInput): Promise<MaterialIssueNote> => {
        const response = await axios.post(`${API_BASE_URL}/material-issue-notes`, input, {
            headers: getAuthHeader(),
        });
        return response.data.data;
    },

    // Post material issue note (confirm issuance)
    postMaterialIssueNote: async (id: number): Promise<void> => {
        await axios.post(`${API_BASE_URL}/material-issue-notes/${id}/post`, {}, {
            headers: getAuthHeader(),
        });
    },

    // Cancel material issue note
    cancelMaterialIssueNote: async (id: number): Promise<void> => {
        await axios.post(`${API_BASE_URL}/material-issue-notes/${id}/cancel`, {}, {
            headers: getAuthHeader(),
        });
    },
};
