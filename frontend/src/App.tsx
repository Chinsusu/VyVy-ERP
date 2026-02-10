import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MaterialListPage from './pages/materials/MaterialListPage';
import MaterialCreatePage from './pages/materials/MaterialCreatePage';
import MaterialEditPage from './pages/materials/MaterialEditPage';
import MaterialDetailPage from './pages/materials/MaterialDetailPage';
import SupplierListPage from './pages/suppliers/SupplierListPage';
import SupplierCreatePage from './pages/suppliers/SupplierCreatePage';
import SupplierEditPage from './pages/suppliers/SupplierEditPage';
import SupplierDetailPage from './pages/suppliers/SupplierDetailPage';
import WarehouseListPage from './pages/warehouses/WarehouseListPage';
import WarehouseCreatePage from './pages/warehouses/WarehouseCreatePage';
import WarehouseEditPage from './pages/warehouses/WarehouseEditPage';
import WarehouseDetailPage from './pages/warehouses/WarehouseDetailPage';
import FinishedProductListPage from './pages/finished-products/FinishedProductListPage';
import FinishedProductCreatePage from './pages/finished-products/FinishedProductCreatePage';
import FinishedProductEditPage from './pages/finished-products/FinishedProductEditPage';
import FinishedProductDetailPage from './pages/finished-products/FinishedProductDetailPage';
import PurchaseOrderListPage from './pages/purchase-orders/PurchaseOrderListPage';
import PurchaseOrderCreatePage from './pages/purchase-orders/PurchaseOrderCreatePage';
import PurchaseOrderEditPage from './pages/purchase-orders/PurchaseOrderEditPage';
import PurchaseOrderDetailPage from './pages/purchase-orders/PurchaseOrderDetailPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Materials Routes */}
            <Route path="/materials" element={<MaterialListPage />} />
            <Route path="/materials/new" element={<MaterialCreatePage />} />
            <Route path="/materials/:id" element={<MaterialDetailPage />} />
            <Route path="/materials/:id/edit" element={<MaterialEditPage />} />

            {/* Suppliers Routes */}
            <Route path="/suppliers" element={<SupplierListPage />} />
            <Route path="/suppliers/new" element={<SupplierCreatePage />} />
            <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
            <Route path="/suppliers/:id/edit" element={<SupplierEditPage />} />

            {/* Warehouses Routes */}
            <Route path="/warehouses" element={<WarehouseListPage />} />
            <Route path="/warehouses/new" element={<WarehouseCreatePage />} />
            <Route path="/warehouses/:id" element={<WarehouseDetailPage />} />
            <Route path="/warehouses/:id/edit" element={<WarehouseEditPage />} />

            {/* Finished Products Routes */}
            <Route path="/finished-products" element={<FinishedProductListPage />} />
            <Route path="/finished-products/new" element={<FinishedProductCreatePage />} />
            <Route path="/finished-products/:id" element={<FinishedProductDetailPage />} />
            <Route path="/finished-products/:id/edit" element={<FinishedProductEditPage />} />

            {/* Purchase Orders Routes */}
            <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
            <Route path="/purchase-orders/new" element={<PurchaseOrderCreatePage />} />
            <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
            <Route path="/purchase-orders/:id/edit" element={<PurchaseOrderEditPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
