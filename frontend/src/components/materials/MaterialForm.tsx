import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { useCreateMaterial, useUpdateMaterial } from '../../hooks/useMaterials';
import type { Material, CreateMaterialInput, UpdateMaterialInput } from '../../types/material';

interface MaterialFormProps {
    material?: Material;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function MaterialForm({ material, onSuccess, onCancel }: MaterialFormProps) {
    const navigate = useNavigate();
    const isEditMode = !!material;

    const createMaterial = useCreateMaterial();
    const updateMaterial = useUpdateMaterial();

    const [formData, setFormData] = useState<CreateMaterialInput>({
        code: material?.code || '',
        trading_name: material?.trading_name || '',
        inci_name: material?.inci_name || '',
        material_type: material?.material_type || 'RAW_MATERIAL',
        category: material?.category || '',
        sub_category: material?.sub_category || '',
        unit: material?.unit || 'KG',
        supplier_id: material?.supplier_id || undefined,
        standard_cost: material?.standard_cost || undefined,
        last_purchase_price: material?.last_purchase_price || undefined,
        min_stock_level: material?.min_stock_level || 0,
        max_stock_level: material?.max_stock_level || undefined,
        reorder_point: material?.reorder_point || undefined,
        reorder_quantity: material?.reorder_quantity || undefined,
        requires_qc: material?.requires_qc || false,
        shelf_life_days: material?.shelf_life_days || undefined,
        storage_conditions: material?.storage_conditions || '',
        hazardous: material?.hazardous || false,
        is_active: material?.is_active ?? true,
        notes: material?.notes || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: keyof CreateMaterialInput, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.code) newErrors.code = 'Code is required';
        if (!formData.trading_name) newErrors.trading_name = 'Trading name is required';
        if (!formData.material_type) newErrors.material_type = 'Material type is required';
        if (!formData.unit) newErrors.unit = 'Unit is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (isEditMode && material) {
                await updateMaterial.mutateAsync({
                    id: material.id,
                    input: formData as UpdateMaterialInput,
                });
            } else {
                await createMaterial.mutateAsync(formData);
            }

            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/materials');
            }
        } catch (error) {
            console.error('Error saving material:', error);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/materials');
        }
    };

    const isSaving = createMaterial.isPending || updateMaterial.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Code *</label>
                        <input
                            type="text"
                            className={`input ${errors.code ? 'border-red-500' : ''}`}
                            value={formData.code}
                            onChange={(e) => handleChange('code', e.target.value)}
                            disabled={isEditMode}
                            placeholder="e.g., MAT-001"
                        />
                        {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                    </div>

                    <div>
                        <label className="label">Trading Name *</label>
                        <input
                            type="text"
                            className={`input ${errors.trading_name ? 'border-red-500' : ''}`}
                            value={formData.trading_name}
                            onChange={(e) => handleChange('trading_name', e.target.value)}
                            placeholder="e.g., Glycerin"
                        />
                        {errors.trading_name && <p className="text-red-500 text-sm mt-1">{errors.trading_name}</p>}
                    </div>

                    <div>
                        <label className="label">INCI Name</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.inci_name || ''}
                            onChange={(e) => handleChange('inci_name', e.target.value)}
                            placeholder="e.g., Glycerol"
                        />
                    </div>

                    <div>
                        <label className="label">Material Type *</label>
                        <select
                            className={`input ${errors.material_type ? 'border-red-500' : ''}`}
                            value={formData.material_type}
                            onChange={(e) => handleChange('material_type', e.target.value)}
                        >
                            <option value="RAW_MATERIAL">Raw Material</option>
                            <option value="INGREDIENT">Ingredient</option>
                            <option value="PACKAGING">Packaging</option>
                            <option value="CONSUMABLE">Consumable</option>
                        </select>
                        {errors.material_type && <p className="text-red-500 text-sm mt-1">{errors.material_type}</p>}
                    </div>

                    <div>
                        <label className="label">Category</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.category || ''}
                            onChange={(e) => handleChange('category', e.target.value)}
                            placeholder="e.g., Humectant"
                        />
                    </div>

                    <div>
                        <label className="label">Sub Category</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.sub_category || ''}
                            onChange={(e) => handleChange('sub_category', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="label">Unit *</label>
                        <select
                            className={`input ${errors.unit ? 'border-red-500' : ''}`}
                            value={formData.unit}
                            onChange={(e) => handleChange('unit', e.target.value)}
                        >
                            <option value="KG">KG</option>
                            <option value="L">L</option>
                            <option value="PCS">PCS</option>
                            <option value="BOX">BOX</option>
                        </select>
                        {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                    </div>
                </div>
            </div>

            {/* Pricing */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Standard Cost</label>
                        <input
                            type="number"
                            step="0.01"
                            className="input"
                            value={formData.standard_cost || ''}
                            onChange={(e) => handleChange('standard_cost', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="label">Last Purchase Price</label>
                        <input
                            type="number"
                            step="0.01"
                            className="input"
                            value={formData.last_purchase_price || ''}
                            onChange={(e) => handleChange('last_purchase_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* Stock Control */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Stock Control</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Min Stock Level</label>
                        <input
                            type="number"
                            step="0.001"
                            className="input"
                            value={formData.min_stock_level || ''}
                            onChange={(e) => handleChange('min_stock_level', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="0.000"
                        />
                    </div>

                    <div>
                        <label className="label">Max Stock Level</label>
                        <input
                            type="number"
                            step="0.001"
                            className="input"
                            value={formData.max_stock_level || ''}
                            onChange={(e) => handleChange('max_stock_level', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="0.000"
                        />
                    </div>

                    <div>
                        <label className="label">Reorder Point</label>
                        <input
                            type="number"
                            step="0.001"
                            className="input"
                            value={formData.reorder_point || ''}
                            onChange={(e) => handleChange('reorder_point', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="0.000"
                        />
                    </div>

                    <div>
                        <label className="label">Reorder Quantity</label>
                        <input
                            type="number"
                            step="0.001"
                            className="input"
                            value={formData.reorder_quantity || ''}
                            onChange={(e) => handleChange('reorder_quantity', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="0.000"
                        />
                    </div>
                </div>
            </div>

            {/* Quality & Safety */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Quality & Safety</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Shelf Life (Days)</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.shelf_life_days || ''}
                            onChange={(e) => handleChange('shelf_life_days', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="365"
                        />
                    </div>

                    <div>
                        <label className="label">Storage Conditions</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.storage_conditions || ''}
                            onChange={(e) => handleChange('storage_conditions', e.target.value)}
                            placeholder="e.g., Cool, dry place"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="requires_qc"
                            checked={formData.requires_qc}
                            onChange={(e) => handleChange('requires_qc', e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="requires_qc" className="text-sm font-medium">Requires Quality Control</label>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="hazardous"
                            checked={formData.hazardous}
                            onChange={(e) => handleChange('hazardous', e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="hazardous" className="text-sm font-medium text-red-600">Hazardous Material</label>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium">Active</label>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                <textarea
                    className="input w-full"
                    rows={4}
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Additional notes..."
                />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary flex items-center gap-2"
                    disabled={isSaving}
                >
                    <X className="w-5 h-5" />
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary flex items-center gap-2"
                    disabled={isSaving}
                >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Saving...' : isEditMode ? 'Update Material' : 'Create Material'}
                </button>
            </div>
        </form>
    );
}
