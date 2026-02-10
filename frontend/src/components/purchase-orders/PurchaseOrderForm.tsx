import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, X, Calculator } from 'lucide-react';
import { useMaterials } from '../../hooks/useMaterials';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useCreatePurchaseOrder, useUpdatePurchaseOrder } from '../../hooks/usePurchaseOrders';
import type {
    PurchaseOrder,
    CreatePurchaseOrderInput,
    CreatePurchaseOrderItemInput
} from '../../types/purchaseOrder';

interface PurchaseOrderFormProps {
    initialData?: PurchaseOrder;
    isEdit?: boolean;
}

export default function PurchaseOrderForm({ initialData, isEdit }: PurchaseOrderFormProps) {
    const navigate = useNavigate();

    // API Hooks for dropdowns
    const { data: materialsData } = useMaterials({ page: 1, page_size: 1000 });
    const { data: suppliersData } = useSuppliers({ page: 1, page_size: 1000 });
    const { data: warehousesData } = useWarehouses();

    const materials = materialsData?.data || [];
    const suppliers = suppliersData?.data || [];
    const warehouses = warehousesData?.data || [];

    // Mutations
    const createMutation = useCreatePurchaseOrder();
    const updateMutation = useUpdatePurchaseOrder();

    // Form State
    const [formData, setFormData] = useState<Omit<CreatePurchaseOrderInput, 'items'>>({
        po_number: '',
        supplier_id: 0,
        warehouse_id: 0,
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        payment_terms: '',
        shipping_method: '',
        notes: '',
    });

    const [items, setItems] = useState<CreatePurchaseOrderItemInput[]>([
        { material_id: 0, quantity: 1, unit_price: 0, tax_rate: 0, discount_rate: 0, notes: '' }
    ]);

    // Load initial data for edit mode
    useEffect(() => {
        if (initialData) {
            setFormData({
                po_number: initialData.po_number,
                supplier_id: initialData.supplier_id,
                warehouse_id: initialData.warehouse_id,
                order_date: initialData.order_date.split('T')[0],
                expected_delivery_date: initialData.expected_delivery_date?.split('T')[0] || '',
                payment_terms: initialData.payment_terms || '',
                shipping_method: initialData.shipping_method || '',
                notes: initialData.notes || '',
            });

            if (initialData.items) {
                setItems(initialData.items.map(item => ({
                    material_id: item.material_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    tax_rate: item.tax_rate,
                    discount_rate: item.discount_rate,
                    notes: item.notes || '',
                })));
            }
        } else {
            // Generate a temporary PO number if new
            const now = new Date();
            const genPO = `PO-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
            setFormData(prev => ({ ...prev, po_number: genPO }));
        }
    }, [initialData]);

    // Item management
    const addItem = () => {
        setItems([...items, { material_id: 0, quantity: 1, unit_price: 0, tax_rate: 0, discount_rate: 0, notes: '' }]);
    };

    const removeItem = (index: number) => {
        if (items.length <= 1) return;
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: keyof CreatePurchaseOrderItemInput, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Auto-fill unit price if material changes and standard_cost is available
        if (field === 'material_id') {
            const material = materials.find(m => m.id === Number(value));
            if (material) {
                // standard_cost depends on your Material type definition, let's assume it has it
                // if not, we can just leave it as is.
            }
        }

        newItems[index] = item;
        setItems(newItems);
    };

    // Calculations
    const totals = useMemo(() => {
        let subtotal = 0;
        let taxAmount = 0;
        let discountAmount = 0;

        items.forEach(item => {
            const base = item.quantity * item.unit_price;
            const tax = base * ((item.tax_rate || 0) / 100);
            const discount = base * ((item.discount_rate || 0) / 100);

            subtotal += base;
            taxAmount += tax;
            discountAmount += discount;
        });

        return {
            subtotal,
            taxAmount,
            discountAmount,
            total: subtotal + taxAmount - discountAmount,
        };
    }, [items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (formData.supplier_id === 0 || formData.warehouse_id === 0 || items.some(i => i.material_id === 0)) {
            alert('Please fill in all required fields and select materials for all items.');
            return;
        }

        const payload = {
            ...formData,
            supplier_id: Number(formData.supplier_id),
            warehouse_id: Number(formData.warehouse_id),
            items: items.map(item => ({
                ...item,
                material_id: Number(item.material_id),
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                tax_rate: Number(item.tax_rate || 0),
                discount_rate: Number(item.discount_rate || 0),
            })),
        };

        try {
            if (isEdit && initialData) {
                await updateMutation.mutateAsync({ id: initialData.id, input: payload });
                navigate(`/purchase-orders/${initialData.id}`);
            } else {
                const result = await createMutation.mutateAsync(payload);
                navigate(`/purchase-orders/${result.id}`);
            }
        } catch (err) {
            console.error('Failed to save PO:', err);
            alert('Error saving Purchase Order. Please check the logs.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header Info */}
            <div className="card grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <label className="label">PO Number <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.po_number}
                        onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                        disabled={isEdit}
                        required
                    />
                </div>
                <div>
                    <label className="label">Supplier <span className="text-red-500">*</span></label>
                    <select
                        className="select w-full"
                        value={formData.supplier_id}
                        onChange={(e) => setFormData({ ...formData, supplier_id: Number(e.target.value) })}
                        required
                    >
                        <option value={0}>Select Supplier</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                    </select>
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
                        {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Order Date <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        className="input w-full"
                        value={formData.order_date}
                        onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="label">Expected Delivery</label>
                    <input
                        type="date"
                        className="input w-full"
                        value={formData.expected_delivery_date}
                        onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                    />
                </div>
            </div>

            {/* Items Section */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-primary" />
                        Order Items
                    </h3>
                    <button
                        type="button"
                        onClick={addItem}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="table w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="py-2 px-3 text-left w-1/3">Material <span className="text-red-500">*</span></th>
                                <th className="py-2 px-3 text-right">Quantity</th>
                                <th className="py-2 px-3 text-right">Unit Price</th>
                                <th className="py-2 px-3 text-right">Tax (%)</th>
                                <th className="py-2 px-3 text-right">Discount (%)</th>
                                <th className="py-2 px-3 text-right">Line Total</th>
                                <th className="py-2 px-3 text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const lineTotal = item.quantity * item.unit_price * (1 + (item.tax_rate || 0) / 100) * (1 - (item.discount_rate || 0) / 100);
                                return (
                                    <tr key={index} className="border-b last:border-0">
                                        <td className="py-3 px-3">
                                            <select
                                                className="select w-full"
                                                value={item.material_id}
                                                onChange={(e) => updateItem(index, 'material_id', Number(e.target.value))}
                                                required
                                            >
                                                <option value={0}>Select Material</option>
                                                {materials.map(m => (
                                                    <option key={m.id} value={m.id}>{m.trading_name} ({m.code})</option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Notes for this item..."
                                                className="input w-full mt-2 text-xs"
                                                value={item.notes}
                                                onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                            />
                                        </td>
                                        <td className="py-3 px-3">
                                            <input
                                                type="number"
                                                step="0.001"
                                                className="input w-full text-right"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                min={0.001}
                                                required
                                            />
                                        </td>
                                        <td className="py-3 px-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="input w-full text-right"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                                                min={0}
                                                required
                                            />
                                        </td>
                                        <td className="py-3 px-3">
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="input w-full text-right"
                                                value={item.tax_rate}
                                                onChange={(e) => updateItem(index, 'tax_rate', Number(e.target.value))}
                                                min={0}
                                                max={100}
                                            />
                                        </td>
                                        <td className="py-3 px-3">
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="input w-full text-right"
                                                value={item.discount_rate}
                                                onChange={(e) => updateItem(index, 'discount_rate', Number(e.target.value))}
                                                min={0}
                                                max={100}
                                            />
                                        </td>
                                        <td className="py-3 px-3 text-right font-medium">
                                            {lineTotal.toLocaleString('vi-VN')}
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
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary and Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card space-y-4">
                    <h3 className="text-lg font-bold">Additional Information</h3>
                    <div>
                        <label className="label">Payment Terms</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.payment_terms}
                            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                            placeholder="e.g. Net 30, COD"
                        />
                    </div>
                    <div>
                        <label className="label">Shipping Method</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.shipping_method}
                            onChange={(e) => setFormData({ ...formData, shipping_method: e.target.value })}
                            placeholder="e.g. DHL, Trucking"
                        />
                    </div>
                    <div>
                        <label className="label">Notes</label>
                        <textarea
                            className="input w-full"
                            rows={4}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Internal notes or specific instructions..."
                        />
                    </div>
                </div>

                <div className="card bg-gray-50 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Order Summary</h3>
                        <div className="flex justify-between text-gray-600 border-b pb-2">
                            <span>Subtotal</span>
                            <span>{totals.subtotal.toLocaleString('vi-VN')} VND</span>
                        </div>
                        <div className="flex justify-between text-gray-600 border-b pb-2">
                            <span>Tax Amount</span>
                            <span>+ {totals.taxAmount.toLocaleString('vi-VN')} VND</span>
                        </div>
                        <div className="flex justify-between text-red-600 border-b pb-2">
                            <span>Discount</span>
                            <span>- {totals.discountAmount.toLocaleString('vi-VN')} VND</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-4">
                            <span>Grand Total</span>
                            <span className="text-primary">{totals.total.toLocaleString('vi-VN')} VND</span>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
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
                            {isEdit ? 'Update Purchase Order' : 'Create Purchase Order'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
