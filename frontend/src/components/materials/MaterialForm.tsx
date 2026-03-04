import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2, Building2, ChevronUp, ChevronDown } from 'lucide-react';
import { useCreateMaterial, useUpdateMaterial } from '../../hooks/useMaterials';
import { useSuppliers } from '../../hooks/useSuppliers';
import type { Material, CreateMaterialInput, UpdateMaterialInput, MaterialSupplierInput } from '../../types/material';

interface MaterialFormProps {
    material?: Material;
    onSuccess?: () => void;
    onCancel?: () => void;
}

// Normalize legacy material_type values from seed data (raw_material, packaging, fragrance)
// to current enum values (HOA_PHAM, HUONG_LIEU, BAO_BI)
const VALID_TYPES = new Set(['HOA_PHAM', 'HUONG_LIEU', 'BAO_BI']);
function normalizeMaterialType(t?: string | null): string {
    if (!t) return 'HOA_PHAM';
    if (VALID_TYPES.has(t)) return t;
    // legacy mapping
    const up = t.toUpperCase();
    if (up.includes('FRAGRANCE') || up.includes('HUONG')) return 'HUONG_LIEU';
    if (up.includes('PACK') || up.includes('BAO')) return 'BAO_BI';
    return 'HOA_PHAM'; // default for raw_material and anything else
}

const emptySupplier = (): MaterialSupplierInput => ({
    supplier_id: 0,
    priority: 1,
    unit_price: undefined,
    lead_time_days: undefined,
    notes: '',
});

export default function MaterialForm({ material, onSuccess, onCancel }: MaterialFormProps) {
    const navigate = useNavigate();
    const isEditMode = !!material;

    const createMaterial = useCreateMaterial();
    const updateMaterial = useUpdateMaterial();
    const { data: suppliersData } = useSuppliers({ page_size: 500 });
    const supplierOptions = suppliersData?.data || [];

    const [formData, setFormData] = useState<CreateMaterialInput>({
        code: material?.code || '',
        trading_name: material?.trading_name || '',
        inci_name: material?.inci_name || '',
        material_type: normalizeMaterialType(material?.material_type),
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
        suppliers: material?.suppliers?.map(ms => ({
            supplier_id: ms.supplier_id,
            priority: ms.priority,
            unit_price: ms.unit_price || undefined,
            lead_time_days: ms.lead_time_days || undefined,
            notes: ms.notes || '',
        })) || [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: keyof CreateMaterialInput, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    // ── Supplier rows ──
    const supplierRows = formData.suppliers || [];

    const addSupplierRow = () => {
        const next = emptySupplier();
        next.priority = supplierRows.length + 1;
        setFormData({ ...formData, suppliers: [...supplierRows, next] });
    };

    const removeSupplierRow = (idx: number) => {
        const updated = supplierRows
            .filter((_, i) => i !== idx)
            .map((s, i) => ({ ...s, priority: i + 1 }));
        setFormData({ ...formData, suppliers: updated });
    };

    const moveSupplierRow = (idx: number, direction: 'up' | 'down') => {
        const newRows = [...supplierRows];
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= newRows.length) return;
        [newRows[idx], newRows[swapIdx]] = [newRows[swapIdx], newRows[idx]];
        const updated = newRows.map((s, i) => ({ ...s, priority: i + 1 }));
        setFormData({ ...formData, suppliers: updated });
    };

    const updateSupplierRow = (idx: number, field: keyof MaterialSupplierInput, value: any) => {
        const updated = supplierRows.map((s, i) => i === idx ? { ...s, [field]: value } : s);
        setFormData({ ...formData, suppliers: updated });
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.code) newErrors.code = 'Mã NVL là bắt buộc';
        if (!formData.trading_name) newErrors.trading_name = 'Tên thương mại là bắt buộc';
        if (!formData.material_type) newErrors.material_type = 'Loại NVL là bắt buộc';
        if (!formData.unit) newErrors.unit = 'Đơn vị là bắt buộc';

        // Validate supplier rows
        for (let i = 0; i < supplierRows.length; i++) {
            if (!supplierRows[i].supplier_id) {
                newErrors[`supplier_${i}`] = 'Chọn nhà cung cấp';
            }
        }

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
                    input: {
                        ...(formData as UpdateMaterialInput),
                        suppliers: supplierRows,
                    },
                });
            } else {
                await createMaterial.mutateAsync(formData);
            }

            if (onSuccess) {
                onSuccess();
            } else if (isEditMode && material) {
                navigate(`/materials/${material.id}`);
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
                <h3 className="text-lg font-semibold mb-4">Thông Tin Cơ Bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Mã NVL *</label>
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
                        <label className="label">Tên Thương Mại *</label>
                        <input
                            type="text"
                            className={`input ${errors.trading_name ? 'border-red-500' : ''}`}
                            value={formData.trading_name}
                            onChange={(e) => handleChange('trading_name', e.target.value)}
                            placeholder="VD: Glycerin"
                        />
                        {errors.trading_name && <p className="text-red-500 text-sm mt-1">{errors.trading_name}</p>}
                    </div>

                    <div>
                        <label className="label">Tên INCI</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.inci_name || ''}
                            onChange={(e) => handleChange('inci_name', e.target.value)}
                            placeholder="VD: Glycerol"
                        />
                    </div>

                    <div>
                        <label className="label">Loại NVL *</label>
                        <select
                            className={`input ${errors.material_type ? 'border-red-500' : ''}`}
                            value={formData.material_type}
                            onChange={(e) => handleChange('material_type', e.target.value)}
                        >
                            <option value="HOA_PHAM">Hóa phẩm</option>
                            <option value="HUONG_LIEU">Hương liệu</option>
                            <option value="BAO_BI">Bao bì</option>
                        </select>
                        {errors.material_type && <p className="text-red-500 text-sm mt-1">{errors.material_type}</p>}
                    </div>

                    <div>
                        <label className="label">Đặc tính</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.category || ''}
                            onChange={(e) => handleChange('category', e.target.value)}
                            placeholder="VD: Chất giữ ẩm"
                        />
                    </div>

                    <div>
                        <label className="label">Đặc tính phụ</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.sub_category || ''}
                            onChange={(e) => handleChange('sub_category', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="label">Đơn vị tính *</label>
                        <select
                            className={`input ${errors.unit ? 'border-red-500' : ''}`}
                            value={formData.unit}
                            onChange={(e) => handleChange('unit', e.target.value)}
                        >
                            <option value="KG">KG</option>
                            <option value="G">G</option>
                            <option value="L">L</option>
                            <option value="ML">ML</option>
                            <option value="PCS">PCS</option>
                            <option value="BOX">BOX</option>
                            <option value="BAG">BAG</option>
                        </select>
                        {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                    </div>
                </div>
            </div>

            {/* Suppliers */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Nhà Cung Cấp
                    </h3>
                    <button
                        type="button"
                        onClick={addSupplierRow}
                        className="btn btn-secondary flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm NCC
                    </button>
                </div>

                {supplierRows.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-4 text-center">
                        Chưa có nhà cung cấp nào. Nhấn "Thêm NCC" để bắt đầu.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {supplierRows.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                                {/* Priority badge + move buttons */}
                                <div className="col-span-1 flex flex-col items-center gap-0.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => moveSupplierRow(idx, 'up')}
                                        disabled={idx === 0}
                                        className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                                        {idx + 1}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => moveSupplierRow(idx, 'down')}
                                        disabled={idx === supplierRows.length - 1}
                                        className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Supplier select */}
                                <div className="col-span-4">
                                    <label className="text-xs text-gray-500 mb-1 block">Nhà cung cấp *</label>
                                    <select
                                        className={`input text-sm ${errors[`supplier_${idx}`] ? 'border-red-500' : ''}`}
                                        value={row.supplier_id || ''}
                                        onChange={(e) => updateSupplierRow(idx, 'supplier_id', parseInt(e.target.value))}
                                    >
                                        <option value="">-- Chọn NCC --</option>
                                        {supplierOptions.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    {errors[`supplier_${idx}`] && (
                                        <p className="text-red-500 text-xs mt-1">{errors[`supplier_${idx}`]}</p>
                                    )}
                                </div>

                                {/* Unit price */}
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500 mb-1 block">Giá (₫)</label>
                                    <input
                                        type="number"
                                        step="1"
                                        className="input text-sm"
                                        value={row.unit_price || ''}
                                        onChange={(e) => updateSupplierRow(idx, 'unit_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        placeholder="0"
                                    />
                                </div>

                                {/* Lead time */}
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500 mb-1 block">Thời gian giao hàng (ngày)</label>
                                    <input
                                        type="number"
                                        className="input text-sm"
                                        value={row.lead_time_days || ''}
                                        onChange={(e) => updateSupplierRow(idx, 'lead_time_days', e.target.value ? parseInt(e.target.value) : undefined)}
                                        placeholder="0"
                                    />
                                </div>

                                {/* Notes */}
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500 mb-1 block">Ghi chú</label>
                                    <input
                                        type="text"
                                        className="input text-sm"
                                        value={row.notes || ''}
                                        onChange={(e) => updateSupplierRow(idx, 'notes', e.target.value)}
                                        placeholder="..."
                                    />
                                </div>

                                {/* Remove */}
                                <div className="col-span-1 flex justify-center pt-6">
                                    <button
                                        type="button"
                                        onClick={() => removeSupplierRow(idx)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <p className="text-xs text-gray-400">Thứ tự từ trên xuống = ưu tiên từ cao đến thấp (1 = ưu tiên nhất)</p>
                    </div>
                )}
            </div>

            {/* Pricing */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Giá</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Giá vốn chuẩn (VND)</label>
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
                        <label className="label">Giá mua gần nhất (VND)</label>
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
                <h3 className="text-lg font-semibold mb-4">Kiểm Soát Tồn Kho</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Tồn kho tối thiểu</label>
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
                        <label className="label">Tồn kho tối đa</label>
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
                        <label className="label">Điểm đặt hàng lại</label>
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
                        <label className="label">Số lượng đặt lại</label>
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
                <h3 className="text-lg font-semibold mb-4">Chất Lượng & An Toàn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Hạn sử dụng (ngày)</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.shelf_life_days || ''}
                            onChange={(e) => handleChange('shelf_life_days', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="365"
                        />
                    </div>

                    <div>
                        <label className="label">Điều kiện bảo quản</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.storage_conditions || ''}
                            onChange={(e) => handleChange('storage_conditions', e.target.value)}
                            placeholder="VD: Nơi khô ráo, thoáng mát"
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
                        <label htmlFor="requires_qc" className="text-sm font-medium">Cần kiểm tra KCS</label>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="hazardous"
                            checked={formData.hazardous}
                            onChange={(e) => handleChange('hazardous', e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="hazardous" className="text-sm font-medium text-red-600">Vật liệu nguy hiểm</label>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium">Đang hoạt động</label>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Ghi Chú</h3>
                <textarea
                    className="input w-full"
                    rows={4}
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Ghi chú thêm..."
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
                    Hủy bỏ
                </button>
                <button
                    type="submit"
                    className="btn btn-primary flex items-center gap-2"
                    disabled={isSaving}
                >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Đang lưu...' : isEditMode ? 'Cập Nhật NVL' : 'Tạo NVL'}
                </button>
            </div>
        </form>
    );
}
