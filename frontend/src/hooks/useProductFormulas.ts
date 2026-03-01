import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { finishedProductsAPI } from '../api/finishedProducts';
import type { CreateFormulaInput, UpdateFormulaInput } from '../types/finishedProduct';

// Query key factory
export const formulaKeys = {
    all: (productId: number) => ['finished-products', productId, 'formulas'] as const,
    detail: (productId: number, formulaId: number) =>
        ['finished-products', productId, 'formulas', formulaId] as const,
};

// Lấy danh sách công thức của 1 sản phẩm
export function useProductFormulas(productId: number) {
    return useQuery({
        queryKey: formulaKeys.all(productId),
        queryFn: () => finishedProductsAPI.getFormulas(productId),
        enabled: !!productId,
    });
}

// Tạo công thức mới
export function useCreateFormula(productId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateFormulaInput) =>
            finishedProductsAPI.createFormula(productId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: formulaKeys.all(productId) });
        },
    });
}

// Cập nhật công thức
export function useUpdateFormula(productId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ formulaId, input }: { formulaId: number; input: UpdateFormulaInput }) =>
            finishedProductsAPI.updateFormula(productId, formulaId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: formulaKeys.all(productId) });
        },
    });
}

// Xoá công thức
export function useDeleteFormula(productId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formulaId: number) =>
            finishedProductsAPI.deleteFormula(productId, formulaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: formulaKeys.all(productId) });
        },
    });
}
