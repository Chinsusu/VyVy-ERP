import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '../api/alerts';

export const useAlertSummary = () => {
    const query = useQuery({
        queryKey: ['alerts', 'summary'],
        queryFn: alertsApi.getSummary,
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
        staleTime: 2 * 60 * 1000,
    });

    return {
        summary: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refresh: () => query.refetch(),
    };
};

export const useLowStockAlerts = () => {
    return useQuery({
        queryKey: ['alerts', 'low-stock'],
        queryFn: alertsApi.getLowStock,
        staleTime: 2 * 60 * 1000,
    });
};

export const useExpiringSoonAlerts = (days = 30) => {
    return useQuery({
        queryKey: ['alerts', 'expiring-soon', days],
        queryFn: () => alertsApi.getExpiringSoon(days),
        staleTime: 2 * 60 * 1000,
    });
};
