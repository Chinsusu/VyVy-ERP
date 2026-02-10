import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Package, MapPin, Tag } from 'lucide-react';
import { useMaterialRequest } from '../../hooks/useMaterialRequests';
import { useCreateMaterialIssueNote } from '../../hooks/useMaterialIssueNotes';
import { useStockBalance } from '../../hooks/useStockBalance';
import { useWarehouseLocations } from '../../hooks/useWarehouseLocations';
import type {
    CreateMaterialIssueNoteInput,
    CreateMaterialIssueNoteItemInput
} from '../../types/materialIssueNote';

export default function MINForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mrId = searchParams.get('mr_id');

    const { data: mr, isLoading: isLoadingMR } = useMaterialRequest(Number(mrId));
    const createMutation = useCreateMaterialIssueNote();
    const { data: locationsData } = useWarehouseLocations({ warehouse_id: mr?.warehouse_id || 0 });
    const locations = locationsData?.data || [];

    const [formData, setFormData] = useState<Omit<CreateMaterialIssueNoteInput, 'items'>>({
        material_request_id: 0,
        warehouse_id: 0,
        issue_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const [items, setItems] = useState<CreateMaterialIssueNoteItemInput[]>([]);

    useEffect(() => {
        if (mr) {
            setFormData(prev => ({
                ...prev,
                material_request_id: mr.id,
                warehouse_id: mr.warehouse_id,
                notes: `Issued for MR ${mr.mr_number}`,
            }));

            // Initialize items from MR
            const initialItems = mr.items
                .filter(item => item.requested_quantity > item.issued_quantity)
                .map(item => ({
                    mr_item_id: item.id,
                    material_id: item.material_id,
                    warehouse_location_id: 0,
                    batch_number: '',
                    lot_number: '',
                    quantity: item.requested_quantity - item.issued_quantity,
                    notes: '',
                    // Temp field for UI to show material info
                    _material: item.material,
                    _requested: item.requested_quantity,
                    _issued: item.issued_quantity
                }));
            setItems(initialItems as any);
        }
    }, [mr]);

    const handleItemUpdate = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.some(i => i.warehouse_location_id === 0 || !i.batch_number)) {
            alert('Please select a location and batch for all items.');
            return;
        }

        try {
            const payload: CreateMaterialIssueNoteInput = {
                ...formData,
                items: items.map(({ _material, _requested, _issued, ...rest }: any) => ({
                    ...rest,
                    warehouse_location_id: Number(rest.warehouse_location_id),
                    quantity: Number(rest.quantity)
                })) as CreateMaterialIssueNoteItemInput[]
            };

            const result = await createMutation.mutateAsync(payload);
            navigate(`/material-issue-notes/${result.id}`);
        } catch (err) {
            alert('Error creating issue note: ' + (err as Error).message);
        }
    };

    if (isLoadingMR) return <div className="p-8 text-center text-gray-500">Loading request data...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header Info */}
            <div className="card grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="label">Issue Date</label>
                    <input
                        type="date"
                        className="input w-full"
                        value={formData.issue_date}
                        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="label">Originating Request</label>
                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium">
                        {mr?.mr_number || 'N/A'}
                    </div>
                </div>
                <div>
                    <label className="label">Warehouse</label>
                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium">
                        {mr?.warehouse?.name || 'N/A'}
                    </div>
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
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Package className="w-6 h-6 text-primary-600" />
                    Material Picking
                </h3>

                {items.map((item: any, index) => (
                    <ItemPickingRow
                        key={index}
                        item={item}
                        locations={locations}
                        warehouseId={formData.warehouse_id}
                        onUpdate={(field, val) => handleItemUpdate(index, field, val)}
                    />
                ))}

                {items.length === 0 && (
                    <div className="card text-center p-12 text-gray-500 italic">
                        All items in this request have already been issued.
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
                    disabled={createMutation.isPending || items.length === 0}
                >
                    <Save className="w-5 h-5" />
                    Create Issue Note (Draft)
                </button>
            </div>
        </form>
    );
}

function ItemPickingRow({ item, locations, warehouseId, onUpdate }: { item: any; locations: any[]; warehouseId: number; onUpdate: (field: string, val: any) => void }) {
    const { data: stock } = useStockBalance({
        item_id: item.material_id,
        warehouse_id: warehouseId
    });

    const availableBatches = stock || [];

    return (
        <div className="card border-l-4 border-l-primary-500 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Material Info */}
                <div className="lg:w-1/3">
                    <div className="font-bold text-lg text-gray-900">{item._material?.trading_name}</div>
                    <div className="text-xs text-gray-500 font-mono mb-2">{item._material?.code}</div>
                    <div className="flex items-center gap-4 text-sm mt-2">
                        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            Requested: <span className="font-bold">{item._requested}</span>
                        </div>
                        <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded">
                            Issued: <span className="font-bold">{item._issued}</span>
                        </div>
                    </div>
                </div>

                {/* Picking Details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="label text-xs uppercase text-gray-400 font-bold flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Batch Number
                        </label>
                        <select
                            className="select w-full"
                            value={item.batch_number}
                            onChange={(e) => {
                                const b = availableBatches.find((sb: any) => sb.batch_number === e.target.value);
                                if (b) {
                                    onUpdate('batch_number', b.batch_number);
                                    onUpdate('lot_number', b.lot_number);
                                    onUpdate('warehouse_location_id', b.warehouse_location_id);
                                } else {
                                    onUpdate('batch_number', '');
                                }
                            }}
                        >
                            <option value="">Select Batch</option>
                            {availableBatches.map((b: any) => (
                                <option key={`${b.batch_number}-${b.warehouse_location_id}`} value={b.batch_number}>
                                    {b.batch_number} (Avail: {b.available_quantity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label text-xs uppercase text-gray-400 font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Location
                        </label>
                        <select
                            className="select w-full"
                            value={item.warehouse_location_id}
                            onChange={(e) => onUpdate('warehouse_location_id', e.target.value)}
                        >
                            <option value={0}>Select Location</option>
                            {locations.map((loc: any) => (
                                <option key={loc.id} value={loc.id}>{loc.code} - {loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label text-xs uppercase text-gray-400 font-bold">Qty to Issue</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="input w-full pr-12 text-right font-bold"
                                value={item.quantity}
                                onChange={(e) => onUpdate('quantity', Number(e.target.value))}
                                step="0.001"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                {item._material?.unit}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-end">
                        <div className="w-full text-xs text-center p-2 bg-gray-50 rounded border border-dashed border-gray-200">
                            {item.quantity > (item._requested - item._issued) && (
                                <span className="text-red-500 font-medium">Exceeds remaining!</span>
                            )}
                            {item.quantity <= (item._requested - item._issued) && item.quantity > 0 && (
                                <span className="text-green-600 font-medium italic">Ready to pick</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
