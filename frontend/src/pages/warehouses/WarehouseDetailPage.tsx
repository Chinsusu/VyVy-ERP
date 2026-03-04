import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Building2,
    MapPin,
    FileText,
    Plus,
    Warehouse as WarehouseIcon,
} from 'lucide-react';
import { useWarehouse, useDeleteWarehouse, useWarehouseLocations } from '../../hooks/useWarehouses';
import { useCreateLocation, useDeleteLocation } from '../../hooks/useWarehouseLocations';
import { formatLocationHierarchy } from '../../types/warehouseLocation';
import type { CreateWarehouseLocationInput } from '../../types/warehouseLocation';
import AuditLogPanel from '../../components/common/AuditLogPanel';
import { useWarehouseInventory } from '../../hooks/useWarehouseInventory';
import SearchInput from '../../components/common/SearchInput';

const WAREHOUSE_TYPE_LABELS: Record<string, string> = {
    main: 'Kho Tổng',
    satellite: 'Kho Vệ Tinh',
    returns: 'Kho Hoàn Hàng',
    staging: 'Kho Trung Chuyển',
    other: 'Khác',
};

const LOCATION_TYPE_LABELS: Record<string, string> = {
    storage: 'Lưu trữ',
    picking: 'Lấy hàng',
    receiving: 'Nhận hàng',
    staging: 'Trung chuyển',
    shipping: 'Xuất hàng',
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

    const { data: inventoryItems = [], isLoading: inventoryLoading } = useWarehouseInventory(warehouseId);

    const filteredInventory = inventoryItems.filter((item) => {
        if (inventorySearch) {
            const q = inventorySearch.toLowerCase();
            return (
                item.item_name?.toLowerCase().includes(q) ||
                item.item_code?.toLowerCase().includes(q)
            );
        }
        return true;
    });
    const [showLocationForm, setShowLocationForm] = useState(false);
    const [locationFormData, setLocationFormData] = useState<CreateWarehouseLocationInput>({
        warehouse_id: warehouseId,
        code: '',
        name: '',
        aisle: '',
        rack: '',
        shelf: '',
        bin: '',
        location_type: 'storage',
        is_active: true,
        notes: '',
    });

    const handleDeleteWarehouse = async () => {
        try {
            await deleteWarehouse.mutateAsync(warehouseId);
            navigate('/warehouses');
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            alert('Xóa thất bại. Kho có thể đang có vị trí con.');
        }
    };

    const handleAddLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createLocation.mutateAsync(locationFormData);
            setLocationFormData({
                warehouse_id: warehouseId,
                code: '',
                name: '',
                aisle: '',
                rack: '',
                shelf: '',
                bin: '',
                location_type: 'storage',
                is_active: true,
                notes: '',
            });
            setShowLocationForm(false);
        } catch (error) {
            console.error('Error creating location:', error);
            alert('Tạo vị trí thất bại. Vui lòng thử lại.');
        }
    };

    const handleDeleteLocation = async (locationId: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa vị trí này?')) return;

        try {
            await deleteLocation.mutateAsync(locationId);
        } catch (error) {
            console.error('Error deleting location:', error);
            alert('Xóa vị trí thất bại. Vui lòng thử lại.');
        }
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Đang tải kho hàng...</div>
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
                <Link
                    to="/warehouses"
                    className="text-primary hover:underline flex items-center gap-2 mt-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/warehouses"
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{warehouse.name}</h1>
                                {warehouse.is_active ? (
                                    <span className="badge badge-success">Đang hoạt động</span>
                                ) : (
                                    <span className="badge badge-secondary">Ngừng hoạt động</span>
                                )}
                                <span className="badge badge-secondary">
                                    {WAREHOUSE_TYPE_LABELS[warehouse.warehouse_type] || warehouse.warehouse_type}
                                </span>
                            </div>
                            <p className="text-gray-600">Mã: {warehouse.code}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                to={`/warehouses/${warehouseId}/edit`}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Điều chỉnh
                            </Link>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="btn btn-danger flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>

                {/* Thông tin cơ bản */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Thông Tin Cơ Bản
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Mã kho</label>
                            <p className="text-gray-900 font-medium">{warehouse.code}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Tên kho</label>
                            <p className="text-gray-900">{warehouse.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Loại kho</label>
                            <p className="text-gray-900">
                                {WAREHOUSE_TYPE_LABELS[warehouse.warehouse_type] || warehouse.warehouse_type}
                            </p>
                        </div>
                        {warehouse.city && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Tỉnh/Thành phố</label>
                                <p className="text-gray-900">{warehouse.city}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Địa chỉ */}
                {warehouse.address && (
                    <div className="card mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Địa Chỉ
                        </h2>
                        <p className="text-gray-900 whitespace-pre-wrap">{warehouse.address}</p>
                    </div>
                )}

                {/* Tồn Kho */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Tồn Kho
                            {!inventoryLoading && (
                                <span className="text-base font-normal text-gray-500">({filteredInventory.length})</span>
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
                        <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500 flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                Đang tải tồn kho...
                            </div>
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
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
                                        <th className="text-right">Tồn kho</th>
                                        <th className="text-right">Đặt trước</th>
                                        <th className="text-right">Khả dụng</th>
                                        <th>Đơn vị</th>
                                        <th className="text-right">Đơn giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInventory.map((item) => (
                                        <tr key={`${item.item_type}-${item.item_id}-${item.id}`}>
                                            <td className="font-mono text-sm text-primary">{item.item_code || `#${item.item_id}`}</td>
                                            <td className="font-medium">{item.item_name}</td>
                                            <td>
                                                {item.item_type === 'material' ? (
                                                    <span className="badge bg-blue-100 text-blue-700">Nguyên liệu</span>
                                                ) : (
                                                    <span className="badge bg-purple-100 text-purple-700">Thành phẩm</span>
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
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="text-right">
                                                <span className={item.available_quantity <= 0 ? 'text-red-600 font-bold' : 'text-green-600 font-semibold'}>
                                                    {item.available_quantity.toLocaleString('vi-VN', { maximumFractionDigits: 3 })}
                                                </span>
                                            </td>
                                            <td className="text-gray-600">{item.item_unit || '—'}</td>
                                            <td className="text-right text-sm text-gray-600">
                                                {item.unit_cost
                                                    ? item.unit_cost.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Vị trí trong kho */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <WarehouseIcon className="w-5 h-5 text-primary" />
                            Vị Trí Trong Kho
                            <span className="text-base font-normal text-gray-500">({locations?.length || 0})</span>
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
                        <form onSubmit={handleAddLocation} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="font-medium mb-4">Vị Trí Mới</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Mã vị trí <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.code}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, code: e.target.value })}
                                        required
                                        placeholder="VD: A1-K1-T1-N1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Tên vị trí <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.name}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                                        required
                                        placeholder="VD: Khu A - Kệ 1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Dãy</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.aisle}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, aisle: e.target.value })}
                                        placeholder="VD: A1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Kệ</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.rack}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, rack: e.target.value })}
                                        placeholder="VD: K1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Tầng</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.shelf}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, shelf: e.target.value })}
                                        placeholder="VD: T1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Ngăn</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.bin}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, bin: e.target.value })}
                                        placeholder="VD: N1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Loại vị trí</label>
                                    <select
                                        className="input"
                                        value={locationFormData.location_type}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, location_type: e.target.value })}
                                    >
                                        <option value="storage">Lưu trữ</option>
                                        <option value="picking">Lấy hàng</option>
                                        <option value="receiving">Nhận hàng</option>
                                        <option value="staging">Trung chuyển</option>
                                        <option value="shipping">Xuất hàng</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowLocationForm(false)}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Hủy bỏ
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={createLocation.isPending}>
                                    {createLocation.isPending ? 'Đang thêm...' : 'Thêm Vị Trí'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Bảng vị trí */}
                    {locations && locations.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mã</th>
                                        <th>Tên</th>
                                        <th>Phân cấp</th>
                                        <th>Loại</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations.map((location) => (
                                        <tr key={location.id}>
                                            <td className="font-mono font-semibold">{location.code}</td>
                                            <td>{location.name}</td>
                                            <td className="text-sm text-gray-600">{formatLocationHierarchy(location)}</td>
                                            <td>
                                                <span className="badge badge-secondary">
                                                    {LOCATION_TYPE_LABELS[location.location_type] || location.location_type}
                                                </span>
                                            </td>
                                            <td>
                                                {location.is_active ? (
                                                    <span className="badge badge-success">Đang hoạt động</span>
                                                ) : (
                                                    <span className="badge badge-secondary">Ngừng hoạt động</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteLocation(location.id)}
                                                    className="text-red-600 hover:underline text-sm"
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Chưa có vị trí nào. Nhấn "Thêm Vị Trí" để tạo mới.
                        </div>
                    )}
                </div>

                {/* Ghi chú */}
                {warehouse.notes && (
                    <div className="card mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Ghi Chú
                        </h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{warehouse.notes}</p>
                    </div>
                )}

                {/* Lịch sử thay đổi */}
                <div className="mt-6">
                    <AuditLogPanel tableName="warehouses" recordId={warehouse.id} />
                </div>
            </div>

            {/* Modal xác nhận xóa */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Xác Nhận Xóa</h3>
                        <p className="text-gray-700 mb-6">
                            Bạn có chắc chắn muốn xóa kho <strong>{warehouse.name}</strong>?
                            {locations && locations.length > 0 && (
                                <span className="block mt-2 text-red-600 font-medium">
                                    Cảnh báo: Kho này có {locations.length} vị trí. Bạn cần xóa tất cả vị trí trước khi xóa kho.
                                </span>
                            )}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn btn-secondary"
                                disabled={deleteWarehouse.isPending}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleDeleteWarehouse}
                                className="btn btn-danger"
                                disabled={deleteWarehouse.isPending}
                            >
                                {deleteWarehouse.isPending ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
