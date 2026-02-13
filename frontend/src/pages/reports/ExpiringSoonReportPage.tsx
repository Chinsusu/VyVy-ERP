import { useState, useEffect } from 'react';
import { reportApi } from '../../api/reports';
import type { ExpiringSoonReportRow, ReportFilter } from '../../types/report';
import { useWarehouses } from '../../hooks/useWarehouses';
import { Search, Download, ArrowLeft, Loader2, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import type { Warehouse } from '../../types/warehouse';

export default function ExpiringSoonReportPage() {
    const { data: warehouseResponse } = useWarehouses();
    const warehouses = warehouseResponse?.data || [];
    const [data, setData] = useState<ExpiringSoonReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<ReportFilter>({
        days: 30
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const reportData = await reportApi.getExpiringSoon(filters);
            setData(reportData);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch report data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams();
        if (filters.warehouse_id) queryParams.append('warehouse_id', filters.warehouse_id.toString());
        if (filters.days) queryParams.append('days', filters.days.toString());
        queryParams.append('export', 'csv');

        window.open(`${import.meta.env.VITE_API_URL}/reports/expiring-soon?${queryParams.toString()}`, '_blank');
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-slate-900">Expiring Items Report</h1>
                        <p className="text-slate-500 text-premium-sm">Track batches that are nearing their expiration date</p>
                    </div>
                </div>
                <button
                    onClick={handleExport}
                    className="btn-outline bg-white"
                    disabled={data.length === 0}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </button>
            </div>

            <div className="card p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                        <select
                            className="input w-full"
                            value={filters.days}
                            onChange={(e) => setFilters({ ...filters, days: Number(e.target.value) })}
                        >
                            <option value={30}>Next 30 Days</option>
                            <option value={60}>Next 60 Days</option>
                            <option value={90}>Next 90 Days</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                        <select
                            className="input w-full"
                            value={filters.warehouse_id || ''}
                            onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value ? Number(e.target.value) : undefined })}
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map((w: Warehouse) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Search
                    </button>
                </form>
            </div>

            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Item Name</th>
                                <th>Warehouse</th>
                                <th>Batch Number</th>
                                <th className="text-right">Quantity</th>
                                <th>Expiry Date</th>
                                <th>Days Remaining</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                                        <p className="mt-2 text-gray-500">Scanning batch records...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-500">
                                        No items expiring within the selected period.
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={`${row.item_code}-${row.batch_number}-${idx}`}>
                                        <td className="font-semibold text-gray-900">{row.item_code}</td>
                                        <td className="max-w-[180px] truncate">{row.item_name}</td>
                                        <td>{row.warehouse_name}</td>
                                        <td><code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{row.batch_number}</code></td>
                                        <td className="text-right font-medium">{row.quantity} {row.unit}</td>
                                        <td>
                                            <div className="flex items-center gap-1.5 text-gray-900">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {format(parseISO(row.expiry_date), 'MMM dd, yyyy')}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5 font-bold text-orange-600">
                                                <Clock className="w-3.5 h-3.5" />
                                                {row.days_to_expiry} days
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${row.days_to_expiry < 15 ? 'badge-danger' : 'badge-warning'}`}>
                                                {row.days_to_expiry < 15 ? 'Critical' : 'Attention'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
