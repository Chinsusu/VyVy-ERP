import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Package, Tag, Plus, Trash2, Store } from 'lucide-react';
import { useWarehouses, useWarehouseLocations } from '../../hooks/useWarehouses';
import { useFinishedProducts } from '../../hooks/useFinishedProducts';
import { useStockBalance } from '../../hooks/useStockBalance';
import { useCreateDeliveryOrder, useUpdateDeliveryOrder, useDeliveryOrder } from '../../hooks/useDeliveryOrders';
import { useSalesChannels } from '../../hooks/useSalesChannels';
import type { CreateDeliveryOrderRequest, CreateDeliveryOrderItem } from '../../types/deliveryOrder';

interface DOFormProps {
    isEdit?: boolean;
}

export default function DOForm({ isEdit = false }: DOFormProps) {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data: existingDO, isLoading: isLoadingDO } = useDeliveryOrder(Number(id));
    const { data: warehouses } = useWarehouses();
    const { data: channelsData } = useSalesChannels({ is_active: true });
    const salesChannels = channelsData?.data || [];
    const createMutation = useCreateDeliveryOrder();
    const updateMutation = useUpdateDeliveryOrder();

    const [formData, setFormData] = useState<Omit<CreateDeliveryOrderRequest, 'items'>>({
        warehouse_id: 0,
        sales_channel_id: undefined,
        customer_name: '',
        customer_address: '',
        delivery_date: new Date().toISOString().split('T')[0],
        shipping_method: '',
        notes: '',
    });

    const [items, setItems] = useState<(CreateDeliveryOrderItem & { _product?: any })[]>([]);

    const { data: locations } = useWarehouseLocations(formData.warehouse_id);
    const { data: productsData } = useFinishedProducts({ is_active: true });
    const products = productsData?.data || [];

    useEffect(() => {
        if (isEdit && existingDO) {
            setFormData({
                warehouse_id: existingDO.warehouse_id,
                sales_channel_id: existingDO.sales_channel_id || undefined,
                customer_name: existingDO.customer_name,
                customer_address: existingDO.customer_address || '',
                delivery_date: new Date(existingDO.delivery_date).toISOString().split('T')[0],
                shipping_method: existingDO.shipping_method || '',
                notes: existingDO.notes || '',
            });
            if (existingDO.items) {
                setItems(existingDO.items.map(item => ({
                    finished_product_id: item.finished_product_id,
                    quantity: item.quantity,
                    warehouse_location_id: item.warehouse_location_id || 0,
                    batch_number: item.batch_number || '',
                    lot_number: item.lot_number || '',
                    notes: item.notes || '',
                    _product: { name: item.product_name, code: item.product_sku }
                })));
            }
        }
    }, [isEdit, existingDO]);

    const addItem = () => {
        setItems([...items, { finished_product_id: 0, quantity: 1, warehouse_location_id: 0, batch_number: '', lot_number: '', notes: '' }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        if (field === 'finished_product_id') {
            const product = products.find(p => p.id === Number(value));
            newItems[index]._product = product;
        }
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.warehouse_id === 0) {
            alert('Please select a warehouse');
            return;
        }

        if (items.length === 0) {
            alert('Please add at least one item');
            return;
        }

        const payload: CreateDeliveryOrderRequest = {
            ...formData,
            sales_channel_id: formData.sales_channel_id || undefined,
            items: items.map(item => ({
                finished_product_id: Number(item.finished_product_id),
                quantity: Number(item.quantity),
                warehouse_location_id: item.warehouse_location_id ? Number(item.warehouse_location_id) : undefined,
                batch_number: item.batch_number,
                lot_number: item.lot_number,
                notes: item.notes,
            })),
        };

        try {
            if (isEdit) {
                await updateMutation.mutateAsync({ id: Number(id), data: payload });
                alert('Delivery order updated successfully');
            } else {
                const result = await createMutation.mutateAsync(payload);
                alert('Delivery order created successfully');
                navigate(`/delivery-orders/${result.id}`);
            }
        } catch (err) {
            alert('Error: ' + (err as Error).message);
        }
    };

    if (isEdit && isLoadingDO) return <div className="p-8 text-center text-gray-500">Loading delivery order...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEdit ? `Edit Delivery Order: ${existingDO?.do_number}` : 'Create Delivery Order'}
                </h1>
            </div>

            {/* Header Info */}
            <div className="card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="label">Customer Name</label>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="label">Delivery Date</label>
                    <input
                        type="date"
                        className="input w-full"
                        value={formData.delivery_date}
                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="label">Warehouse</label>
                    <select
                        className="select w-full"
                        value={formData.warehouse_id}
                        onChange={(e) => setFormData({ ...formData, warehouse_id: Number(e.target.value) })}
                        required
                        disabled={isEdit}
                    >
                        <option value={0}>Select Warehouse</option>
                        {warehouses?.data.map((w: any) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label flex items-center gap-1">
                        <Store className="w-4 h-4" /> Sales Channel
                    </label>
                    <select
                        className="select w-full"
                        value={formData.sales_channel_id || ''}
                        onChange={(e) => setFormData({ ...formData, sales_channel_id: e.target.value ? Number(e.target.value) : undefined })}
                    >
                        <option value="">-- No Channel --</option>
                        {salesChannels.map((ch: any) => (
                            <option key={ch.id} value={ch.id}>{ch.code} - {ch.name}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="label">Customer Address</label>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.customer_address}
                        onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                    />
                </div>
                <div>
                    <label className="label">Shipping Method</label>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.shipping_method}
                        onChange={(e) => setFormData({ ...formData, shipping_method: e.target.value })}
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="label">Notes</label>
                    <textarea
                        className="input w-full"
                        rows={2}
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Package className="w-6 h-6 text-primary-600" />
                        Finished Products Picking
                    </h3>
                    <button type="button" onClick={addItem} className="btn btn-secondary flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Product
                    </button>
                </div>

                <div className="space-y-4">
                    {items.map((item, index) => (
                        <ItemPickingRow
                            key={index}
                            item={item}
                            locations={locations}
                            products={products}
                            warehouseId={formData.warehouse_id}
                            onUpdate={(field: string, val: any) => updateItem(index, field, val)}
                            onRemove={() => removeItem(index)}
                        />
                    ))}
                </div>

                {items.length === 0 && (
                    <div className="card text-center p-12 text-gray-500 italic">
                        Add at least one product to start picking.
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary flex-1">
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={createMutation.isPending || updateMutation.isPending}
                >
                    <Save className="w-5 h-5" />
                    {isEdit ? 'Update Delivery Order' : 'Create Delivery Order (Draft)'}
                </button>
            </div>
        </form>
    );
}

function ItemPickingRow({ item, products, warehouseId, onUpdate, onRemove }: any) {
    const { data: stock } = useStockBalance({
        item_id: item.finished_product_id,
        warehouse_id: warehouseId,
        item_type: 'finished_product'
    });

    const availableBatches = stock || [];

    return (
        <div className="card border-l-4 border-l-primary-500 shadow-sm relative">
            <button
                type="button"
                onClick={onRemove}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            <div className="flex flex-col lg:flex-row gap-6 pr-10">
                {/* Product Selection */}
                <div className="lg:w-1/3 space-y-2">
                    <label className="label text-xs uppercase text-gray-400 font-bold">Select Product</label>
                    <select
                        className="select w-full font-medium"
                        value={item.finished_product_id}
                        onChange={(e) => onUpdate('finished_product_id', Number(e.target.value))}
                        required
                    >
                        <option value={0}>-- Select Finished Product --</option>
                        {products.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                        ))}
                    </select>
                    {item._product && (
                        <div className="text-xs text-gray-500 font-mono">
                            SKU: {item._product.code}
                        </div>
                    )}
                </div>

                {/* Picking Details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="label text-xs uppercase text-gray-400 font-bold flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Batch / Available
                        </label>
                        <select
                            className="select w-full"
                            value={`${item.batch_number}|${item.warehouse_location_id}`}
                            onChange={(e) => {
                                const [batch, locId] = e.target.value.split('|');
                                const b = availableBatches.find((sb: any) => sb.batch_number === batch && sb.warehouse_location_id === Number(locId));
                                if (b) {
                                    onUpdate('batch_number', b.batch_number);
                                    onUpdate('lot_number', b.lot_number);
                                    onUpdate('warehouse_location_id', b.warehouse_location_id);
                                } else {
                                    onUpdate('batch_number', '');
                                    onUpdate('warehouse_location_id', 0);
                                }
                            }}
                            disabled={!item.finished_product_id || warehouseId === 0}
                        >
                            <option value="|0">Select Batch</option>
                            {availableBatches.map((b: any) => (
                                <option key={`${b.batch_number}-${b.warehouse_location_id}`} value={`${b.batch_number}|${b.warehouse_location_id}`}>
                                    {b.batch_number || 'No Batch'} ({b.available_quantity}) - {b.location?.code || 'No Loc'}
                                </option>
                            ))}
                        </select>
                        {!item.batch_number && item.finished_product_id > 0 && availableBatches.length === 0 && (
                            <span className="text-[10px] text-red-500 mt-1 block">No stock available in this warehouse</span>
                        )}
                    </div>

                    <div>
                        <label className="label text-xs uppercase text-gray-400 font-bold">Quantity</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="input w-full pr-12 text-right font-bold"
                                value={item.quantity}
                                onChange={(e) => onUpdate('quantity', Number(e.target.value))}
                                step="0.001"
                                min="0.001"
                                required
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                PCS
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="label text-xs uppercase text-gray-400 font-bold">Notes</label>
                        <input
                            type="text"
                            className="input w-full text-sm"
                            value={item.notes || ''}
                            onChange={(e) => onUpdate('notes', e.target.value)}
                            placeholder="Internal notes..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
