import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LogOut, User } from 'lucide-react';

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
                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to VyVy ERP!</h2>
                    <p className="text-gray-600 mb-6">
                        You are now logged in as <span className="font-semibold">{user?.full_name}</span> ({user?.email}).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card bg-primary-50 border border-primary-200">
                            <h3 className="font-semibold text-primary-900 mb-2">Materials</h3>
                            <p className="text-sm text-primary-700">Manage raw materials and inventory</p>
                        </div>

                        <div className="card bg-success-50 border border-success-200">
                            <h3 className="font-semibold text-success-900 mb-2">Purchase Orders</h3>
                            <p className="text-sm text-success-700">Create and track purchase orders</p>
                        </div>

                        <div className="card bg-info-50 border border-info-200">
                            <h3 className="font-semibold text-info-900 mb-2">Stock Management</h3>
                            <p className="text-sm text-info-700">Track stock levels and movements</p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-md">
                        <p className="text-sm text-warning-800">
                            <strong>Note:</strong> This is Phase 1 of the ERP system. More features will be added in upcoming phases.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
