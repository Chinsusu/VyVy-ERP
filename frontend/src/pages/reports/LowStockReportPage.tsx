import { useState, useEffect } from 'react';
import { reportApi } from '../../api/reports';
import type { LowStockReportRow, ReportFilter } from '../../types/report';
import { useWarehouses } from '../../hooks/useWarehouses';
import { Search, Download, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Warehouse } from '../../types/warehouse';

export default function LowStockReportPage() {
    const { data: warehouseResponse } = useWarehouses();
    const warehouses = warehouseResponse?.data || [];
    const [data, setData] = useState<LowStockReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<ReportFilter>({});

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const reportData = await reportApi.getLowStock(filters);
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
        queryParams.append('export', 'csv');

        window.open(`${import.meta.env.VITE_API_URL}/reports/low-stock?${queryParams.toString()}`, '_blank');
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
                        <h1 className="text-2xl font-bold text-gray-900">Low Stock Report</h1>
                        <p className="text-gray-500">Items currently below their defined reorder point</p>
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

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Item Name</th>
                                <th>Warehouse</th>
                                <th className="text-right">Current Qty</th>
                                <th className="text-right">Reorder Point</th>
                                <th className="text-right">Shortage</th>
                                <th>Unit</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                                        <p className="mt-2 text-gray-500">Checking inventory levels...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-500">
                                        No low stock items found. All inventory levels are healthy!
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={`${row.item_code}-${row.warehouse_name}-${idx}`}>
                                        <td className="font-semibold text-gray-900">{row.item_code}</td>
                                        <td>{row.item_name}</td>
                                        <td>{row.warehouse_name}</td>
                                        <td className="text-right font-bold text-rose-600">{row.quantity}</td>
                                        <td className="text-right text-gray-600">{row.reorder_point}</td>
                                        <td className="text-right font-medium text-rose-700">
                                            {(row.reorder_point - row.quantity).toFixed(2)}
                                        </td>
                                        <td><span className="badge badge-gray">{row.unit}</span></td>
                                        <td>
                                            <span className="flex items-center gap-1 text-rose-600 font-medium text-sm">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Order Required
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
