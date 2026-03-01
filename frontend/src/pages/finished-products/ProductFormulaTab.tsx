import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, FlaskConical, X, Save, Loader2 } from 'lucide-react';
import { useProductFormulas, useCreateFormula, useUpdateFormula, useDeleteFormula } from '../../hooks/useProductFormulas';
import { useMaterials } from '../../hooks/useMaterials';
import type {
    ProductFormula,
    FormulaItemInput,
    CreateFormulaInput,
    UpdateFormulaInput,
} from '../../types/finishedProduct';

interface Props {
    productId: number;
    productName: string;
}

interface FormState {
    name: string;
    description: string;
    batch_size: string;
    batch_unit: string;
    is_active: boolean;
    notes: string;
    items: {
        material_id: number | '';
        quantity: string;
        unit: string;
        notes: string;
    }[];
}

const emptyForm = (): FormState => ({
    name: '',
    description: '',
    batch_size: '1',
    batch_unit: 'PCS',
    is_active: true,
    notes: '',
    items: [],
});

export default function ProductFormulaTab({ productId, productName }: Props) {
    const { data: formulas = [], isLoading } = useProductFormulas(productId);
    const { data: materialsResponse } = useMaterials({ page_size: 100 });
    const materials = (materialsResponse as any)?.data ?? materialsResponse ?? [];
    const materialsList = Array.isArray(materials) ? materials : [];

    const createFormula = useCreateFormula(productId);
    const updateFormula = useUpdateFormula(productId);
    const deleteFormula = useDeleteFormula(productId);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm());
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [error, setError] = useState('');

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm(), name: productName });
        setError('');
        setShowForm(true);
    };

    const openEdit = (f: ProductFormula) => {
        setEditingId(f.id);
        setForm({
            name: f.name,
            description: f.description ?? '',
            batch_size: String(f.batch_size),
            batch_unit: f.batch_unit,
            is_active: f.is_active,
            notes: f.notes ?? '',
            items: (f.items ?? []).map((item) => ({
                material_id: item.material_id,
                quantity: String(item.quantity),
                unit: item.unit,
                notes: item.notes ?? '',
            })),
        });
        setError('');
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setError('');
    };

    const addItem = () => {
        setForm((prev) => ({
            ...prev,
            items: [...prev.items, { material_id: '', quantity: '', unit: '', notes: '' }],
        }));
    };

    const removeItem = (idx: number) => {
        setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
    };

    const updateItem = (idx: number, field: string, value: string | number) => {
        setForm((prev) => {
            const items = [...prev.items];
            items[idx] = { ...items[idx], [field]: value };

            // Auto-fill unit when material selected
            if (field === 'material_id' && typeof value === 'number') {
                const mat = materialsList.find((m: any) => m.id === value);
                if (mat) items[idx].unit = mat.unit;
            }

            return { ...prev, items };
        });
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.name.trim()) {
            setError('Tên công thức không được để trống');
            return;
        }

        const validItems: FormulaItemInput[] = [];
        for (const item of form.items) {
            if (!item.material_id) {
                setError('Vui lòng chọn nguyên vật liệu cho tất cả các dòng');
                return;
            }
            const qty = parseFloat(item.quantity);
            if (!qty || qty <= 0) {
                setError('Số lượng phải lớn hơn 0');
                return;
            }
            validItems.push({
                material_id: item.material_id as number,
                quantity: qty,
                unit: item.unit,
                notes: item.notes,
            });
        }

        try {
            if (editingId) {
                const req: UpdateFormulaInput = {
                    name: form.name,
                    description: form.description,
                    batch_size: parseFloat(form.batch_size) || 1,
                    batch_unit: form.batch_unit,
                    is_active: form.is_active,
                    notes: form.notes,
                    items: validItems,
                };
                await updateFormula.mutateAsync({ formulaId: editingId, input: req });
            } else {
                const req: CreateFormulaInput = {
                    name: form.name,
                    description: form.description,
                    batch_size: parseFloat(form.batch_size) || 1,
                    batch_unit: form.batch_unit,
                    is_active: form.is_active,
                    notes: form.notes,
                    items: validItems,
                };
                await createFormula.mutateAsync(req);
            }
            closeForm();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { error?: { message?: string } } }; message?: string };
            setError(err?.response?.data?.error?.message ?? err?.message ?? 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteFormula.mutateAsync(id);
            setConfirmDeleteId(null);
        } catch {
            // silently fail - user can retry
        }
    };

    const isSaving = createFormula.isPending || updateFormula.isPending;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-primary" />
                    Công Thức Sản Xuất
                </h2>
                <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Thêm Công Thức
                </button>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex justify-center py-8 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải...
                </div>
            )}

            {/* Empty */}
            {!isLoading && formulas.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Chưa có công thức nào. Nhấn "+ Thêm Công Thức" để tạo mới.</p>
                </div>
            )}

            {/* Formula list */}
            <div className="space-y-3">
                {formulas.map((formula) => (
                    <div key={formula.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Formula header row */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                            <button
                                className="flex items-center gap-2 text-left flex-1"
                                onClick={() => setExpandedId(expandedId === formula.id ? null : formula.id)}
                            >
                                {expandedId === formula.id ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                                <span className="font-semibold text-gray-800">{formula.name}</span>
                                {!formula.is_active && (
                                    <span className="badge badge-secondary text-xs">Không hoạt động</span>
                                )}
                                <span className="text-sm text-gray-500">
                                    — Batch: {formula.batch_size} {formula.batch_unit}
                                    {' '}· {(formula.items ?? []).length} nguyên liệu
                                </span>
                            </button>

                            <div className="flex items-center gap-2 ml-3">
                                <button
                                    onClick={() => openEdit(formula)}
                                    className="p-1.5 text-gray-400 hover:text-primary rounded"
                                    title="Sửa"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setConfirmDeleteId(formula.id)}
                                    className="p-1.5 text-gray-400 hover:text-danger rounded"
                                    title="Xoá"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Expanded items */}
                        {expandedId === formula.id && (
                            <div className="px-4 py-3">
                                {formula.description && (
                                    <p className="text-sm text-gray-600 mb-3">{formula.description}</p>
                                )}
                                {(formula.items ?? []).length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">Chưa có nguyên liệu nào.</p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-gray-500 text-left">
                                                <th className="pb-2 font-medium">#</th>
                                                <th className="pb-2 font-medium">Mã NVL</th>
                                                <th className="pb-2 font-medium">Tên Nguyên Vật Liệu</th>
                                                <th className="pb-2 font-medium text-right">Số Lượng</th>
                                                <th className="pb-2 font-medium">ĐVT</th>
                                                <th className="pb-2 font-medium">Ghi Chú</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(formula.items ?? []).map((item, idx) => (
                                                <tr key={item.id} className="border-b last:border-b-0">
                                                    <td className="py-2 text-gray-400">{idx + 1}</td>
                                                    <td className="py-2 font-mono text-xs text-primary">
                                                        {item.material?.code ?? '-'}
                                                    </td>
                                                    <td className="py-2">{item.material?.trading_name ?? '-'}</td>
                                                    <td className="py-2 text-right font-medium">
                                                        {item.quantity.toLocaleString('vi-VN', { maximumFractionDigits: 3 })}
                                                    </td>
                                                    <td className="py-2 text-gray-600">{item.unit}</td>
                                                    <td className="py-2 text-gray-400 text-xs">{item.notes}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                {formula.notes && (
                                    <p className="text-xs text-gray-500 mt-3 italic">Ghi chú: {formula.notes}</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Create / Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-6">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-lg font-bold">
                                {editingId ? 'Sửa Công Thức' : 'Thêm Công Thức Mới'}
                            </h3>
                            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Basic info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên Công Thức
                                    </label>
                                    <p className="text-gray-900 font-semibold text-lg py-1">{productName}</p>
                                    <input type="hidden" value={form.name} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước lô (Batch)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min="0.001"
                                            step="0.001"
                                            className="input w-full"
                                            placeholder="1"
                                            value={form.batch_size}
                                            onChange={(e) => setForm((p) => ({ ...p, batch_size: e.target.value }))}
                                        />
                                        <input
                                            type="text"
                                            className="input w-28"
                                            placeholder="PCS"
                                            value={form.batch_unit}
                                            onChange={(e) => setForm((p) => ({ ...p, batch_unit: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-5">
                                    <input
                                        type="checkbox"
                                        id="formula-active"
                                        checked={form.is_active}
                                        onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                                        className="w-4 h-4 rounded"
                                    />
                                    <label htmlFor="formula-active" className="text-sm text-gray-700">
                                        Đang sử dụng
                                    </label>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                    <textarea
                                        className="input w-full"
                                        rows={2}
                                        placeholder="Mô tả công thức..."
                                        value={form.description}
                                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Items table */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Danh Sách Nguyên Vật Liệu
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="btn btn-secondary btn-sm flex items-center gap-1 text-xs"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Thêm NVL
                                    </button>
                                </div>

                                {form.items.length === 0 ? (
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg py-6 text-center text-gray-400 text-sm">
                                        Chưa có nguyên liệu. Nhấn "+ Thêm NVL" để thêm.
                                    </div>
                                ) : (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-left">
                                                    <th className="px-3 py-2 font-medium">#</th>
                                                    <th className="px-3 py-2 font-medium">Nguyên Vật Liệu *</th>
                                                    <th className="px-3 py-2 font-medium">Số Lượng *</th>
                                                    <th className="px-3 py-2 font-medium">ĐVT</th>
                                                    <th className="px-3 py-2 font-medium">Ghi Chú</th>
                                                    <th className="px-3 py-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {form.items.map((item, idx) => (
                                                    <tr key={idx} className="border-t">
                                                        <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                                                        <td className="px-3 py-2 min-w-[200px]">
                                                            <select
                                                                className="input w-full text-sm"
                                                                value={item.material_id}
                                                                onChange={(e) =>
                                                                    updateItem(idx, 'material_id', parseInt(e.target.value))
                                                                }
                                                            >
                                                                <option value="">-- Chọn NVL --</option>
                                                                {materialsList.map((m: any) => (
                                                                    <option key={m.id} value={m.id}>
                                                                        {m.code} - {m.trading_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2 w-28">
                                                            <input
                                                                type="number"
                                                                min="0.001"
                                                                step="0.001"
                                                                className="input w-full text-sm"
                                                                placeholder="0"
                                                                value={item.quantity}
                                                                onChange={(e) =>
                                                                    updateItem(idx, 'quantity', e.target.value)
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 w-20">
                                                            <span className="text-sm text-gray-600">{item.unit || '—'}</span>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="text"
                                                                className="input w-full text-sm"
                                                                placeholder="..."
                                                                value={item.notes}
                                                                onChange={(e) =>
                                                                    updateItem(idx, 'notes', e.target.value)
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(idx)}
                                                                className="text-gray-300 hover:text-danger"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                                <textarea
                                    className="input w-full"
                                    rows={2}
                                    placeholder="Ghi chú thêm..."
                                    value={form.notes}
                                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                            <button onClick={closeForm} className="btn btn-secondary" disabled={isSaving}>
                                Huỷ
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="btn btn-primary flex items-center gap-2"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isSaving ? 'Đang lưu...' : 'Lưu Công Thức'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {confirmDeleteId !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold mb-2">Xác Nhận Xoá</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc muốn xoá công thức này? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="btn btn-secondary"
                                disabled={deleteFormula.isPending}
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDeleteId)}
                                className="btn btn-danger"
                                disabled={deleteFormula.isPending}
                            >
                                {deleteFormula.isPending ? 'Đang xoá...' : 'Xoá'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
