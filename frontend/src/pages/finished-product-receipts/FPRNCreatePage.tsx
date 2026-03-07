import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useCreateFinishedProductReceipt } from '../../hooks/useFinishedProductReceipts';
import { useWarehouses } from '../../hooks/useWarehouses';
import type { CreateFPRNInput, CreateFPRNItemInput } from '../../types/finishedProductReceipt';

// Inline fetch for finished products (no dedicated hook needed for simple select)
import axios from 'axios';

export default function FPRNCreatePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('production_plan_id');

    const createMutation = useCreateFinishedProductReceipt();
    const { data: warehousesData } = useWarehouses({ page_size: 100 });
    const warehouses = warehousesData?.data || [];

    const [finishedProducts, setFinishedProducts] = useState<{ id: number; name: string; code: string; unit: string }[]>([]);

    const [formData, setFormData] = useState<Omit<CreateFPRNInput, 'items'>>({
        production_plan_id: planId ? Number(planId) : undefined,
        warehouse_id: 0,
        receipt_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const [items, setItems] = useState<CreateFPRNItemInput[]>([{
        finished_product_id: 0,
        quantity: 0,
        unit_cost: 0,
        batch_number: '',
    }]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}/finished-products?limit=200`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
            const products = res.data?.data?.items || res.data?.data || [];
            setFinishedProducts(products);
        }).catch(() => { });
    }, []);

    const addItem = () => {
        setItems(prev => [...prev, { finished_product_id: 0, quantity: 0, unit_cost: 0, batch_number: '' }]);
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof CreateFPRNItemInput, value: string | number) => {
        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: field === 'quantity' || field === 'unit_cost' ? Number(value) : value } : item
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.warehouse_id === 0) { alert('Vui lòng chọn kho nhập.'); return; }
        if (items.some(i => i.finished_product_id === 0 || i.quantity <= 0)) {
            alert('Vui lòng điền đầy đủ thông tin thành phẩm và số lượng.');
            return;
        }
        try {
            const result = await createMutation.mutateAsync({ ...formData, items });
            navigate(`/finished-product-receipts/${result.data.data.id}`);
        } catch (err) {
            alert('Lỗi tạo phiếu: ' + (err as Error).message);
        }
    };

    const commercialWarehouses = (warehouses as { id: number; name: string; warehouse_type: string }[]).filter(
        w => w.warehouse_type === 'commercial' || w.warehouse_type === 'factory'
    );

    return (
        <div className="animate-fade-in pb-12">
            <div className="mb-6">
                <Link to="/finished-product-receipts" className="text-gray-600 hover:text-primary flex items-center gap-2 mb-4 w-fit">
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Tạo phiếu nhập kho thành phẩm</h1>
                <p className="text-gray-600 mt-1">Nhập thành phẩm từ sản xuất vào kho bán hàng</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header info */}
                <div className="card grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="label">Kho nhập <span className="text-red-500">*</span></label>
                        <select
                            className="input w-full"
                            value={formData.warehouse_id}
                            onChange={e => setFormData({ ...formData, warehouse_id: Number(e.target.value) })}
                            required
                        >
                            <option value={0}>-- Chọn kho --</option>
                            {commercialWarehouses.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Ngày nhập <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            className="input w-full"
                            value={formData.receipt_date}
                            onChange={e => setFormData({ ...formData, receipt_date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">KHSX liên kết</label>
                        <input
                            type="number"
                            className="input w-full"
                            placeholder="ID kế hoạch sản xuất"
                            value={formData.production_plan_id || ''}
                            onChange={e => setFormData({ ...formData, production_plan_id: e.target.value ? Number(e.target.value) : undefined })}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="label">Ghi chú</label>
                        <textarea
                            className="input w-full h-20 resize-none"
                            placeholder="Ghi chú phiếu nhập kho..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>

                {/* Items */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Danh sách thành phẩm</h3>
                        <button type="button" onClick={addItem} className="btn btn-secondary flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Thêm dòng
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="md:col-span-2">
                                    <label className="label text-xs">Thành phẩm *</label>
                                    <select
                                        className="input w-full"
                                        value={item.finished_product_id}
                                        onChange={e => updateItem(index, 'finished_product_id', Number(e.target.value))}
                                        required
                                    >
                                        <option value={0}>-- Chọn thành phẩm --</option>
                                        {finishedProducts.map(fp => (
                                            <option key={fp.id} value={fp.id}>{fp.name} ({fp.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label text-xs">Số lượng *</label>
                                    <input
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        className="input w-full"
                                        value={item.quantity || ''}
                                        onChange={e => updateItem(index, 'quantity', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label text-xs">Số lô</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="VD: LOT-250307"
                                        value={item.batch_number || ''}
                                        onChange={e => updateItem(index, 'batch_number', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label text-xs">Ngày hết hạn</label>
                                    <input
                                        type="date"
                                        className="input w-full"
                                        value={item.expiry_date || ''}
                                        onChange={e => updateItem(index, 'expiry_date', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <label className="label text-xs">Đơn giá (VNĐ)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="input w-full"
                                            placeholder="0"
                                            value={item.unit_cost || ''}
                                            onChange={e => updateItem(index, 'unit_cost', e.target.value)}
                                        />
                                    </div>
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="btn text-red-500 border-red-200 hover:bg-red-50 mb-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link to="/finished-product-receipts" className="btn btn-secondary">Hủy</Link>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="btn btn-primary"
                    >
                        {createMutation.isPending ? 'Đang tạo...' : 'Tạo phiếu nhập kho'}
                    </button>
                </div>
            </form>
        </div>
    );
}
