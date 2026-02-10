import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateFinishedProduct, useUpdateFinishedProduct } from '../../hooks/useFinishedProducts';
import type { FinishedProduct, CreateFinishedProductInput } from '../../types/finishedProduct';

interface FinishedProductFormProps {
    product?: FinishedProduct;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function FinishedProductForm({ product, onSuccess, onCancel }: FinishedProductFormProps) {
    const navigate = useNavigate();
    const createProduct = useCreateFinishedProduct();
    const updateProduct = useUpdateFinishedProduct();

    const [formData, setFormData] = useState<CreateFinishedProductInput>({
        code: product?.code || '',
        name: product?.name || '',
        name_en: product?.name_en || '',
        category: product?.category || '',
        sub_category: product?.sub_category || '',
        unit: product?.unit || 'PCS',
        barcode: product?.barcode || '',
        net_weight: product?.net_weight,
        gross_weight: product?.gross_weight,
        volume: product?.volume,
        min_stock_level: product?.min_stock_level,
        max_stock_level: product?.max_stock_level,
        reorder_point: product?.reorder_point,
        shelf_life_days: product?.shelf_life_days,
        storage_conditions: product?.storage_conditions || '',
        standard_cost: product?.standard_cost,
        selling_price: product?.selling_price,
        is_active: product?.is_active ?? true,
        notes: product?.notes || '',
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
        if (!formData.unit.trim()) {
            newErrors.unit = 'Unit is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (product) {
                await updateProduct.mutateAsync({
                    id: product.id,
                    input: formData,
                });
            } else {
                await createProduct.mutateAsync(formData);
            }

            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/finished-products');
            }
        } catch (error) {
            console.error('Error saving finished product:', error);
            setErrors({ submit: 'Failed to save finished product. Please try again.' });
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/finished-products');
        }
    };

    const handleChange = (field: keyof CreateFinishedProductInput, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const isSubmitting = createProduct.isPending || updateProduct.isPending;

    return (
        <form onSubmit={handleSubmit} className="card">
            <h2 className="text-xl font-semibold mb-6">
                {product ? 'Edit Finished Product' : 'Create New Finished Product'}
            </h2>

            {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {errors.submit}
                </div>
            )}

            <div className="space-y-6">
                {/* 1. Basic Information */}
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
                                disabled={!!product || isSubmitting}
                                placeholder="e.g. FP001"
                            />
                            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                        </div>

                        <div>
                            <label className="label">
                                Name (English) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input ${errors.name ? 'border-red-500' : ''}`}
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="e.g. Premium Chocolate Box"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="label">Name (Local/Vietnamese)</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.name_en}
                                onChange={(e) => handleChange('name_en', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="e.g. Hộp Socola Cao Cấp"
                            />
                        </div>

                        <div>
                            <label className="label">Category</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="e.g. Food"
                            />
                        </div>

                        <div>
                            <label className="label">Sub-category</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.sub_category}
                                onChange={(e) => handleChange('sub_category', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="e.g. Confectionery"
                            />
                        </div>

                        <div>
                            <label className="label">
                                Unit <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`input ${errors.unit ? 'border-red-500' : ''}`}
                                value={formData.unit}
                                onChange={(e) => handleChange('unit', e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="PCS">PCS (Pieces)</option>
                                <option value="BOX">BOX</option>
                                <option value="CTN">CTN (Carton)</option>
                                <option value="KG">KG (Kilogram)</option>
                                <option value="LTR">LTR (Liter)</option>
                                <option value="PKT">PKT (Packet)</option>
                            </select>
                            {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                        </div>

                        <div>
                            <label className="label">Barcode</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.barcode}
                                onChange={(e) => handleChange('barcode', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="e.g. 8934561234567"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Specifications */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="label">Net Weight (kg)</label>
                            <input
                                type="number"
                                step="0.001"
                                className="input"
                                value={formData.net_weight || ''}
                                onChange={(e) => handleChange('net_weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.000"
                            />
                        </div>

                        <div>
                            <label className="label">Gross Weight (kg)</label>
                            <input
                                type="number"
                                step="0.001"
                                className="input"
                                value={formData.gross_weight || ''}
                                onChange={(e) => handleChange('gross_weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.000"
                            />
                        </div>

                        <div>
                            <label className="label">Volume (m³)</label>
                            <input
                                type="number"
                                step="0.001"
                                className="input"
                                value={formData.volume || ''}
                                onChange={(e) => handleChange('volume', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.000"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Stock Management */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Stock Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Min Stock Level</label>
                            <input
                                type="number"
                                step="0.001"
                                className="input"
                                value={formData.min_stock_level || ''}
                                onChange={(e) => handleChange('min_stock_level', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                                placeholder="0.000"
                            />
                        </div>

                        <div>
                            <label className="label">Shelf Life (days)</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.shelf_life_days || ''}
                                onChange={(e) => handleChange('shelf_life_days', e.target.value ? parseInt(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="e.g. 365"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Storage Conditions</label>
                            <textarea
                                className="input"
                                rows={3}
                                value={formData.storage_conditions}
                                onChange={(e) => handleChange('storage_conditions', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="e.g. Store in cool, dry place. Keep away from direct sunlight."
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Pricing */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Standard Cost (VND)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input"
                                value={formData.standard_cost || ''}
                                onChange={(e) => handleChange('standard_cost', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="label">Selling Price (VND)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input"
                                value={formData.selling_price || ''}
                                onChange={(e) => handleChange('selling_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* 5. Additional Information */}
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
                                placeholder="Additional notes about the product..."
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
                    {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                </button>
            </div>
        </form>
    );
}
