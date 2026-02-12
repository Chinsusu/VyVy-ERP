import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { reportApi } from '../../api/reports';
import type { InventoryValueReportRow, ReportFilter } from '../../types/report';
import { useWarehouses } from '../../hooks/useWarehouses';
import { Search, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Warehouse } from '../../types/warehouse';

export default function InventoryValueReportPage() {
    const { t } = useTranslation('reports');
    const { t: tc } = useTranslation('common');
    const { data: warehouseResponse } = useWarehouses();
    const warehouses = warehouseResponse?.data || [];
    const [data, setData] = useState<InventoryValueReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<ReportFilter>({});

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const reportData = await reportApi.getInventoryValue(filters);
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

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const totalValue = data.reduce((sum, row) => sum + row.total_value, 0);

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Inventory Valuation Report</h1>
                        <p className="text-gray-500">Current financial value of physical inventory</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.error('PDF Export is coming soon. Please use CSV for now.');
                        }}
                        className="btn-outline bg-white"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </button>
                    <button
                        onClick={() => {
                            const queryParams = new URLSearchParams();
                            if (filters.warehouse_id) queryParams.append('warehouse_id', filters.warehouse_id.toString());
                            queryParams.append('export', 'csv');
                            window.open(`${import.meta.env.VITE_API_URL}/reports/inventory-value?${queryParams.toString()}`, '_blank');
                        }}
                        className="btn-outline bg-white"
                        disabled={data.length === 0}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <div className="lg:col-span-3">
                    <div className="card p-4">
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
                </div>

                <div className="card p-5 bg-primary-600 text-white flex flex-col justify-center">
                    <p className="text-primary-100 text-sm font-medium">Total Inventory Value</p>
                    <p className="text-2xl font-bold mt-1">{currencyFormatter.format(totalValue)}</p>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Warehouse</th>
                                <th className="text-right">Quantity</th>
                                <th>Unit</th>
                                <th className="text-right">Unit Cost</th>
                                <th className="text-right">Total Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                                        <p className="mt-2 text-gray-500">Calculating values...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-500">
                                        No inventory found.
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={`${row.item_code}-${row.warehouse_name}-${idx}`}>
                                        <td className="font-semibold text-gray-900">{row.item_code}</td>
                                        <td className="max-w-[200px] truncate">{row.item_name}</td>
                                        <td>
                                            <span className="badge badge-blue capitalize">{row.category}</span>
                                        </td>
                                        <td>{row.warehouse_name}</td>
                                        <td className="text-right font-medium">{row.quantity}</td>
                                        <td>{row.unit}</td>
                                        <td className="text-right">{currencyFormatter.format(row.unit_cost)}</td>
                                        <td className="text-right font-bold text-gray-900">
                                            {currencyFormatter.format(row.total_value)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {data.length > 0 && !isLoading && (
                            <tfoot>
                                <tr className="bg-gray-50 font-bold">
                                    <td colSpan={7} className="text-right py-4">Total:</td>
                                    <td className="text-right py-4 text-primary-700 text-lg">
                                        {currencyFormatter.format(totalValue)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}
