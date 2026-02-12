import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCreateAdjustment } from '../../hooks/useInventory';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useMaterials } from '../../hooks/useMaterials';
import { useFinishedProducts } from '../../hooks/useFinishedProducts';
import { useAuthStore } from '../../stores/authStore';
import {
    ArrowLeft, Save, Plus, Trash2, Home, User, LogOut,
    Package, Warehouse as WarehouseIcon, FileText, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import type { Warehouse } from '../../types/warehouse';
import type { Material } from '../../types/material';
import type { FinishedProduct } from '../../types/finishedProduct';

interface AdjustmentItemForm {
    item_type: 'material' | 'finished_product';
    item_id: number;
    warehouse_location_id?: number;
    batch_number?: string;
    lot_number?: string;
    physical_quantity: number;
    current_quantity: number;
    adjustment_quantity: number;
    notes?: string;
}

interface AdjustmentForm {
    warehouse_id: number;
    adjustment_date: string;
    adjustment_type: 'physical_count' | 'cycle_count' | 'damage' | 'write_off' | 'initial_stock';
    reason: string;
    notes?: string;
    items: AdjustmentItemForm[];
}

export default function AdjustmentCreatePage() {
    const { t } = useTranslation('inventory');
    const { t: tc } = useTranslation('common');
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const createMutation = useCreateAdjustment();
    const { data: warehouses } = useWarehouses();
    const { data: materials } = useMaterials();
    const { data: products } = useFinishedProducts();

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<AdjustmentForm>({
        defaultValues: {
            adjustment_date: new Date().toISOString().split('T')[0],
            adjustment_type: 'physical_count',
            items: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const selectedWarehouseId = watch('warehouse_id');
    const watchedItems = watch('items');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const onSubmit = async (data: AdjustmentForm) => {
        if (data.items.length === 0) {
            toast.error('Please add at least one item');
            return;
        }

        try {
            const formattedData = {
                ...data,
                warehouse_id: Number(data.warehouse_id),
                items: data.items.map(item => ({
                    item_type: item.item_type,
                    item_id: Number(item.item_id),
                    warehouse_location_id: item.warehouse_location_id ? Number(item.warehouse_location_id) : undefined,
                    batch_number: item.batch_number,
                    lot_number: item.lot_number,
                    adjustment_quantity: Number(item.physical_quantity) - Number(item.current_quantity),
                    notes: item.notes
                }))
            };

            const result = await createMutation.mutateAsync(formattedData as any);
            toast.success('Adjustment created as draft');
            navigate(`/inventory/adjustments/${result.id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to create adjustment');
        }
    };

    const fetchStockBalance = async (index: number, itemId: number, itemType: string) => {
        if (!selectedWarehouseId || !itemId) return;

        try {
            const response = await api.get('/inventory/balance', {
                params: {
                    item_id: itemId,
                    item_type: itemType,
                    warehouse_id: selectedWarehouseId
                }
            });
            const balance = response.data.data?.quantity || 0;
            setValue(`items.${index}.current_quantity`, balance);

            // Trigger adjustment quantity update
            const physical = watchedItems[index]?.physical_quantity || 0;
            setValue(`items.${index}.adjustment_quantity`, physical - balance);
        } catch (err) {
            console.error('Failed to fetch balance', err);
            setValue(`items.${index}.current_quantity`, 0);
        }
    };

    const handleItemTypeChange = (index: number) => {
        setValue(`items.${index}.item_id`, 0);
        setValue(`items.${index}.current_quantity`, 0);
        setValue(`items.${index}.physical_quantity`, 0);
        setValue(`items.${index}.adjustment_quantity`, 0);
    };

    return (
        <div className="animate-fade-in text-slate-900">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className=" px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="text-gray-500 hover:text-primary-600 transition-colors">
                                <Home className="w-5 h-5" />
                            </Link>
                            <h1 className="text-xl font-bold text-primary-600">Inventory & Stock</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-500" />
                                <div className="text-sm hidden sm:block">
                                    <p className="font-medium text-gray-900">{user?.full_name}</p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="btn-outline py-1.5">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className=" px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => navigate('/inventory/adjustments')} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-gray-200 transition-all">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">New Stock Adjustment</h2>
                                <p className="text-sm text-gray-500">Record a physical count or inventory correction</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => navigate('/inventory/adjustments')} className="btn-outline">
                                Cancel
                            </button>
                            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                                <Save className="w-4 h-4" />
                                Save as Draft
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Header Info */}
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary-600" />
                                    Adjustment Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label">Warehouse <span className="text-red-500">*</span></label>
                                        <select
                                            {...register('warehouse_id', { required: 'Warehouse is required' })}
                                            className={`input w-full ${errors.warehouse_id ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Select Warehouse</option>
                                            {warehouses?.data.map((w: Warehouse) => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        {errors.warehouse_id && <p className="text-xs text-red-500 mt-1">{errors.warehouse_id.message}</p>}
                                    </div>
                                    <div>
                                        <label className="label">Adjustment Date <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            {...register('adjustment_date', { required: 'Date is required' })}
                                            className="input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Adjustment Type <span className="text-red-500">*</span></label>
                                        <select {...register('adjustment_type')} className="input w-full">
                                            <option value="physical_count">Physical Count</option>
                                            <option value="cycle_count">Cycle Count</option>
                                            <option value="damage">Damage</option>
                                            <option value="write_off">Write Off</option>
                                            <option value="initial_stock">Initial Stock</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Reason / Reference <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            {...register('reason', { required: 'Reason is required' })}
                                            placeholder="e.g. Annual Audit 2024"
                                            className="input w-full"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="label">Notes</label>
                                        <textarea
                                            {...register('notes')}
                                            rows={2}
                                            className="input w-full"
                                            placeholder="Additional information..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="card overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary-600" />
                                        <h3 className="text-lg font-semibold">Adjustment Items</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => append({
                                            item_type: 'material',
                                            item_id: 0,
                                            current_quantity: 0,
                                            physical_quantity: 0,
                                            adjustment_quantity: 0
                                        })}
                                        disabled={!selectedWarehouseId}
                                        className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {!selectedWarehouseId ? (
                                    <div className="p-12 text-center text-gray-500">
                                        <WarehouseIcon className="w-12 h-12 mx-auto mb-4 opacity-20 text-primary-600" />
                                        <p>Select a warehouse first to add items</p>
                                    </div>
                                ) : fields.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">
                                        <p>No items added yet. Click the <span className="font-bold">+</span> to add an item.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                                <tr>
                                                    <th className="px-6 py-4 w-1/4">Type & Item</th>
                                                    <th className="px-6 py-4 text-center w-1/6">System Qty</th>
                                                    <th className="px-6 py-4 text-center w-1/6">Physical Qty</th>
                                                    <th className="px-6 py-4 text-center w-1/6">Variance</th>
                                                    <th className="px-6 py-4 text-right w-16"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {fields.map((field, index) => (
                                                    <tr key={field.id} className="group">
                                                        <td className="px-6 py-4 space-y-2">
                                                            <select
                                                                {...register(`items.${index}.item_type` as const)}
                                                                onChange={() => handleItemTypeChange(index)}
                                                                className="input-sm w-full py-1 h-8"
                                                            >
                                                                <option value="material">Material</option>
                                                                <option value="finished_product">Product</option>
                                                            </select>
                                                            <select
                                                                {...register(`items.${index}.item_id` as const, {
                                                                    required: true,
                                                                    onChange: (e) => fetchStockBalance(index, Number(e.target.value), watchedItems[index].item_type)
                                                                })}
                                                                className="input-sm w-full py-1 h-8"
                                                            >
                                                                <option value="">Select...</option>
                                                                {watchedItems[index].item_type === 'material'
                                                                    ? materials?.data.map((m: Material) => <option key={m.id} value={m.id}>{m.trading_name} ({m.code})</option>)
                                                                    : products?.data.map((p: FinishedProduct) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)
                                                                }
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                type="number"
                                                                readOnly
                                                                {...register(`items.${index}.current_quantity` as const)}
                                                                className="input-sm w-full text-center bg-gray-50 border-none pointer-events-none"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                {...register(`items.${index}.physical_quantity` as const, {
                                                                    required: true,
                                                                    min: { value: 0, message: 'Invalid' },
                                                                    onChange: (e) => {
                                                                        const val = Number(e.target.value);
                                                                        const cur = watchedItems[index].current_quantity;
                                                                        setValue(`items.${index}.adjustment_quantity`, val - cur);
                                                                    }
                                                                })}
                                                                className="input-sm w-full text-center focus:border-primary-500"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold">
                                                            <span className={watchedItems[index]?.adjustment_quantity > 0 ? 'text-green-600' : watchedItems[index]?.adjustment_quantity < 0 ? 'text-red-600' : 'text-gray-400'}>
                                                                {watchedItems[index]?.adjustment_quantity > 0 ? '+' : ''}
                                                                {watchedItems[index]?.adjustment_quantity || 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="card p-6 border-l-4 border-l-amber-400 bg-amber-50/30">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-amber-900">Safety Policy</h4>
                                        <p className="text-sm text-amber-800 leading-relaxed mt-1">
                                            Adjustments saved as drafts will NOT affect inventory values immediately. You must POST the adjustment from the detail page to commit changes.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6">
                                <h4 className="font-semibold mb-4">Summary</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Items:</span>
                                        <span className="font-medium text-gray-900">{fields.length}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-100 pt-3">
                                        <span className="text-gray-500">Positive Variances:</span>
                                        <span className="font-medium text-green-600">
                                            {watchedItems?.filter(i => i.adjustment_quantity > 0).length || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Negative Variances:</span>
                                        <span className="font-medium text-red-600">
                                            {watchedItems?.filter(i => i.adjustment_quantity < 0).length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
