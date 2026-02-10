import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, X, ClipboardList } from 'lucide-react';
import { useMaterials } from '../../hooks/useMaterials';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useCreateMaterialRequest, useUpdateMaterialRequest } from '../../hooks/useMaterialRequests';
import type { Material } from '../../types/material';
import type { Warehouse } from '../../types/warehouse';
import type {
    MaterialRequest,
    CreateMaterialRequestInput,
    CreateMaterialRequestItemInput
} from '../../types/materialRequest';

interface MRFormProps {
    initialData?: MaterialRequest;
    isEdit?: boolean;
}

export default function MRForm({ initialData, isEdit }: MRFormProps) {
    const navigate = useNavigate();

    // API Hooks for dropdowns
    const { data: materialsData } = useMaterials({ page: 1, page_size: 1000, is_active: true });
    const { data: warehousesData } = useWarehouses();

    const materials = materialsData?.data || [];
    const warehouses = warehousesData?.data || [];

    // Mutations
    const createMutation = useCreateMaterialRequest();
    const updateMutation = useUpdateMaterialRequest();

    // Form State
    const [formData, setFormData] = useState<Omit<CreateMaterialRequestInput, 'items'>>({
        mr_number: '',
        warehouse_id: 0,
        department: '',
        request_date: new Date().toISOString().split('T')[0],
        required_date: '',
        purpose: '',
        notes: '',
    });

    const [items, setItems] = useState<CreateMaterialRequestItemInput[]>([
        { material_id: 0, requested_quantity: 1, notes: '' }
    ]);

    // Load initial data for edit mode
    useEffect(() => {
        if (initialData) {
            setFormData({
                mr_number: initialData.mr_number,
                warehouse_id: initialData.warehouse_id,
                department: initialData.department,
                request_date: initialData.request_date.split('T')[0],
                required_date: initialData.required_date?.split('T')[0] || '',
                purpose: initialData.purpose || '',
                notes: initialData.notes || '',
            });

            if (initialData.items) {
                setItems(initialData.items.map(item => ({
                    material_id: item.material_id,
                    requested_quantity: item.requested_quantity,
                    notes: item.notes || '',
                })));
            }
        } else {
            // Generate a temporary MR number if new
            const now = new Date();
            const genMR = `MR-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
            setFormData(prev => ({ ...prev, mr_number: genMR }));
        }
    }, [initialData]);

    // Item management
    const addItem = () => {
        setItems([...items, { material_id: 0, requested_quantity: 1, notes: '' }]);
    };

    const removeItem = (index: number) => {
        if (items.length <= 1) return;
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: keyof CreateMaterialRequestItemInput, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (formData.warehouse_id === 0 || !formData.department || items.some(i => i.material_id === 0)) {
            alert('Please fill in all required fields and select materials for all items.');
            return;
        }

        const payload = {
            ...formData,
            warehouse_id: Number(formData.warehouse_id),
            items: items.map(item => ({
                ...item,
                material_id: Number(item.material_id),
                requested_quantity: Number(item.requested_quantity),
            })),
        };

        try {
            if (isEdit && initialData) {
                await updateMutation.mutateAsync({ id: initialData.id, input: payload });
                navigate(`/material-requests/${initialData.id}`);
            } else {
                const result = await createMutation.mutateAsync(payload);
                navigate(`/material-requests/${result.id}`);
            }
        } catch (err) {
            console.error('Failed to save MR:', err);
            alert('Error saving Material Request. Please check the logs.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header Info */}
            <div className="card grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="label">MR Number <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.mr_number}
                        onChange={(e) => setFormData({ ...formData, mr_number: e.target.value })}
                        disabled={isEdit}
                        required
                    />
                </div>
                <div>
                    <label className="label">Department <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="e.g. Production Lab, R&D"
                        required
                    />
                </div>
                <div>
                    <label className="label">Warehouse <span className="text-red-500">*</span></label>
                    <select
                        className="select w-full"
                        value={formData.warehouse_id}
                        onChange={(e) => setFormData({ ...formData, warehouse_id: Number(e.target.value) })}
                        required
                    >
                        <option value={0}>Select Warehouse</option>
                        {warehouses.map((w: Warehouse) => (
                            <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Request Date <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        className="input w-full"
                        value={formData.request_date}
                        onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="label">Required Date</label>
                    <input
                        type="date"
                        className="input w-full"
                        value={formData.required_date}
                        onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="label">Purpose</label>
                    <textarea
                        className="input w-full"
                        rows={2}
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        placeholder="Why are these materials needed?"
                    />
                </div>
            </div>

            {/* Items Section */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary-600" />
                        Requested Materials
                    </h3>
                    <button
                        type="button"
                        onClick={addItem}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Add Material
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="table w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="py-2 px-3 text-left">Material <span className="text-red-500">*</span></th>
                                <th className="py-2 px-3 text-right w-32">Requested Quantity</th>
                                <th className="py-2 px-3 text-left">Notes</th>
                                <th className="py-2 px-3 text-center w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className="border-b last:border-0">
                                    <td className="py-3 px-3">
                                        <select
                                            className="select w-full"
                                            value={item.material_id}
                                            onChange={(e) => updateItem(index, 'material_id', Number(e.target.value))}
                                            required
                                        >
                                            <option value={0}>Select Material</option>
                                            {materials.map((m: Material) => (
                                                <option key={m.id} value={m.id}>{m.trading_name} ({m.code}) - {m.unit}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 px-3">
                                        <input
                                            type="number"
                                            step="0.001"
                                            className="input w-full text-right"
                                            value={item.requested_quantity}
                                            onChange={(e) => updateItem(index, 'requested_quantity', Number(e.target.value))}
                                            min={0.001}
                                            required
                                        />
                                    </td>
                                    <td className="py-3 px-3">
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={item.notes}
                                            onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                            placeholder="Item specific notes..."
                                        />
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                                            disabled={items.length <= 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={createMutation.isPending || updateMutation.isPending}
                >
                    <Save className="w-4 h-4" />
                    {isEdit ? 'Update Material Request' : 'Create Material Request'}
                </button>
            </div>
        </form>
    );
}
