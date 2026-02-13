import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Trash2, Search, Package } from 'lucide-react';
import { usePurchaseOrders, usePurchaseOrder } from '../../hooks/usePurchaseOrders';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useCreateGRN } from '../../hooks/useGrns';
import type { CreateGRNInput, CreateGRNItemInput } from '../../types/grn';
import type { PurchaseOrder, PurchaseOrderItem } from '../../types/purchaseOrder';
import type { WarehouseLocation } from '../../types/warehouseLocation';

export default function GrnForm() {
    const navigate = useNavigate();
    const createMutation = useCreateGRN();

    // Data for dropdowns
    const { data: posData } = usePurchaseOrders({ status: 'approved', page: 1, page_size: 1000 });
    const { data: warehousesData } = useWarehouses();

    const approvedPOs = posData?.data || [];
    const warehouses = warehousesData?.data || [];

    // State
    const [selectedPOId, setSelectedPOId] = useState<number>(0);
    const { data: selectedPO, isLoading: isLoadingPO } = usePurchaseOrder(selectedPOId);

    const [formData, setFormData] = useState<Omit<CreateGRNInput, 'items'>>({
        grn_number: '',
        purchase_order_id: 0,
        warehouse_id: 0,
        receipt_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const [items, setItems] = useState<CreateGRNItemInput[]>([]);

    // Handle PO selection and populate items
    useEffect(() => {
        if (selectedPO) {
            setFormData(prev => ({
                ...prev,
                purchase_order_id: selectedPO.id,
                warehouse_id: selectedPO.warehouse_id, // Default to PO warehouse
            }));

            // Auto-populate items with remaining quantity
            const poItems = selectedPO.items || [];
            const grnItems: CreateGRNItemInput[] = poItems
                .filter((item: PurchaseOrderItem) => item.quantity > item.received_quantity)
                .map((item: PurchaseOrderItem) => ({
                    po_item_id: item.id,
                    material_id: item.material_id,
                    warehouse_location_id: 0,
                    quantity: item.quantity - item.received_quantity,
                    unit_cost: item.unit_price,
                    notes: '',
                }));
            setItems(grnItems);
        }
    }, [selectedPO]);

    // Generate GRN number
    useEffect(() => {
        const now = new Date();
        const genGRN = `GRN-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        setFormData(prev => ({ ...prev, grn_number: genGRN }));
    }, []);

    const updateItem = (index: number, field: keyof CreateGRNItemInput, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.purchase_order_id === 0 || formData.warehouse_id === 0 || items.length === 0) {
            alert('Please select a Purchase Order, Warehouse, and ensure there are items to receive.');
            return;
        }

        if (items.some(item => item.quantity <= 0 || item.warehouse_location_id === 0)) {
            alert('Please ensure all items have a quantity greater than 0 and a warehouse location selected.');
            return;
        }

        try {
            const payload: CreateGRNInput = {
                ...formData,
                purchase_order_id: Number(formData.purchase_order_id),
                warehouse_id: Number(formData.warehouse_id),
                items: items.map(item => ({
                    ...item,
                    po_item_id: Number(item.po_item_id),
                    material_id: Number(item.material_id),
                    warehouse_location_id: Number(item.warehouse_location_id),
                    quantity: Number(item.quantity),
                    unit_cost: Number(item.unit_cost),
                })),
            };

            const result = await createMutation.mutateAsync(payload);
            navigate(`/grns/${result.id}`);
        } catch (err: any) {
            console.error('Failed to create GRN:', err);
            alert(`Error creating GRN: ${err.response?.data?.error?.message || err.message}`);
        }
    };

    const selectedWarehouse = warehouses.find(w => w.id === formData.warehouse_id);
    const warehouseLocations = selectedWarehouse?.locations || [];

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
            {/* Main Info */}
            <div className="card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                <div className="lg:col-span-1">
                    <label className="label">GRN Number <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="input w-full bg-gray-50"
                        value={formData.grn_number}
                        onChange={(e) => setFormData({ ...formData, grn_number: e.target.value })}
                        required
                    />
                </div>
                <div className="lg:col-span-1">
                    <label className="label">Purchase Order <span className="text-red-500">*</span></label>
                    <select
                        className="select w-full"
                        value={selectedPOId}
                        onChange={(e) => setSelectedPOId(Number(e.target.value))}
                        required
                    >
                        <option value={0}>Select Approved PO</option>
                        {approvedPOs.map((po: PurchaseOrder) => (
                            <option key={po.id} value={po.id}>
                                {po.po_number} - {po.supplier?.name}
                            </option>
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
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Receipt Date <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        className="input w-full"
                        value={formData.receipt_date}
                        onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                        required
                    />
                </div>
            </div>

            {/* Items Table */}
            <div className="card p-0 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Received Items
                    </h3>
                    <div className="text-sm text-gray-500">
                        {items.length} items to receive
                    </div>
                </div>

                {isLoadingPO ? (
                    <div className="p-12 text-center text-gray-500">
                        Loading PO items...
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 border-2 border-dashed border-gray-200 m-4 rounded-lg">
                        <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>Select an approved Purchase Order to load items</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-4 py-3 min-w-[250px]">Material</th>
                                    <th className="px-4 py-3 text-right">Qty to Receive</th>
                                    <th className="px-4 py-3 min-w-[200px]">Warehouse Location <span className="text-red-500">*</span></th>
                                    <th className="px-4 py-3 min-w-[150px]">Batch/Lot</th>
                                    <th className="px-4 py-3 min-w-[150px]">Dates</th>
                                    <th className="px-4 py-3 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((item, index) => {
                                    const poItem = selectedPO?.items.find((pi: PurchaseOrderItem) => pi.id === item.po_item_id);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{poItem?.material?.trading_name}</div>
                                                <div className="text-xs text-gray-500">{poItem?.material?.code}</div>
                                                <div className="mt-1 text-[length:var(--font-size-3xs)] text-primary uppercase font-bold">
                                                    Ordered: {poItem?.quantity} | Received: {poItem?.received_quantity}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    className="input w-24 text-right"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                    min={0.001}
                                                    max={poItem ? poItem.quantity - poItem.received_quantity : undefined}
                                                    required
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    className="select w-full"
                                                    value={item.warehouse_location_id}
                                                    onChange={(e) => updateItem(index, 'warehouse_location_id', Number(e.target.value))}
                                                    required
                                                >
                                                    <option value={0}>Select Location</option>
                                                    {warehouseLocations.map((loc: WarehouseLocation) => (
                                                        <option key={loc.id} value={loc.id}>{loc.full_path}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="Batch #"
                                                    className="input w-full text-xs py-1 px-2 h-auto"
                                                    value={item.batch_number || ''}
                                                    onChange={(e) => updateItem(index, 'batch_number', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Lot #"
                                                    className="input w-full text-xs py-1 px-2 h-auto"
                                                    value={item.lot_number || ''}
                                                    onChange={(e) => updateItem(index, 'lot_number', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 space-y-2">
                                                <div>
                                                    <label className="text-[length:var(--font-size-3xs)] uppercase text-gray-500 font-bold block">Mfg Date</label>
                                                    <input
                                                        type="date"
                                                        className="input w-full text-xs py-1 px-2 h-auto"
                                                        value={item.manufacture_date || ''}
                                                        onChange={(e) => updateItem(index, 'manufacture_date', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[length:var(--font-size-3xs)] uppercase text-gray-500 font-bold block">Expiry Date</label>
                                                    <input
                                                        type="date"
                                                        className="input w-full text-xs py-1 px-2 h-auto"
                                                        value={item.expiry_date || ''}
                                                        onChange={(e) => updateItem(index, 'expiry_date', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
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
                )}
            </div>

            <div className="card p-6">
                <label className="label">General Notes</label>
                <textarea
                    className="input w-full"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Provide any additional information about this receipt..."
                />
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-4 shadow-lg z-10">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary px-8"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary px-12 flex items-center gap-2"
                    disabled={createMutation.isPending || items.length === 0}
                >
                    <Save className="w-4 h-4" />
                    {createMutation.isPending ? 'Saving...' : 'Save Receipt'}
                </button>
            </div>
        </form>
    );
}
