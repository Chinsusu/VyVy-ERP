import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransfers } from '../../hooks/useInventory';
import {
    Plus, Search, Filter, ChevronLeft, ChevronRight,
    ArrowRightLeft, Clock, CheckCircle2, XCircle, MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import type { StockTransfer } from '../../types/inventory';

export default function TransferListPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading } = useTransfers({
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
    });



    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'posted':
                return <span className="badge badge-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Posted</span>;
            case 'cancelled':
                return <span className="badge badge-error flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
            case 'draft':
                return <span className="badge badge-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Draft</span>;
            case 'in_transit':
                return <span className="badge badge-primary flex items-center gap-1"><ArrowRightLeft className="w-3 h-3 animate-pulse" /> In Transit</span>;
            default:
                return <span className="badge bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <div className="animate-fade-in text-slate-900">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Stock Transfers</h2>
                    <p className="text-gray-600">Move inventory between warehouses</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/inventory/adjustments" className="btn-outline">
                        Adjustments
                    </Link>
                    <Link to="/inventory/transfers/new" className="btn-primary">
                        <Plus className="w-4 h-4" />
                        New Transfer
                    </Link>
                </div>
            </div>

            <div className="card mb-6">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transfer #..."
                            className="input pl-10 w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-outline">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="card shadow-md">
                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th>Transfer Number</th>
                                <th>Date</th>
                                <th>From → To</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading transfers...</td>
                                </tr>
                            ) : data?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No transfers found.</td>
                                </tr>
                            ) : (
                                data?.data.map((st: StockTransfer) => (
                                    <tr key={st.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link to={`/inventory/transfers/${st.id}`} className="font-semibold text-primary-600 hover:underline">
                                                {st.transfer_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            {format(new Date(st.transfer_date), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-900">{st.from_warehouse_name}</span>
                                                <ArrowRightLeft className="w-3 h-3 text-gray-400" />
                                                <span className="text-gray-900">{st.to_warehouse_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(st.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                                <MoreVertical className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {data && data.total > pageSize && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, data.total)}</span> of <span className="font-medium">{data.total}</span> results
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 border border-gray-200 rounded-md disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage * pageSize >= data.total}
                            className="p-1.5 border border-gray-200 rounded-md disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
