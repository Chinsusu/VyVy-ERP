import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateWarehouse, useUpdateWarehouse } from '../../hooks/useWarehouses';
import type { Warehouse, CreateWarehouseInput } from '../../types/warehouse';

interface WarehouseFormProps {
    warehouse?: Warehouse;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function WarehouseForm({ warehouse, onSuccess, onCancel }: WarehouseFormProps) {
    const navigate = useNavigate();
    const createWarehouse = useCreateWarehouse();
    const updateWarehouse = useUpdateWarehouse();

    const [formData, setFormData] = useState<CreateWarehouseInput>({
        code: warehouse?.code || '',
        name: warehouse?.name || '',
        warehouse_type: warehouse?.warehouse_type || 'main',
        address: warehouse?.address || '',
        city: warehouse?.city || '',
        manager_id: warehouse?.manager_id,
        is_active: warehouse?.is_active ?? true,
        notes: warehouse?.notes || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Code is required';
        }
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (warehouse) {
                // Update existing warehouse
                await updateWarehouse.mutateAsync({
                    id: warehouse.id,
                    input: formData,
                });
            } else {
                // Create new warehouse
                await createWarehouse.mutateAsync(formData);
            }

            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/warehouses');
            }
        } catch (error) {
            console.error('Error saving warehouse:', error);
            setErrors({ submit: 'Failed to save warehouse. Please try again.' });
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/warehouses');
        }
    };

    const handleChange = (field: keyof CreateWarehouseInput, value: any) => {
        setFormData({ ...formData, [field]: value });
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const isSubmitting = createWarehouse.isPending || updateWarehouse.isPending;

    return (
        <form onSubmit={handleSubmit} className="card">
            <h2 className="text-xl font-semibold mb-6">
                {warehouse ? 'Edit Warehouse' : 'Create New Warehouse'}
            </h2>

            {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {errors.submit}
                </div>
            )}

            <div className="space-y-6">
                {/* Basic Information */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input ${errors.code ? 'border-red-500' : ''}`}
                                value={formData.code}
                                onChange={(e) => handleChange('code', e.target.value)}
                                disabled={!!warehouse || isSubmitting}
                                placeholder="e.g. WH001"
                            />
                            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                        </div>

                        <div>
                            <label className="label">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input ${errors.name ? 'border-red-500' : ''}`}
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="e.g. Main Warehouse"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="label">Warehouse Type</label>
                            <select
                                className="input"
                                value={formData.warehouse_type}
                                onChange={(e) => handleChange('warehouse_type', e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="main">Main</option>
                                <option value="satellite">Satellite</option>
                                <option value="returns">Returns</option>
                                <option value="staging">Staging</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">City</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="e.g. Ho Chi Minh City"
                            />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Address</h3>
                    <div>
                        <label className="label">Full Address</label>
                        <textarea
                            className="input"
                            rows={3}
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Enter complete address..."
                        />
                    </div>
                </div>

                {/* Additional Information */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="label">Notes</label>
                            <textarea
                                className="input"
                                rows={4}
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Additional notes about the warehouse..."
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.target.checked)}
                                disabled={isSubmitting}
                                className="mr-2"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                Active
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : warehouse ? 'Update Warehouse' : 'Create Warehouse'}
                </button>
            </div>
        </form>
    );
}
