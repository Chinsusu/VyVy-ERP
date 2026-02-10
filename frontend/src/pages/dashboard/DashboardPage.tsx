import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LogOut, User, Package, Users, Warehouse, ArrowRight } from 'lucide-react';

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
                            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
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
                            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
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
                            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <Warehouse className="w-6 h-6 text-primary" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
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
                            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Finished Products</h3>
                        <p className="text-gray-600 text-sm">Manage finished products and inventory</p>
                    </Link>
                </div>

                <div className="mt-8 p-4 bg-warning-50 border border-warning-200 rounded-md">
                    <p className="text-sm text-warning-800">
                        <strong>Note:</strong> This is Phase 2 of the ERP system. More features will be added in upcoming phases.
                    </p>
                </div>
            </main>
        </div>
    );
}
