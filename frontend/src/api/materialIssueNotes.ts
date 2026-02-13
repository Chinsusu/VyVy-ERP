import axios from '../lib/axios';
import type {
    MaterialIssueNote,
    CreateMaterialIssueNoteInput,
    MaterialIssueNoteFilters,
    MaterialIssueNoteListResponse,
} from '../types/materialIssueNote';

export const materialIssueNotesAPI = {
    // Get all material issue notes with optional filters
    getMaterialIssueNotes: async (filters?: MaterialIssueNoteFilters): Promise<MaterialIssueNoteListResponse> => {
        const response = await axios.get('/material-issue-notes', { params: filters });
        return response.data;
    },

    // Get material issue note by ID
    getMaterialIssueNoteById: async (id: number): Promise<MaterialIssueNote> => {
        const response = await axios.get(`/material-issue-notes/${id}`);
        return response.data.data;
    },

    // Create new material issue note
    createMaterialIssueNote: async (input: CreateMaterialIssueNoteInput): Promise<MaterialIssueNote> => {
        const response = await axios.post('/material-issue-notes', input);
        return response.data.data;
    },

    // Post material issue note (confirm issuance)
    postMaterialIssueNote: async (id: number): Promise<void> => {
        await axios.post(`/material-issue-notes/${id}/post`, {});
    },

    // Cancel material issue note
    cancelMaterialIssueNote: async (id: number): Promise<void> => {
        await axios.post(`/material-issue-notes/${id}/cancel`, {});
    },
};
