import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ArrowRightLeft } from 'lucide-react';
import { useCreateStockTransfer } from '../../hooks/useStockTransfers';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useMaterials } from '../../hooks/useMaterials';
import type { CreateStockTransferItemInput } from '../../types/stockTransfer';

export default function StockTransferCreatePage() {
    const navigate = useNavigate();
    const createMutation = useCreateStockTransfer();
    const { data: warehousesData } = useWarehouses({ page_size: 100 });
    const { data: materialsData } = useMaterials({ page_size: 200 });

    const warehouses = warehousesData?.data || [];
    const materials = materialsData?.data || [];

    const [fromWarehouseId, setFromWarehouseId] = useState('');
    const [toWarehouseId, setToWarehouseId] = useState('');
    const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<CreateStockTransferItemInput[]>([
        { item_type: 'material', item_id: 0, quantity: 1 }
    ]);
    const [error, setError] = useState('');

    const addItem = () => {
        setItems(prev => [...prev, { item_type: 'material', item_id: 0, quantity: 1 }]);
    };

    const removeItem = (idx: number) => {
        setItems(prev => prev.filter((_, i) => i !== idx));
    };

    const updateItem = (idx: number, field: string, value: unknown) => {
        setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fromWarehouseId || !toWarehouseId) {
            setError('Vui lòng chọn kho xuất và kho nhập');
            return;
        }
        if (fromWarehouseId === toWarehouseId) {
            setError('Kho xuất và kho nhập phải khác nhau');
            return;
        }
        const validItems = items.filter(it => it.item_id > 0 && it.quantity > 0);
        if (validItems.length === 0) {
            setError('Vui lòng thêm ít nhất một dòng nguyên vật liệu hợp lệ');
            return;
        }

        try {
            const result = await createMutation.mutateAsync({
                from_warehouse_id: Number(fromWarehouseId),
                to_warehouse_id: Number(toWarehouseId),
                transfer_date: transferDate,
                notes: notes || undefined,
                items: validItems,
            });
            navigate(`/stock-transfers/${result.id}`);
        } catch (err) {
            setError((err as Error).message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="animate-fade-in pb-12 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-primary-600 border border-transparent hover:border-gray-200">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ArrowRightLeft className="w-8 h-8 text-primary-600" />
                        Tạo phiếu chuyển kho
                    </h1>
                    <p className="text-gray-500 mt-1">Chuyển nguyên vật liệu giữa các kho</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
                )}

                {/* Header Info */}
                <div className="card">
                    <h3 className="text-lg font-bold mb-4">Thông tin phiếu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Kho xuất <span className="text-red-500">*</span></label>
                            <select
                                className="input w-full"
                                value={fromWarehouseId}
                                onChange={e => setFromWarehouseId(e.target.value)}
                                required
                            >
                                <option value="">-- Chọn kho xuất --</option>
                                {warehouses.map((w: { id: number; name: string; type: string }) => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Kho nhập <span className="text-red-500">*</span></label>
                            <select
                                className="input w-full"
                                value={toWarehouseId}
                                onChange={e => setToWarehouseId(e.target.value)}
                                required
                            >
                                <option value="">-- Chọn kho nhập --</option>
                                {warehouses.map((w: { id: number; name: string; type: string }) => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Ngày chuyển <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                className="input w-full"
                                value={transferDate}
                                onChange={e => setTransferDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Ghi chú</label>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="Ghi chú thêm..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Danh sách nguyên vật liệu</h3>
                        <button type="button" onClick={addItem} className="btn btn-secondary flex items-center gap-2 text-sm">
                            <Plus className="w-4 h-4" />
                            Thêm dòng
                        </button>
                    </div>
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="col-span-6">
                                    <label className="label text-xs">Nguyên vật liệu</label>
                                    <select
                                        className="input w-full text-sm"
                                        value={item.item_id || ''}
                                        onChange={e => updateItem(idx, 'item_id', Number(e.target.value))}
                                    >
                                        <option value="">-- Chọn --</option>
                                        {materials.map((m: { id: number; trading_name: string; code: string; unit: string }) => (
                                            <option key={m.id} value={m.id}>{m.trading_name} ({m.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="label text-xs">Lô hàng</label>
                                    <input
                                        type="text"
                                        className="input w-full text-sm"
                                        placeholder="Lô..."
                                        value={item.batch_number || ''}
                                        onChange={e => updateItem(idx, 'batch_number', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="label text-xs">Số lượng <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        className="input w-full text-sm"
                                        min="0.001"
                                        step="0.001"
                                        value={item.quantity}
                                        onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="col-span-2 flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(idx)}
                                        disabled={items.length <= 1}
                                        className="btn btn-secondary text-red-500 border-red-100 hover:bg-red-50 w-full text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Hủy</button>
                    <button
                        type="submit"
                        className="btn btn-primary flex items-center gap-2"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Đang tạo...' : 'Tạo phiếu chuyển kho'}
                    </button>
                </div>
            </form>
        </div>
    );
}
