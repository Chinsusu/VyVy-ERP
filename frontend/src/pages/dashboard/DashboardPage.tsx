import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LogOut, User, Package, Users, Warehouse, ArrowRight, ShoppingCart, ClipboardCheck, FileText, Truck } from 'lucide-react';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary-600">VyVy ERP</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-500" />
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{user?.full_name}</p>
                                    <p className="text-gray-500">{user?.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn-outline"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to VyVy ERP!</h2>
                    <p className="text-gray-600">
                        You are logged in as <span className="font-semibold">{user?.full_name}</span> ({user?.email}).
                    </p>
                </div>

                {/* Module Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Materials Module */}
                    <Link
                        to="/materials"
                        className="card card-hover p-6 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary-600/10 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                                <Package className="w-6 h-6 text-primary-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials</h3>
                        <p className="text-gray-600 text-sm">Manage raw materials and ingredients</p>
                    </Link>

                    {/* Suppliers Module */}
                    <Link
                        to="/suppliers"
                        className="card card-hover p-6 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary-600/10 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                                <Users className="w-6 h-6 text-primary-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Suppliers</h3>
                        <p className="text-gray-600 text-sm">Manage suppliers and vendors</p>
                    </Link>

                    {/* Warehouses Module */}
                    <Link
                        to="/warehouses"
                        className="card card-hover p-6 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary-600/10 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                                <Warehouse className="w-6 h-6 text-primary-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Warehouses</h3>
                        <p className="text-gray-600 text-sm">Manage warehouse facilities and locations</p>
                    </Link>

                    {/* Finished Products Module */}
                    <Link
                        to="/finished-products"
                        className="card card-hover p-6 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary-600/10 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                                <Package className="w-6 h-6 text-primary-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Finished Products</h3>
                        <p className="text-gray-600 text-sm">Manage finished products and inventory</p>
                    </Link>

                    {/* Purchase Orders Module */}
                    <Link
                        to="/purchase-orders"
                        className="card card-hover p-6 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary-600/10 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                                <ShoppingCart className="w-6 h-6 text-primary-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Orders</h3>
                        <p className="text-gray-600 text-sm">Manage procurement and supplier orders</p>
                    </Link>

                    {/* Goods Receipt Module */}
                    <Link
                        to="/grns"
                        className="card card-hover p-6 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary-600/10 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                                <ClipboardCheck className="w-6 h-6 text-primary-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Goods Receipt</h3>
                        <p className="text-gray-600 text-sm">Receive goods and manage quality control</p>
                    </Link>

                    {/* Material Requests Module */}
                    <Link
                        to="/material-requests"
                        className="card card-hover p-6 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary-600/10 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                                <FileText className="w-6 h-6 text-primary-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Material Requests</h3>
                        <p className="text-gray-600 text-sm">Request materials for production</p>
                    </Link>

                    {/* Material Issue Notes Module */}
                    <Link
                        to="/material-issue-notes"
                        className="card card-hover p-6 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary-600/10 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                                <ClipboardCheck className="w-6 h-6 text-primary-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Material Issues</h3>
                        <p className="text-gray-600 text-sm">Issue materials to production</p>
                    </Link>

                    {/* Delivery Orders Module */}
                    <Link
                        to="/delivery-orders"
                        className="card card-hover p-6 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary-600/10 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                                <Truck className="w-6 h-6 text-primary-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales & Delivery</h3>
                        <p className="text-gray-600 text-sm">Manage product shipments to customers</p>
                    </Link>

                    {/* Inventory Management Module */}
                    <Link
                        to="/inventory/adjustments"
                        className="card card-hover p-6 group border-l-4 border-l-primary-500"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary-600/10 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                                <ClipboardCheck className="w-6 h-6 text-primary-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            Inventory & Stock
                            <span className="badge badge-success text-[10px] py-0 px-1">NEW</span>
                        </h3>
                        <p className="text-gray-600 text-sm">Stock adjustments, counts, and transfers</p>
                    </Link>
                </div>

                <div className="mt-8 p-4 bg-primary-50 border border-primary-200 rounded-md">
                    <p className="text-sm text-primary-800">
                        <strong>Note:</strong> We are in Phase 6 (Inventory Management). Stock Adjustments and Transfers are now active.
                    </p>
                </div>
            </main>
        </div>
    );
}
