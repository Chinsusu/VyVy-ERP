import { useState, useEffect } from 'react';
import { reportApi } from '../../api/reports';
import type { StockMovementReportRow, ReportFilter } from '../../types/report';
import { useWarehouses } from '../../hooks/useWarehouses';
import { Search, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { Warehouse } from '../../types/warehouse';

export default function StockMovementReportPage() {
    const { data: warehouseResponse } = useWarehouses();
    const warehouses = warehouseResponse?.data || [];
    const [data, setData] = useState<StockMovementReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<ReportFilter>({
        start_date: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const reportData = await reportApi.getStockMovement(filters);
            setData(reportData);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch report data');
        } finally {
            setIsLoading(false);
        }
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
                        <h1 className="text-2xl font-bold text-gray-900">Stock Movement Report</h1>
                        <p className="text-gray-500">Track all inventory changes for items</p>
                    </div>
                </div>
                <button className="btn-outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </button>
            </div>

            <div className="card p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            className="input w-full"
                            value={filters.start_date}
                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            className="input w-full"
                            value={filters.end_date}
                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                        />
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

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Item Name</th>
                                <th>Warehouse</th>
                                <th>Unit</th>
                                <th className="text-right">Received</th>
                                <th className="text-right">Issued</th>
                                <th className="text-right">Adjusted</th>
                                <th className="text-right">Transferred</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                                        <p className="mt-2 text-gray-500">Loading report data...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-500">
                                        No movement records found for the selected period.
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={`${row.item_code}-${row.warehouse_name}-${idx}`}>
                                        <td className="font-medium text-gray-900">{row.item_code}</td>
                                        <td>{row.item_name}</td>
                                        <td>{row.warehouse_name}</td>
                                        <td><span className="badge badge-gray">{row.unit}</span></td>
                                        <td className="text-right text-emerald-600 font-medium">+{row.received_qty}</td>
                                        <td className="text-right text-rose-600 font-medium">-{row.issued_qty}</td>
                                        <td className={`text-right font-medium ${row.adjusted_qty >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                            {row.adjusted_qty > 0 ? '+' : ''}{row.adjusted_qty}
                                        </td>
                                        <td className="text-right text-gray-600 italic">
                                            {row.transferred_qty > 0 ? '+' : ''}{row.transferred_qty}
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
