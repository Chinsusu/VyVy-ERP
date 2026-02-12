import { Link } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import {
    Package, Users, Warehouse,
    ShoppingCart, ClipboardCheck, FileText, Truck, RefreshCcw,
    AlertTriangle, Calendar, DollarSign, TrendingUp, BarChart2,
    ArrowRight, Activity, BoxesIcon, ArrowLeftRight
} from 'lucide-react';
import { format } from 'date-fns';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function DashboardPage() {
    const { stats, isLoading, refresh } = useDashboard();

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    if (isLoading && !stats) {
        return (
            <div>
                <div className="mb-6">
                    <div className="skeleton h-8 w-48 rounded-lg mb-2" />
                    <div className="skeleton h-4 w-72 rounded" />
                </div>
                <LoadingSkeleton variant="card" count={8} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
                    <p className="text-sm text-slate-500">
                        Overview of your warehouse operations
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {stats?.last_updated_at && (
                        <span className="text-xs text-slate-400">
                            Updated {format(new Date(stats.last_updated_at), 'HH:mm:ss')}
                        </span>
                    )}
                    <button
                        onClick={refresh}
                        disabled={isLoading}
                        className="btn btn-secondary btn-sm"
                        title="Refresh"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Inventory Value"
                    value={stats ? currencyFormatter.format(stats.inventory_value) : '$0'}
                    icon={<DollarSign className="w-5 h-5" />}
                    color="emerald"
                />
                <StatCard
                    title="Pending GRNs"
                    value={stats?.pending_grns ?? 0}
                    icon={<ClipboardCheck className="w-5 h-5" />}
                    color="amber"
                    link="/grns"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats?.low_stock_count ?? 0}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    color="rose"
                    link="/reports/low-stock"
                    alert={(stats?.low_stock_count ?? 0) > 0}
                />
                <StatCard
                    title="Expiring Soon"
                    value={stats?.expiring_soon_count ?? 0}
                    icon={<Calendar className="w-5 h-5" />}
                    color="orange"
                    link="/reports/expiring-soon"
                    alert={(stats?.expiring_soon_count ?? 0) > 0}
                />
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" />
                        Reports & Analytics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ReportCard
                            to="/reports/stock-movement"
                            icon={<Activity className="w-5 h-5 text-indigo-500" />}
                            title="Stock Movement"
                            desc="Incoming, outgoing, and adjustment history"
                        />
                        <ReportCard
                            to="/reports/inventory-value"
                            icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
                            title="Inventory Valuation"
                            desc="Stock value by category and warehouse"
                        />
                        <ReportCard
                            to="/reports/low-stock"
                            icon={<TrendingUp className="w-5 h-5 text-rose-500" />}
                            title="Low Stock Report"
                            desc="Items below reorder point"
                        />
                        <ReportCard
                            to="/reports/expiring-soon"
                            icon={<Calendar className="w-5 h-5 text-orange-500" />}
                            title="Expiring Items"
                            desc="Batches expiring within period"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" />
                        Quick Access
                    </h3>
                    <div className="space-y-2">
                        <QuickLink to="/purchase-orders" label="Purchase Orders" icon={<ShoppingCart className="w-4 h-4" />} count={stats?.total_purchase_orders} />
                        <QuickLink to="/material-requests" label="Material Requests" icon={<FileText className="w-4 h-4" />} count={stats?.total_material_requests} />
                        <QuickLink to="/delivery-orders" label="Delivery Orders" icon={<Truck className="w-4 h-4" />} count={stats?.total_delivery_orders} />
                        <QuickLink to="/inventory/adjustments" label="Adjustments" icon={<BoxesIcon className="w-4 h-4" />} />
                        <QuickLink to="/inventory/transfers" label="Transfers" icon={<ArrowLeftRight className="w-4 h-4" />} />
                    </div>
                </div>
            </div>

            {/* Master Data */}
            <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Master Data</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MasterDataCard to="/materials" icon={<Package className="w-5 h-5 text-violet-500" />} label="Materials" />
                    <MasterDataCard to="/suppliers" icon={<Users className="w-5 h-5 text-blue-500" />} label="Suppliers" />
                    <MasterDataCard to="/warehouses" icon={<Warehouse className="w-5 h-5 text-teal-500" />} label="Warehouses" />
                    <MasterDataCard to="/finished-products" icon={<Package className="w-5 h-5 text-amber-500" />} label="Products" />
                </div>
            </div>
        </div>
    );
}

/* ═══ Sub-components ═══ */

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'emerald' | 'amber' | 'rose' | 'orange' | 'indigo' | 'blue' | 'purple' | 'cyan';
    link?: string;
    alert?: boolean;
}

const colorMap: Record<string, { bg: string; iconBg: string; iconText: string; accent: string }> = {
    emerald: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', accent: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconText: 'text-amber-600', accent: 'bg-amber-500' },
    rose: { bg: 'bg-rose-50', iconBg: 'bg-rose-100', iconText: 'text-rose-600', accent: 'bg-rose-500' },
    orange: { bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconText: 'text-orange-600', accent: 'bg-orange-500' },
    indigo: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', accent: 'bg-indigo-500' },
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconText: 'text-blue-600', accent: 'bg-blue-500' },
    purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconText: 'text-purple-600', accent: 'bg-purple-500' },
    cyan: { bg: 'bg-cyan-50', iconBg: 'bg-cyan-100', iconText: 'text-cyan-600', accent: 'bg-cyan-500' },
};

function StatCard({ title, value, icon, color, link, alert }: StatCardProps) {
    const c = colorMap[color];
    const Content = (
        <div className={`card card-hover overflow-hidden ${alert ? 'ring-2 ring-rose-200' : ''}`}>
            <div className={`h-1 ${c.accent}`} />
            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${c.iconBg}`}>
                        <span className={c.iconText}>{icon}</span>
                    </div>
                    {alert && (
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                        </span>
                    )}
                </div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );

    return link ? <Link to={link}>{Content}</Link> : Content;
}

function ReportCard({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
    return (
        <Link
            to={to}
            className="card card-hover p-4 flex items-start gap-3 group"
        >
            <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-violet-50 transition-colors shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-violet-700 transition-colors">{title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
        </Link>
    );
}

function QuickLink({ to, label, icon, count }: { to: string; label: string; icon: React.ReactNode; count?: number }) {
    return (
        <Link
            to={to}
            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-violet-200 hover:bg-violet-50/30 transition-all group"
        >
            <div className="flex items-center gap-3">
                <span className="text-slate-400 group-hover:text-violet-500 transition-colors">{icon}</span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-violet-800">{label}</span>
            </div>
            {count !== undefined && (
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                    {count}
                </span>
            )}
        </Link>
    );
}

function MasterDataCard({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            to={to}
            className="card card-hover p-4 flex flex-col items-center gap-2 group"
        >
            <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-violet-50 transition-colors">
                {icon}
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700 transition-colors">{label}</span>
        </Link>
    );
}
