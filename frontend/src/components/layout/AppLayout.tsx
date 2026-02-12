import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useAlertSummary } from '../../hooks/useAlerts';
import { LANGUAGES } from '../../lib/i18n';
import {
    LayoutDashboard, Package, Users, Warehouse, ShoppingBag,
    ShoppingCart, ClipboardCheck, FileText, Send, Truck, Store,
    ArrowLeftRight, BarChart3, TrendingDown, Clock,
    Bell, LogOut, ChevronLeft, Menu, User,
    AlertTriangle, Calendar, BoxesIcon, Activity, Globe
} from 'lucide-react';

interface NavItem {
    labelKey: string;
    path: string;
    icon: React.ReactNode;
}

interface NavGroup {
    titleKey: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        titleKey: 'groups.overview',
        items: [
            { labelKey: 'nav.dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        ],
    },
    {
        titleKey: 'groups.masterData',
        items: [
            { labelKey: 'nav.materials', path: '/materials', icon: <Package className="w-5 h-5" /> },
            { labelKey: 'nav.finishedProducts', path: '/finished-products', icon: <ShoppingBag className="w-5 h-5" /> },
            { labelKey: 'nav.suppliers', path: '/suppliers', icon: <Users className="w-5 h-5" /> },
            { labelKey: 'nav.warehouses', path: '/warehouses', icon: <Warehouse className="w-5 h-5" /> },
        ],
    },
    {
        titleKey: 'groups.purchasing',
        items: [
            { labelKey: 'nav.purchaseOrders', path: '/purchase-orders', icon: <ShoppingCart className="w-5 h-5" /> },
            { labelKey: 'nav.goodsReceipt', path: '/grns', icon: <ClipboardCheck className="w-5 h-5" /> },
        ],
    },
    {
        titleKey: 'groups.production',
        items: [
            { labelKey: 'nav.materialRequests', path: '/material-requests', icon: <FileText className="w-5 h-5" /> },
            { labelKey: 'nav.issueNotes', path: '/material-issue-notes', icon: <Send className="w-5 h-5" /> },
        ],
    },
    {
        titleKey: 'groups.sales',
        items: [
            { labelKey: 'nav.deliveryOrders', path: '/delivery-orders', icon: <Truck className="w-5 h-5" /> },
            { labelKey: 'nav.salesChannels', path: '/sales-channels', icon: <Store className="w-5 h-5" /> },
        ],
    },
    {
        titleKey: 'groups.inventory',
        items: [
            { labelKey: 'nav.adjustments', path: '/inventory/adjustments', icon: <BoxesIcon className="w-5 h-5" /> },
            { labelKey: 'nav.transfers', path: '/inventory/transfers', icon: <ArrowLeftRight className="w-5 h-5" /> },
        ],
    },
    {
        titleKey: 'groups.reports',
        items: [
            { labelKey: 'nav.stockMovement', path: '/reports/stock-movement', icon: <Activity className="w-5 h-5" /> },
            { labelKey: 'nav.inventoryValue', path: '/reports/inventory-value', icon: <BarChart3 className="w-5 h-5" /> },
            { labelKey: 'nav.lowStock', path: '/reports/low-stock', icon: <TrendingDown className="w-5 h-5" /> },
            { labelKey: 'nav.expiringSoon', path: '/reports/expiring-soon', icon: <Clock className="w-5 h-5" /> },
        ],
    },
];

export default function AppLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [showAlertDropdown, setShowAlertDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const alertRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { summary: alertSummary } = useAlertSummary();
    const { t, i18n } = useTranslation('sidebar');

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
    const nextLang = LANGUAGES.find(l => l.code !== i18n.language) || LANGUAGES[1];

    const toggleLanguage = () => {
        i18n.changeLanguage(nextLang.code);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
                setShowAlertDropdown(false);
            }
            if (userRef.current && !userRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const totalAlerts = alertSummary?.total_alerts ?? 0;

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* ═══ Sidebar ═══ */}
            <aside
                className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 z-30 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-[260px]'
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
                    {!collapsed && (
                        <Link to="/dashboard" className="flex items-center gap-2.5 animate-fade-in">
                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                <span className="text-white font-bold text-sm">V</span>
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-slate-900 leading-none">{t('brand.name')}</h1>
                                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">{t('brand.subtitle')}</p>
                            </div>
                        </Link>
                    )}
                    {collapsed && (
                        <Link to="/dashboard" className="mx-auto">
                            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                                <span className="text-white font-bold text-sm">V</span>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto sidebar-scrollbar py-4 px-3">
                    {navGroups.map((group) => (
                        <div key={group.titleKey} className="mb-1">
                            {!collapsed && (
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-1.5 mt-3 first:mt-0">
                                    {t(group.titleKey)}
                                </p>
                            )}
                            {collapsed && <div className="my-2 border-t border-slate-100" />}
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative ${isActive
                                            ? 'bg-violet-50 text-violet-700'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        } ${collapsed ? 'justify-center px-0' : ''}`
                                    }
                                    title={collapsed ? t(item.labelKey) : undefined}
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-violet-600 rounded-r-full" />
                                            )}
                                            <span className={`shrink-0 ${isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                                {item.icon}
                                            </span>
                                            {!collapsed && <span>{t(item.labelKey)}</span>}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Language Toggle + Collapse Button */}
                <div className="border-t border-slate-100 p-3 shrink-0 space-y-1">
                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        title={`Switch to ${nextLang.label}`}
                    >
                        <Globe className="w-4 h-4" />
                        {!collapsed && <span>{currentLang.flag} {currentLang.label}</span>}
                        {collapsed && <span className="text-xs">{currentLang.flag}</span>}
                    </button>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                        {!collapsed && <span>{t('header.collapse')}</span>}
                    </button>
                </div>
            </aside>

            {/* ═══ Main Content ═══ */}
            <div
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${collapsed ? 'ml-[72px]' : 'ml-[260px]'
                    }`}
            >
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 flex items-center justify-between px-6">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2">
                        {/* Alert Bell */}
                        <div className="relative" ref={alertRef}>
                            <button
                                onClick={() => setShowAlertDropdown(!showAlertDropdown)}
                                className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title={t('header.notifications')}
                            >
                                <Bell className="w-5 h-5" />
                                {totalAlerts > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                                        {totalAlerts > 9 ? '9+' : totalAlerts}
                                    </span>
                                )}
                            </button>

                            {showAlertDropdown && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-slide-up overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                                        <h4 className="font-semibold text-slate-900 text-sm">{t('header.notifications')}</h4>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {(alertSummary?.low_stock_count ?? 0) > 0 && (
                                            <Link
                                                to="/reports/low-stock"
                                                className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                                onClick={() => setShowAlertDropdown(false)}
                                            >
                                                <div className="p-1.5 bg-rose-100 rounded-lg shrink-0">
                                                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {t('header.lowStockItems', { count: alertSummary!.low_stock_count })}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{t('header.requiresReorder')}</p>
                                                </div>
                                            </Link>
                                        )}
                                        {(alertSummary?.expiring_soon_count ?? 0) > 0 && (
                                            <Link
                                                to="/reports/expiring-soon"
                                                className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                                onClick={() => setShowAlertDropdown(false)}
                                            >
                                                <div className="p-1.5 bg-orange-100 rounded-lg shrink-0">
                                                    <Calendar className="w-4 h-4 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {t('header.batchesExpiring', { count: alertSummary!.expiring_soon_count })}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{t('header.within30Days')}</p>
                                                </div>
                                            </Link>
                                        )}
                                        {totalAlerts === 0 && (
                                            <div className="p-6 text-center text-sm text-slate-400">
                                                {t('header.noAlerts')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Separator */}
                        <div className="w-px h-6 bg-slate-200 mx-1" />

                        {/* User Menu */}
                        <div className="relative" ref={userRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                        {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-medium text-slate-700 leading-tight">{user?.full_name}</p>
                                    <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                                </div>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-slide-up overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
                                        <p className="text-xs text-slate-500">{user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => { setShowUserMenu(false); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            {t('header.profile')}
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            {t('header.signOut')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main */}
                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto page-content">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
