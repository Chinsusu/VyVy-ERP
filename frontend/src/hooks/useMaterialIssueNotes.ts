import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialIssueNotesAPI } from '../api/materialIssueNotes';
import type {
    MaterialIssueNoteFilters,
    CreateMaterialIssueNoteInput
} from '../types/materialIssueNote';

export const useMaterialIssueNotes = (filters?: MaterialIssueNoteFilters) => {
    return useQuery({
        queryKey: ['material-issue-notes', filters],
        queryFn: () => materialIssueNotesAPI.getMaterialIssueNotes(filters),
    });
};

export const useMaterialIssueNote = (id: number) => {
    return useQuery({
        queryKey: ['material-issue-note', id],
        queryFn: () => materialIssueNotesAPI.getMaterialIssueNoteById(id),
        enabled: !!id,
    });
};

export const useCreateMaterialIssueNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateMaterialIssueNoteInput) =>
            materialIssueNotesAPI.createMaterialIssueNote(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['material-issue-notes'] });
            queryClient.invalidateQueries({ queryKey: ['material-requests'] });
        },
    });
};

export const usePostMaterialIssueNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => materialIssueNotesAPI.postMaterialIssueNote(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['material-issue-notes'] });
            queryClient.invalidateQueries({ queryKey: ['material-issue-note', id] });
            queryClient.invalidateQueries({ queryKey: ['stock-balance'] });
            queryClient.invalidateQueries({ queryKey: ['material-requests'] });
        },
    });
};

export const useCancelMaterialIssueNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => materialIssueNotesAPI.cancelMaterialIssueNote(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['material-issue-notes'] });
            queryClient.invalidateQueries({ queryKey: ['material-issue-note', id] });
        },
    });
};
