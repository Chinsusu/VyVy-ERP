import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useDashboard } from '../../hooks/useDashboard';
import { useAlertSummary } from '../../hooks/useAlerts';
import {
    LogOut, User, Package, Users, Warehouse,
    ShoppingCart, ClipboardCheck, FileText, Truck, RefreshCcw,
    AlertTriangle, Calendar, DollarSign, TrendingUp, BarChart2, Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useRef, useEffect } from 'react';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { stats, isLoading, refresh } = useDashboard();
    const { summary: alertSummary } = useAlertSummary();
    const [showAlertDropdown, setShowAlertDropdown] = useState(false);
    const alertRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
                setShowAlertDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary-600">VyVy ERP</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Alert Bell */}
                            <div className="relative" ref={alertRef}>
                                <button
                                    onClick={() => setShowAlertDropdown(!showAlertDropdown)}
                                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Alerts"
                                >
                                    <Bell className="w-5 h-5" />
                                    {(alertSummary?.total_alerts ?? 0) > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                                            {alertSummary!.total_alerts > 9 ? '9+' : alertSummary!.total_alerts}
                                        </span>
                                    )}
                                </button>

                                {showAlertDropdown && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                                        <div className="p-3 border-b border-gray-100">
                                            <h4 className="font-semibold text-gray-900 text-sm">Notifications</h4>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {(alertSummary?.low_stock_count ?? 0) > 0 && (
                                                <Link
                                                    to="/reports/low-stock"
                                                    className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setShowAlertDropdown(false)}
                                                >
                                                    <div className="p-1.5 bg-rose-100 rounded-lg">
                                                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {alertSummary!.low_stock_count} items below reorder point
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">Requires reordering</p>
                                                    </div>
                                                </Link>
                                            )}
                                            {(alertSummary?.expiring_soon_count ?? 0) > 0 && (
                                                <Link
                                                    to="/reports/expiring-soon"
                                                    className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setShowAlertDropdown(false)}
                                                >
                                                    <div className="p-1.5 bg-orange-100 rounded-lg">
                                                        <Calendar className="w-4 h-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {alertSummary!.expiring_soon_count} batches expiring soon
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">Within 30 days</p>
                                                    </div>
                                                </Link>
                                            )}
                                            {(alertSummary?.total_alerts ?? 0) === 0 && (
                                                <div className="p-4 text-center text-sm text-gray-500">
                                                    No alerts at this time
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-500" />
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{user?.full_name}</p>
                                    <p className="text-gray-500 capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn-outline py-1.5"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h2>
                        <p className="text-gray-600">
                            Welcome back, <span className="font-semibold">{user?.full_name}</span>. Here's what's happening today.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {stats?.last_updated_at && (
                            <span className="text-xs text-gray-500">
                                Last updated: {format(new Date(stats.last_updated_at), 'HH:mm:ss')}
                            </span>
                        )}
                        <button
                            onClick={refresh}
                            disabled={isLoading}
                            className="btn-outline bg-white"
                            title="Refresh Statistics"
                        >
                            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Statistics Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Inventory Value"
                        value={stats ? currencyFormatter.format(stats.inventory_value) : '...'}
                        icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
                        bgColor="bg-emerald-50"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Pending GRNs"
                        value={stats?.pending_grns ?? '...'}
                        icon={<ClipboardCheck className="w-5 h-5 text-amber-600" />}
                        bgColor="bg-amber-50"
                        isLoading={isLoading}
                        link="/grns"
                    />
                    <StatCard
                        title="Low Stock Items"
                        value={stats?.low_stock_count ?? '...'}
                        icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
                        bgColor="bg-rose-50"
                        isLoading={isLoading}
                        alert={(stats?.low_stock_count ?? 0) > 0}
                        link="/reports/low-stock"
                    />
                    <StatCard
                        title="Expiring Soon"
                        value={stats?.expiring_soon_count ?? '...'}
                        icon={<Calendar className="w-5 h-5 text-orange-600" />}
                        bgColor="bg-orange-50"
                        isLoading={isLoading}
                        alert={(stats?.expiring_soon_count ?? 0) > 0}
                        link="/reports/expiring-soon"
                    />
                    <StatCard
                        title="Purchase Orders"
                        value={stats?.total_purchase_orders ?? '...'}
                        icon={<ShoppingCart className="w-5 h-5 text-indigo-600" />}
                        bgColor="bg-indigo-50"
                        isLoading={isLoading}
                        link="/purchase-orders"
                    />
                    <StatCard
                        title="Material Requests"
                        value={stats?.total_material_requests ?? '...'}
                        icon={<FileText className="w-5 h-5 text-blue-600" />}
                        bgColor="bg-blue-50"
                        isLoading={isLoading}
                        link="/material-requests"
                    />
                    <StatCard
                        title="Delivery Orders"
                        value={stats?.total_delivery_orders ?? '...'}
                        icon={<Truck className="w-5 h-5 text-purple-600" />}
                        bgColor="bg-purple-50"
                        isLoading={isLoading}
                        link="/delivery-orders"
                    />
                    <StatCard
                        title="Goods Receipts"
                        value={stats?.pending_grns ?? '...'}
                        icon={<TrendingUp className="w-5 h-5 text-cyan-600" />}
                        bgColor="bg-cyan-50"
                        isLoading={isLoading}
                        link="/grns"
                    />
                </div>

                {/* Reports & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-primary-600" />
                            Inventory Reports
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link to="/reports/stock-movement" className="card p-5 hover:border-primary-300 transition-colors group">
                                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600">Stock Movement</h4>
                                <p className="text-sm text-gray-500">View incoming, outgoing, and adjustment history</p>
                            </Link>
                            <Link to="/reports/inventory-value" className="card p-5 hover:border-primary-300 transition-colors group">
                                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600">Inventory Valuation</h4>
                                <p className="text-sm text-gray-500">Current stock value by category and warehouse</p>
                            </Link>
                            <Link to="/reports/low-stock" className="card p-5 hover:border-primary-300 transition-colors group">
                                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600">Low Stock Report</h4>
                                <p className="text-sm text-gray-500">Items below reorder point requiring attention</p>
                            </Link>
                            <Link to="/reports/expiring-soon" className="card p-5 hover:border-primary-300 transition-colors group">
                                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600">Expiring Items</h4>
                                <p className="text-sm text-gray-500">Batches expiring within current period</p>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <RefreshCcw className="w-5 h-5 text-primary-600" />
                            Core Modules
                        </h3>
                        <div className="space-y-2">
                            <QuickLink to="/inventory/adjustments" label="Inventory & Stock" icon={<Package className="w-4 h-4" />} badge="PH6" />
                            <QuickLink to="/materials" label="Materials" icon={<Package className="w-4 h-4" />} />
                            <QuickLink to="/suppliers" label="Suppliers" icon={<Users className="w-4 h-4" />} />
                            <QuickLink to="/warehouses" label="Warehouses" icon={<Warehouse className="w-4 h-4" />} />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-start gap-3">
                    <div className="p-1 bg-primary-100 rounded text-primary-600 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm text-primary-800 font-medium">
                            Phase 7 (Reports & Dashboard) Implementation
                        </p>
                        <p className="text-xs text-primary-700 mt-0.5">
                            Interactive dashboard stats and inventory reports are now being implemented based on Phase 6 transaction data.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    isLoading?: boolean;
    link?: string;
    alert?: boolean;
}

function StatCard({ title, value, icon, bgColor, isLoading, link, alert }: StatCardProps) {
    const Content = (
        <div className={`card overflow-hidden ${link ? 'hover:border-primary-300 transition-colors cursor-pointer' : ''} ${alert ? 'border-rose-200 ring-1 ring-rose-100' : ''}`}>
            <div className={`h-1 ${bgColor.replace('50', '500')}`}></div>
            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-2xl font-bold ${isLoading ? 'animate-pulse text-gray-300' : 'text-gray-900'}`}>
                            {value}
                        </p>
                        {alert && !isLoading && (
                            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return link ? <Link to={link}>{Content}</Link> : Content;
}

function QuickLink({ to, label, icon, badge }: { to: string, label: string, icon: React.ReactNode, badge?: string }) {
    return (
        <Link
            to={to}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
        >
            <div className="flex items-center gap-3">
                <span className="text-gray-400 group-hover:text-primary-500 transition-colors">
                    {icon}
                </span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-800">{label}</span>
            </div>
            {badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-wider group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                    {badge}
                </span>
            )}
        </Link>
    );
}
