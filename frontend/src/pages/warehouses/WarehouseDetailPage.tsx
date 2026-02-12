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
            alert('Failed to delete warehouse. It may have active locations.');
        }
    };

    const handleAddLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createLocation.mutateAsync(locationFormData);
            // Reset form
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
            alert('Failed to create location');
        }
    };

    const handleDeleteLocation = async (locationId: number) => {
        if (!confirm('Are you sure you want to delete this location?')) return;

        try {
            await deleteLocation.mutateAsync(locationId);
        } catch (error) {
            console.error('Error deleting location:', error);
            alert('Failed to delete location');
        }
    };

    if (isLoading) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading warehouse...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !warehouse) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error ? `Error: ${(error as Error).message}` : 'Warehouse not found'}
                    </div>
                    <Link
                        to="/warehouses"
                        className="text-primary hover:underline flex items-center gap-2 mt-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Warehouses
                    </Link>
                </div>
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
                        Back to Warehouses
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{warehouse.name}</h1>
                                {warehouse.is_active ? (
                                    <span className="badge badge-success">Active</span>
                                ) : (
                                    <span className="badge badge-secondary">Inactive</span>
                                )}
                                <span className="badge badge-secondary capitalize">{warehouse.warehouse_type}</span>
                            </div>
                            <p className="text-gray-600">Code: {warehouse.code}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                to={`/warehouses/${warehouseId}/edit`}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </Link>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="btn btn-danger flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Code</label>
                            <p className="text-gray-900 font-medium">{warehouse.code}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Name</label>
                            <p className="text-gray-900">{warehouse.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Type</label>
                            <p className="text-gray-900 capitalize">{warehouse.warehouse_type}</p>
                        </div>
                        {warehouse.city && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">City</label>
                                <p className="text-gray-900">{warehouse.city}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Address */}
                {warehouse.address && (
                    <div className="card mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Address
                        </h2>
                        <p className="text-gray-900 whitespace-pre-wrap">{warehouse.address}</p>
                    </div>
                )}

                {/* Locations Section */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <WarehouseIcon className="w-5 h-5 text-primary" />
                            Warehouse Locations ({locations?.length || 0})
                        </h2>
                        <button
                            onClick={() => setShowLocationForm(!showLocationForm)}
                            className="btn btn-primary btn-sm flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Location
                        </button>
                    </div>

                    {/* Location Form */}
                    {showLocationForm && (
                        <form onSubmit={handleAddLocation} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="font-medium mb-4">New Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Code *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.code}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, code: e.target.value })}
                                        required
                                        placeholder="e.g. A1-R1-S1-B1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Name *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.name}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Section A - Rack 1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Aisle</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.aisle}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, aisle: e.target.value })}
                                        placeholder="e.g. A1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Rack</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.rack}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, rack: e.target.value })}
                                        placeholder="e.g. R1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Shelf</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.shelf}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, shelf: e.target.value })}
                                        placeholder="e.g. S1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Bin</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={locationFormData.bin}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, bin: e.target.value })}
                                        placeholder="e.g. B1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Location Type</label>
                                    <select
                                        className="input"
                                        value={locationFormData.location_type}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, location_type: e.target.value })}
                                    >
                                        <option value="storage">Storage</option>
                                        <option value="picking">Picking</option>
                                        <option value="receiving">Receiving</option>
                                        <option value="staging">Staging</option>
                                        <option value="shipping">Shipping</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowLocationForm(false)}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={createLocation.isPending}>
                                    {createLocation.isPending ? 'Adding...' : 'Add Location'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Locations Table */}
                    {locations && locations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>Hierarchy</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations.map((location) => (
                                        <tr key={location.id}>
                                            <td className="font-mono font-semibold">{location.code}</td>
                                            <td>{location.name}</td>
                                            <td className="text-sm text-gray-600">{formatLocationHierarchy(location)}</td>
                                            <td>
                                                <span className="badge badge-secondary capitalize">{location.location_type}</span>
                                            </td>
                                            <td>
                                                {location.is_active ? (
                                                    <span className="badge badge-success">Active</span>
                                                ) : (
                                                    <span className="badge badge-secondary">Inactive</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteLocation(location.id)}
                                                    className="text-red-600 hover:underline text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No locations yet. Click "Add Location" to create one.
                        </div>
                    )}
                </div>

                {/* Notes */}
                {warehouse.notes && (
                    <div className="card mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Notes
                        </h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{warehouse.notes}</p>
                    </div>
                )}

                {/* Metadata */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">System Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <label className="text-gray-600">Created At</label>
                            <p className="text-gray-900">
                                {new Date(warehouse.created_at).toLocaleString('vi-VN')}
                            </p>
                        </div>
                        <div>
                            <label className="text-gray-600">Updated At</label>
                            <p className="text-gray-900">
                                {new Date(warehouse.updated_at).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete warehouse <strong>{warehouse.name}</strong>?
                            {locations && locations.length > 0 && (
                                <span className="block mt-2 text-red-600 font-medium">
                                    Warning: This warehouse has {locations.length} location(s). You must delete all locations first.
                                </span>
                            )}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn btn-secondary"
                                disabled={deleteWarehouse.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteWarehouse}
                                className="btn btn-danger"
                                disabled={deleteWarehouse.isPending}
                            >
                                {deleteWarehouse.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
