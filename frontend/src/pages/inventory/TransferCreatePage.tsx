import { useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCreateTransfer } from '../../hooks/useInventory';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useMaterials } from '../../hooks/useMaterials';
import { useFinishedProducts } from '../../hooks/useFinishedProducts';
import { useAuthStore } from '../../stores/authStore';
import {
    ArrowLeft, Save, Plus, Trash2, Home, User, LogOut,
    Package, Warehouse as WarehouseIcon, FileText, Calendar, AlertCircle,
    ArrowRightLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Warehouse } from '../../types/warehouse';
import type { Material } from '../../types/material';
import type { FinishedProduct } from '../../types/finishedProduct';

interface TransferItemForm {
    item_type: 'material' | 'finished_product';
    item_id: number;
    from_location_id?: number;
    to_location_id?: number;
    quantity: number;
    notes?: string;
}

interface TransferForm {
    from_warehouse_id: number;
    to_warehouse_id: number;
    transfer_date: string;
    notes?: string;
    items: TransferItemForm[];
}

export default function TransferCreatePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const createMutation = useCreateTransfer();
    const { data: warehouses } = useWarehouses();
    const { data: materials } = useMaterials();
    const { data: products } = useFinishedProducts();

    const { register, control, handleSubmit, watch, formState: { errors } } = useForm<TransferForm>({
        defaultValues: {
            transfer_date: new Date().toISOString().split('T')[0],
            items: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const fromWarehouseId = watch('from_warehouse_id');
    const toWarehouseId = watch('to_warehouse_id');
    const watchedItems = watch('items');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const onSubmit = async (data: TransferForm) => {
        if (data.from_warehouse_id === data.to_warehouse_id) {
            toast.error('Source and destination warehouses must be different');
            return;
        }
        if (data.items.length === 0) {
            toast.error('Please add at least one item');
            return;
        }

        try {
            const formattedData = {
                ...data,
                from_warehouse_id: Number(data.from_warehouse_id),
                to_warehouse_id: Number(data.to_warehouse_id),
                items: data.items.map(item => ({
                    ...item,
                    item_id: Number(item.item_id),
                    quantity: Number(item.quantity)
                }))
            };

            const result = await createMutation.mutateAsync(formattedData as any);
            toast.success('Transfer request created');
            navigate(`/inventory/transfers/${result.id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to create transfer');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => navigate('/inventory/transfers')} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-gray-200 transition-all">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">New Stock Transfer</h2>
                                <p className="text-sm text-gray-500">Move items between warehouses</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => navigate('/inventory/transfers')} className="btn-outline">
                                Cancel
                            </button>
                            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                                <Save className="w-4 h-4" />
                                Save Draft
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="card p-6 border-t-4 border-t-primary-600">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <ArrowRightLeft className="w-5 h-5 text-primary-600" />
                                    Route Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                                        <div className="bg-gray-100 p-2 rounded-full border border-gray-200 shadow-sm">
                                            <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">Source Warehouse <span className="text-red-500">*</span></label>
                                        <select
                                            {...register('from_warehouse_id', { required: 'Source is required' })}
                                            className={`input w-full ${errors.from_warehouse_id ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Select Source</option>
                                            {warehouses?.data.map((w: Warehouse) => (
                                                <option key={w.id} value={w.id} disabled={Number(toWarehouseId) === w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        {errors.from_warehouse_id && <p className="text-xs text-red-500 mt-1">{errors.from_warehouse_id.message}</p>}
                                    </div>
                                    <div>
                                        <label className="label">Destination Warehouse <span className="text-red-500">*</span></label>
                                        <select
                                            {...register('to_warehouse_id', { required: 'Destination is required' })}
                                            className={`input w-full ${errors.to_warehouse_id ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Select Destination</option>
                                            {warehouses?.data.map((w: Warehouse) => (
                                                <option key={w.id} value={w.id} disabled={Number(fromWarehouseId) === w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        {errors.to_warehouse_id && <p className="text-xs text-red-500 mt-1">{errors.to_warehouse_id.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-100">
                                    <div>
                                        <label className="label font-semibold">Transfer Date</label>
                                        <input type="date" {...register('transfer_date')} className="input w-full" />
                                    </div>
                                    <div>
                                        <label className="label font-semibold">Remarks</label>
                                        <input type="text" {...register('notes')} placeholder="Optional notes..." className="input w-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="card overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary-600" />
                                        <h3 className="text-lg font-semibold">Items to Transfer</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => append({ item_type: 'material', item_id: 0, quantity: 1 })}
                                        disabled={!fromWarehouseId || !toWarehouseId}
                                        className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {!fromWarehouseId || !toWarehouseId ? (
                                    <div className="p-12 text-center text-gray-500">
                                        <WarehouseIcon className="w-12 h-12 mx-auto mb-4 opacity-10 text-primary-600" />
                                        <p>Select both warehouses to start adding items</p>
                                    </div>
                                ) : fields.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500 italic">
                                        <p>No items added. Click + to add items for movement.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                                <tr>
                                                    <th className="px-6 py-4 w-1/3">Type & Item</th>
                                                    <th className="px-6 py-4 text-center">Quantity</th>
                                                    <th className="px-6 py-4">Notes</th>
                                                    <th className="px-6 py-4 text-right w-16"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {fields.map((field, index) => (
                                                    <tr key={field.id}>
                                                        <td className="px-6 py-4 space-y-2">
                                                            <select
                                                                {...register(`items.${index}.item_type` as const)}
                                                                className="input-sm w-full h-8"
                                                            >
                                                                <option value="material">Material</option>
                                                                <option value="finished_product">Product</option>
                                                            </select>
                                                            <select
                                                                {...register(`items.${index}.item_id` as const, { required: true })}
                                                                className="input-sm w-full h-8"
                                                            >
                                                                <option value="">Select Item...</option>
                                                                {watchedItems[index]?.item_type === 'material'
                                                                    ? materials?.data.map((m: Material) => <option key={m.id} value={m.id}>{m.trading_name}</option>)
                                                                    : products?.data.map((p: FinishedProduct) => <option key={p.id} value={p.id}>{p.name}</option>)
                                                                }
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                {...register(`items.${index}.quantity` as const, { required: true, min: 0.01 })}
                                                                className="input-sm w-24 text-center border-gray-200 focus:border-primary-500"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="text"
                                                                {...register(`items.${index}.notes` as const)}
                                                                placeholder="Batch/Lot info?"
                                                                className="input-sm w-full h-8"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button type="button" onClick={() => remove(index)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
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
                            <div className="card p-6 bg-primary-900 text-white shadow-xl">
                                <h4 className="font-bold flex items-center gap-2 mb-4">
                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                    Movement Policy
                                </h4>
                                <p className="text-sm text-primary-100 leading-relaxed mb-6">
                                    Transfers are processed in "Draft" status by default. Posting the transfer will immediately impact stock levels in both warehouses.
                                </p>
                                <div className="bg-white/10 p-4 rounded-lg flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-primary-200 flex-shrink-0" />
                                    <p className="text-xs text-primary-100">
                                        Ensure Batch and Lot numbers are recorded in notes if tracking is required for these items.
                                    </p>
                                </div>
                            </div>

                            <div className="card p-6">
                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary-600" />
                                    Schedule
                                </h4>
                                <div className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Estimated Arrival</p>
                                        <p className="font-medium text-sm">Dependent on carrier</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Carrier</p>
                                        <p className="font-medium text-sm">Internal Fleet</p>
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
