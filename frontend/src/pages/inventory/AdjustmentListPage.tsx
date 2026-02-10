import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdjustments } from '../../hooks/useInventory';
import { useAuthStore } from '../../stores/authStore';
import {
    Plus, Search, Filter, ChevronLeft, ChevronRight,
    Clock, CheckCircle2, XCircle, MoreVertical,
    LogOut, User, Home
} from 'lucide-react';
import { format } from 'date-fns';
import type { StockAdjustment } from '../../types/inventory';

export default function AdjustmentListPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading } = useAdjustments({
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'posted':
                return <span className="badge badge-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Posted</span>;
            case 'cancelled':
                return <span className="badge badge-error flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
            case 'draft':
                return <span className="badge badge-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Draft</span>;
            case 'approved':
                return <span className="badge badge-primary flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
            default:
                return <span className="badge bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="text-gray-500 hover:text-primary-600 transition-colors">
                                <Home className="w-5 h-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-primary-600">Inventory & Stock</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-500" />
                                <div className="text-sm hidden sm:block">
                                    <p className="font-medium text-gray-900">{user?.full_name}</p>
                                    <p className="text-gray-500">{user?.role}</p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="btn-outline py-1.5">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Stock Adjustments</h2>
                        <p className="text-gray-600">Manage and track inventory corrections</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/inventory/transfers" className="btn-outline">
                            Transfers
                        </Link>
                        <Link to="/inventory/adjustments/new" className="btn-primary">
                            <Plus className="w-4 h-4" />
                            New Adjustment
                        </Link>
                    </div>
                </div>

                <div className="card mb-6">
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search adjustment #..."
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

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Adjustment Number</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Warehouse</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading adjustments...</td>
                                    </tr>
                                ) : data?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No adjustments found.</td>
                                    </tr>
                                ) : (
                                    data?.data.map((sa: StockAdjustment) => (
                                        <tr key={sa.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link to={`/inventory/adjustments/${sa.id}`} className="font-semibold text-primary-600 hover:underline">
                                                    {sa.adjustment_number}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                {format(new Date(sa.adjustment_date), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                                {sa.warehouse_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm capitalize">
                                                {sa.adjustment_type.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(sa.status)}
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
            </main>
        </div>
    );
}
