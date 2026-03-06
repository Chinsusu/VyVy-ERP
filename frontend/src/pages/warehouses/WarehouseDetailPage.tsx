import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit, Trash2, Building2, MapPin, FileText,
    Plus, Warehouse as WarehouseIcon, FlaskConical, ShoppingBag, Package, Factory,
} from 'lucide-react';
import { useWarehouse, useDeleteWarehouse, useWarehouseLocations } from '../../hooks/useWarehouses';
import { useCreateLocation, useDeleteLocation } from '../../hooks/useWarehouseLocations';
import { formatLocationHierarchy } from '../../types/warehouseLocation';
import type { CreateWarehouseLocationInput } from '../../types/warehouseLocation';
import AuditLogPanel from '../../components/common/AuditLogPanel';
import { useWarehouseInventory } from '../../hooks/useWarehouseInventory';
import SearchInput from '../../components/common/SearchInput';

const WAREHOUSE_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; badge: string; subtitle: string }> = {
    lab: { label: 'Kho Lab', icon: <FlaskConical className="w-4 h-4" />, badge: 'bg-blue-100 text-blue-700', subtitle: 'Nguyên Vật Liệu' },
    commercial: { label: 'Kho Bán Hàng', icon: <ShoppingBag className="w-4 h-4" />, badge: 'bg-purple-100 text-purple-700', subtitle: 'Thành Phẩm & Bao Bì' },
    factory: { label: 'Kho Nhà Máy', icon: <Factory className="w-4 h-4" />, badge: 'bg-orange-100 text-orange-700', subtitle: 'Nguyên Liệu & Bao Bì' },
};

const LOCATION_TYPE_LABELS: Record<string, string> = {
    storage: 'Lưu trữ', picking: 'Lấy hàng',
    receiving: 'Nhận hàng', staging: 'Trung chuyển', shipping: 'Xuất hàng',
};

export default function WarehouseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const warehouseId = parseInt(id || '0', 10);

    const { data: warehouse, isLoading, error } = useWarehouse(warehouseId);
    const { data: locations } = useWarehouseLocations(warehouseId);
    const deleteWarehouse = useDeleteWarehouse();
    const createLocation = useCreateLocation();
    const deleteLocation = useDeleteLocation();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [inventorySearch, setInventorySearch] = useState('');
    const [showLocationForm, setShowLocationForm] = useState(false);
    const [locationFormData, setLocationFormData] = useState<CreateWarehouseLocationInput>({
        warehouse_id: warehouseId, code: '', name: '',
        aisle: '', rack: '', shelf: '', bin: '',
        location_type: 'storage', is_active: true, notes: '',
    });

    const { data: inventoryItems = [], isLoading: inventoryLoading } = useWarehouseInventory(warehouseId);

    const filteredInventory = inventoryItems.filter((item) => {
        if (inventorySearch) {
            const q = inventorySearch.toLowerCase();
            return item.item_name?.toLowerCase().includes(q) || item.item_code?.toLowerCase().includes(q);
        }
        return true;
    });

    const handleDeleteWarehouse = async () => {
        try {
            await deleteWarehouse.mutateAsync(warehouseId);
            navigate('/warehouses');
        } catch {
            alert('Xóa thất bại. Kho có thể đang có vị trí con.');
        }
    };

    const handleAddLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createLocation.mutateAsync(locationFormData);
            setLocationFormData({
                warehouse_id: warehouseId, code: '', name: '',
                aisle: '', rack: '', shelf: '', bin: '',
                location_type: 'storage', is_active: true, notes: '',
            });
            setShowLocationForm(false);
        } catch {
            alert('Tạo vị trí thất bại. Vui lòng thử lại.');
        }
    };

    const handleDeleteLocation = async (locationId: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa vị trí này?')) return;
        try { await deleteLocation.mutateAsync(locationId); }
        catch { alert('Xóa vị trí thất bại.'); }
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center h-64">
                <div className="text-gray-500 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    Đang tải kho hàng...
                </div>
            </div>
        );
    }

    if (error || !warehouse) {
        return (
            <div className="animate-fade-in p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error ? `Lỗi: ${(error as Error).message}` : 'Không tìm thấy kho hàng'}
                </div>
                <Link to="/warehouses" className="text-primary hover:underline flex items-center gap-2 mt-4">
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                </Link>
            </div>
        );
    }

    const typeConfig = WAREHOUSE_TYPE_CONFIG[warehouse.warehouse_type?.toLowerCase()] || WAREHOUSE_TYPE_CONFIG['other'];
    const totalQty = filteredInventory.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <div className="animate-fade-in">
            {/* Back */}
            <Link to="/warehouses" className="text-primary hover:underline flex items-center gap-2 mb-4 text-sm">
                <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">{warehouse.name}</h1>
                        {warehouse.is_active
                            ? <span className="badge badge-success">Hoạt động</span>
                            : <span className="badge badge-secondary">Dừng</span>
                        }
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.badge}`}>
                            {typeConfig.icon}
                            {typeConfig.label}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm font-mono">{warehouse.code}{typeConfig.subtitle && ` · ${typeConfig.subtitle}`}</p>
                </div>
                <div className="flex gap-2">
                    <Link to={`/warehouses/${warehouseId}/edit`} className="btn btn-secondary flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Điều chỉnh
                    </Link>
                    <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Xóa
                    </button>
                </div>
            </div>

            {/* Info Bar */}
            <div className="card mb-6">
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                    <div className="pr-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Vị trí kho</p>
                        <p className="text-lg font-bold text-primary">{locations?.length || 0}</p>
                        <p className="text-xs text-gray-500">vị trí đã thiết lập</p>
                    </div>
                    <div className="px-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tổng tồn kho</p>
                        <p className="text-lg font-bold text-gray-900">
                            {inventoryLoading ? '—' : inventoryItems.length}
                        </p>
                        <p className="text-xs text-gray-500">loại hàng hoá</p>
                    </div>
                    <div className="pl-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tổng SL</p>
                        <p className="text-lg font-bold text-gray-900">
                            {inventoryLoading ? '—' : totalQty.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                        </p>
                        <p className="text-xs text-gray-500">đơn vị</p>
                    </div>
                </div>
            </div>

            {/* 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left col (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Tồn kho */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Tồn Kho
                                {!inventoryLoading && (
                                    <span className="text-sm font-normal text-gray-400">({filteredInventory.length})</span>
                                )}
                            </h2>
                            <SearchInput
                                value={inventorySearch}
                                onChange={setInventorySearch}
                                placeholder="Tìm theo tên, mã..."
                                width="w-52"
                            />
                        </div>

                        {inventoryLoading ? (
                            <div className="flex items-center justify-center py-8 text-gray-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                Đang tải tồn kho...
                            </div>
                        ) : filteredInventory.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                {inventoryItems.length === 0 ? 'Kho chưa có hàng tồn.' : 'Không tìm thấy hàng khớp bộ lọc.'}
                            </div>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Mã</th>
                                            <th className="min-w-[180px]">Tên hàng</th>
                                            <th>Loại</th>
                                            <th className="text-right">Tồn</th>
                                            <th className="text-right">Đặt trước</th>
                                            <th className="text-right">Khả dụng</th>
                                            <th>ĐVT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInventory.map((item) => (
                                            <tr key={`${item.item_type}-${item.item_id}-${item.id}`}>
                                                <td className="font-mono text-xs text-primary">{item.item_code || `#${item.item_id}`}</td>
                                                <td className="font-medium text-gray-900">{item.item_name}</td>
                                                <td>
                                                    {item.item_type === 'material' ? (
                                                        <span className="badge bg-blue-100 text-blue-700 text-xs">Nguyên liệu</span>
                                                    ) : (
                                                        <span className="badge bg-purple-100 text-purple-700 text-xs">Thành phẩm</span>
                                                    )}
                                                </td>
                                                <td className="text-right font-semibold">
                                                    {item.quantity.toLocaleString('vi-VN', { maximumFractionDigits: 3 })}
                                                </td>
                                                <td className="text-right">
                                                    {item.reserved_quantity > 0 ? (
                                                        <span className="text-orange-600 font-medium">
                                                            {item.reserved_quantity.toLocaleString('vi-VN', { maximumFractionDigits: 3 })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    <span className={item.available_quantity <= 0 ? 'text-red-600 font-bold' : 'text-green-600 font-semibold'}>
                                                        {item.available_quantity.toLocaleString('vi-VN', { maximumFractionDigits: 3 })}
                                                    </span>
                                                </td>
                                                <td className="text-gray-500 text-sm">{item.item_unit || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Vị trí trong kho */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <WarehouseIcon className="w-5 h-5 text-primary" />
                                Vị Trí Trong Kho
                                <span className="text-sm font-normal text-gray-400">({locations?.length || 0})</span>
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowLocationForm(!showLocationForm)}
                                className="btn btn-primary btn-sm flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm Vị Trí
                            </button>
                        </div>

                        {/* Form thêm vị trí */}
                        {showLocationForm && (
                            <form onSubmit={handleAddLocation} className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="font-medium mb-3 text-sm text-gray-700">Vị Trí Mới</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <label className="label text-xs">Mã vị trí <span className="text-red-500">*</span></label>
                                        <input type="text" className="input" value={locationFormData.code}
                                            onChange={(e) => setLocationFormData({ ...locationFormData, code: e.target.value })}
                                            required placeholder="VD: A1-K1-T1" />
                                    </div>
                                    <div>
                                        <label className="label text-xs">Tên vị trí <span className="text-red-500">*</span></label>
                                        <input type="text" className="input" value={locationFormData.name}
                                            onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                                            required placeholder="VD: Khu A - Kệ 1" />
                                    </div>
                                    <div>
                                        <label className="label text-xs">Loại vị trí</label>
                                        <select className="input" value={locationFormData.location_type}
                                            onChange={(e) => setLocationFormData({ ...locationFormData, location_type: e.target.value })}>
                                            <option value="storage">Lưu trữ</option>
                                            <option value="picking">Lấy hàng</option>
                                            <option value="receiving">Nhận hàng</option>
                                            <option value="staging">Trung chuyển</option>
                                            <option value="shipping">Xuất hàng</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label text-xs">Dãy</label>
                                        <input type="text" className="input" value={locationFormData.aisle}
                                            onChange={(e) => setLocationFormData({ ...locationFormData, aisle: e.target.value })} placeholder="A1" />
                                    </div>
                                    <div>
                                        <label className="label text-xs">Kệ</label>
                                        <input type="text" className="input" value={locationFormData.rack}
                                            onChange={(e) => setLocationFormData({ ...locationFormData, rack: e.target.value })} placeholder="K1" />
                                    </div>
                                    <div>
                                        <label className="label text-xs">Tầng</label>
                                        <input type="text" className="input" value={locationFormData.shelf}
                                            onChange={(e) => setLocationFormData({ ...locationFormData, shelf: e.target.value })} placeholder="T1" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowLocationForm(false)} className="btn btn-secondary btn-sm">Hủy</button>
                                    <button type="submit" className="btn btn-primary btn-sm" disabled={createLocation.isPending}>
                                        {createLocation.isPending ? 'Đang thêm...' : 'Thêm Vị Trí'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {locations && locations.length > 0 ? (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Mã</th>
                                            <th>Tên</th>
                                            <th>Phân cấp</th>
                                            <th>Loại</th>
                                            <th className="text-center">Trạng thái</th>
                                            <th className="text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {locations.map((location) => (
                                            <tr key={location.id}>
                                                <td className="font-mono text-xs font-semibold text-primary">{location.code}</td>
                                                <td className="font-medium">{location.name}</td>
                                                <td className="text-sm text-gray-500">{formatLocationHierarchy(location)}</td>
                                                <td>
                                                    <span className="badge badge-secondary text-xs">
                                                        {LOCATION_TYPE_LABELS[location.location_type] || location.location_type}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    {location.is_active
                                                        ? <span className="badge badge-success text-xs">Hoạt động</span>
                                                        : <span className="badge badge-secondary text-xs">Dừng</span>
                                                    }
                                                </td>
                                                <td className="text-right">
                                                    <button type="button"
                                                        onClick={() => handleDeleteLocation(location.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium">
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <WarehouseIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Chưa có vị trí nào. Nhấn «Thêm Vị Trí» để tạo mới.
                            </div>
                        )}
                    </div>

                    {/* Audit Log — cuối cột trái */}
                    <AuditLogPanel tableName="warehouses" recordId={warehouse.id} />
                </div>

                {/* Right sidebar (1/3) */}
                <div className="space-y-4">

                    {/* Thông tin cơ bản */}
                    <div className="card">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" /> Thông Tin Cơ Bản
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-400">Mã kho</p>
                                <p className="font-mono font-semibold text-primary">{warehouse.code}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Loại kho</p>
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.badge}`}>
                                    {typeConfig.icon} {typeConfig.label}
                                </span>
                                {typeConfig.subtitle && (
                                    <p className="text-xs text-gray-400 mt-0.5">{typeConfig.subtitle}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Trạng thái</p>
                                {warehouse.is_active
                                    ? <span className="badge badge-success">Đang hoạt động</span>
                                    : <span className="badge badge-secondary">Ngừng hoạt động</span>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Địa chỉ */}
                    {(warehouse.address || warehouse.city) && (
                        <div className="card">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" /> Địa Chỉ
                            </h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                {warehouse.city && <p className="font-medium">{warehouse.city}</p>}
                                {warehouse.address && <p className="text-gray-600 whitespace-pre-wrap">{warehouse.address}</p>}
                            </div>
                        </div>
                    )}

                    {/* Ghi chú */}
                    {warehouse.notes && (
                        <div className="card">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" /> Ghi Chú
                            </h3>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{warehouse.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal xóa */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold mb-3">Xác Nhận Xóa</h3>
                        <p className="text-gray-600 mb-2">
                            Bạn có chắc chắn muốn xóa kho <strong>{warehouse.name}</strong>?
                        </p>
                        {locations && locations.length > 0 && (
                            <p className="text-red-600 text-sm font-medium mb-4">
                                ⚠️ Kho này có {locations.length} vị trí. Hãy xóa tất cả vị trí trước.
                            </p>
                        )}
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary" disabled={deleteWarehouse.isPending}>
                                Hủy bỏ
                            </button>
                            <button onClick={handleDeleteWarehouse} className="btn btn-danger" disabled={deleteWarehouse.isPending}>
                                {deleteWarehouse.isPending ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
