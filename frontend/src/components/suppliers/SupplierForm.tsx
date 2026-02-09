import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { useCreateSupplier, useUpdateSupplier } from '../../hooks/useSuppliers';
import type { Supplier, CreateSupplierInput } from '../../types/supplier';

interface SupplierFormProps {
    supplier?: Supplier;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function SupplierForm({ supplier, onSuccess, onCancel }: SupplierFormProps) {
    const navigate = useNavigate();
    const isEditMode = !!supplier;

    const createSupplier = useCreateSupplier();
    const updateSupplier = useUpdateSupplier();

    const [formData, setFormData] = useState<CreateSupplierInput>({
        code: supplier?.code || '',
        name: supplier?.name || '',
        name_en: supplier?.name_en || '',
        tax_code: supplier?.tax_code || '',
        contact_person: supplier?.contact_person || '',
        phone: supplier?.phone || '',
        email: supplier?.email || '',
        address: supplier?.address || '',
        city: supplier?.city || '',
        country: supplier?.country || 'Vietnam',
        payment_terms: supplier?.payment_terms || '',
        credit_limit: supplier?.credit_limit || undefined,
        is_active: supplier?.is_active ?? true,
        notes: supplier?.notes || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: keyof CreateSupplierInput, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.code) newErrors.code = 'Code is required';
        if (!formData.name) newErrors.name = 'Name is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (isEditMode && supplier) {
                await updateSupplier.mutateAsync({
                    id: supplier.id,
                    input: formData,
                });
            } else {
                await createSupplier.mutateAsync(formData);
            }

            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/suppliers');
            }
        } catch (error) {
            console.error('Error saving supplier:', error);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/suppliers');
        }
    };

    const isSaving = createSupplier.isPending || updateSupplier.isPending;

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
                            placeholder="e.g., SUP-001"
                        />
                        {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                    </div>

                    <div>
                        <label className="label">Name (Vietnamese) *</label>
                        <input
                            type="text"
                            className={`input ${errors.name ? 'border-red-500' : ''}`}
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="e.g., Công ty TNHH ABC"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="label">Name (English)</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.name_en || ''}
                            onChange={(e) => handleChange('name_en', e.target.value)}
                            placeholder="e.g., ABC Co., Ltd."
                        />
                    </div>

                    <div>
                        <label className="label">Tax Code</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.tax_code || ''}
                            onChange={(e) => handleChange('tax_code', e.target.value)}
                            placeholder="e.g., 0123456789"
                        />
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Contact Person</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.contact_person || ''}
                            onChange={(e) => handleChange('contact_person', e.target.value)}
                            placeholder="e.g., Nguyễn Văn A"
                        />
                    </div>

                    <div>
                        <label className="label">Phone</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="e.g., +84 123 456 789"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className={`input ${errors.email ? 'border-red-500' : ''}`}
                            value={formData.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="e.g., contact@supplier.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="label">Address</label>
                        <textarea
                            className="input w-full"
                            rows={2}
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            placeholder="Street address"
                        />
                    </div>

                    <div>
                        <label className="label">City</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.city || ''}
                            onChange={(e) => handleChange('city', e.target.value)}
                            placeholder="e.g., Ho Chi Minh"
                        />
                    </div>

                    <div>
                        <label className="label">Country</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.country}
                            onChange={(e) => handleChange('country', e.target.value)}
                            placeholder="e.g., Vietnam"
                        />
                    </div>
                </div>
            </div>

            {/* Payment Terms */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Payment Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Payment Terms</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.payment_terms || ''}
                            onChange={(e) => handleChange('payment_terms', e.target.value)}
                            placeholder="e.g., Net 30 days"
                        />
                    </div>

                    <div>
                        <label className="label">Credit Limit</label>
                        <input
                            type="number"
                            step="0.01"
                            className="input"
                            value={formData.credit_limit || ''}
                            onChange={(e) => handleChange('credit_limit', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* Notes & Status */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="label">Notes</label>
                        <textarea
                            className="input w-full"
                            rows={4}
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Additional notes..."
                        />
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
                    {isSaving ? 'Saving...' : isEditMode ? 'Update Supplier' : 'Create Supplier'}
                </button>
            </div>
        </form>
    );
}
