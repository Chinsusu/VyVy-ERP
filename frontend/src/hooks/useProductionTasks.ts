import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import type { ProductionTask, CreateProductionTaskInput, UpdateProductionTaskInput } from '../types/materialRequest';

export function useProductionTasks(mrId: number | undefined) {
    return useQuery<ProductionTask[]>({
        queryKey: ['production-tasks', mrId],
        queryFn: async () => {
            const res = await api.get(`/material-requests/${mrId}/tasks`);
            return res.data.data || [];
        },
        enabled: !!mrId,
        staleTime: 30_000,
    });
}

export function useCreateProductionTask(mrId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateProductionTaskInput) => {
            const res = await api.post(`/material-requests/${mrId}/tasks`, input);
            return res.data.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['production-tasks', mrId] });
        },
    });
}

export function useUpdateProductionTask(mrId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ taskId, input }: { taskId: number; input: UpdateProductionTaskInput }) => {
            const res = await api.put(`/material-requests/${mrId}/tasks/${taskId}`, input);
            return res.data.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['production-tasks', mrId] });
        },
    });
}

export function useDeleteProductionTask(mrId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (taskId: number) => {
            await api.delete(`/material-requests/${mrId}/tasks/${taskId}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['production-tasks', mrId] });
        },
    });
}
