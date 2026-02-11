import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard';
import type { DashboardStats } from '../types/dashboard';
import toast from 'react-hot-toast';

export function useDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const data = await dashboardApi.getStats();
            setStats(data);
            setError(null);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch dashboard statistics';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return {
        stats,
        isLoading,
        error,
        refresh: fetchStats,
    };
}
