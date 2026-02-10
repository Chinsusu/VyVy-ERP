import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryOrdersAPI } from '../api/deliveryOrders';
import type { DeliveryOrderFilter, CreateDeliveryOrderRequest, UpdateDeliveryOrderRequest, ShipDeliveryOrderRequest } from '../types/deliveryOrder';

export const useDeliveryOrders = (filter: DeliveryOrderFilter) => {
    return useQuery({
        queryKey: ['delivery-orders', filter],
        queryFn: () => deliveryOrdersAPI.list(filter),
    });
};

export const useDeliveryOrder = (id: number) => {
    return useQuery({
        queryKey: ['delivery-order', id],
        queryFn: () => deliveryOrdersAPI.get(id),
        enabled: !!id,
    });
};

export const useCreateDeliveryOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateDeliveryOrderRequest) => deliveryOrdersAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
        },
    });
};

export const useUpdateDeliveryOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateDeliveryOrderRequest }) =>
            deliveryOrdersAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
            queryClient.invalidateQueries({ queryKey: ['delivery-order', id] });
        },
    });
};

export const useShipDeliveryOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ShipDeliveryOrderRequest }) =>
            deliveryOrdersAPI.ship(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
            queryClient.invalidateQueries({ queryKey: ['delivery-order', id] });
        },
    });
};

export const useCancelDeliveryOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deliveryOrdersAPI.cancel(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
            queryClient.invalidateQueries({ queryKey: ['delivery-order', id] });
        },
    });
};
