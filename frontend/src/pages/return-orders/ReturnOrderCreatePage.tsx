import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateReturnOrder } from '../../hooks/useReturnOrders';
import { useCarriers } from '../../hooks/useCarriers';
import { RotateCcw, ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import type { CreateReturnOrderRequest, CreateReturnOrderItemRequest } from '../../types/returnOrder';
import axios from '../../lib/axios';

interface DOForReturn {
    id: number;
    do_number: string;
    customer_name: string;
    carrier_id?: number;
    status: string;
    items: DOItemForReturn[];
}

interface DOItemForReturn {
    id: number;
    finished_product_id: number;
    product_name: string;
    product_sku: string;
    quantity: number;
}

export default function ReturnOrderCreatePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const doIdFromUrl = searchParams.get('do_id');
    const createMutation = useCreateReturnOrder();
    const { data: carriersData } = useCarriers({});

    const [doId, setDoId] = useState(doIdFromUrl || '');
    const [deliveryOrder, setDeliveryOrder] = useState<DOForReturn | null>(null);
    const [loadingDO, setLoadingDO] = useState(false);
    const [doError, setDoError] = useState('');

    const [form, setForm] = useState({
        return_type: 'customer_return',
        return_date: new Date().toISOString().split('T')[0],
        carrier_id: '',
        tracking_number: '',
        reason: '',
        resolution: '',
        notes: '',
    });

    const [items, setItems] = useState<(CreateReturnOrderItemRequest & { product_name?: string; product_sku?: string; max_qty?: number })[]>([]);

    useEffect(() => {
        if (doIdFromUrl) {
            loadDO(doIdFromUrl);
        }
    }, [doIdFromUrl]);

    const loadDO = async (id: string) => {
        setLoadingDO(true);
        setDoError('');
        try {
            const { data } = await axios.get(`/delivery-orders/${id}`);
            const doData = data.data;
            if (doData.status !== 'shipped' && doData.status !== 'delivered') {
                setDoError(`Đơn giao phải có trạng thái "shipped" hoặc "delivered" (hiện tại: ${doData.status})`);
                setDeliveryOrder(null);
                return;
            }
            const mapped: DOForReturn = {
                id: doData.id,
                do_number: doData.do_number,
                customer_name: doData.customer_name,
                carrier_id: doData.carrier_id,
                status: doData.status,
                items: (doData.items || []).map((item: any) => ({
                    id: item.id,
                    finished_product_id: item.finished_product_id || item.product_id,
                    product_name: item.product?.name || item.product_name || 'N/A',
                    product_sku: item.product?.code || item.product_sku || '',
                    quantity: item.quantity,
                })),
            };
            setDeliveryOrder(mapped);
            if (mapped.carrier_id) {
                setForm(f => ({ ...f, carrier_id: mapped.carrier_id!.toString() }));
            }
        } catch {
            setDoError('Không tìm thấy đơn giao');
            setDeliveryOrder(null);
        } finally {
            setLoadingDO(false);
        }
    };

    const addItem = (doItem: DOItemForReturn) => {
        if (items.find(i => i.delivery_order_item_id === doItem.id)) return;
        setItems([...items, {
            delivery_order_item_id: doItem.id,
            finished_product_id: doItem.finished_product_id,
            quantity_returned: 1,
            reason: '',
            notes: '',
            product_name: doItem.product_name,
            product_sku: doItem.product_sku,
            max_qty: doItem.quantity,
        }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deliveryOrder || items.length === 0) return;

        const req: CreateReturnOrderRequest = {
            delivery_order_id: deliveryOrder.id,
            return_type: form.return_type,
            return_date: form.return_date,
            carrier_id: form.carrier_id ? parseInt(form.carrier_id) : undefined,
            tracking_number: form.tracking_number || undefined,
            reason: form.reason || undefined,
            resolution: form.resolution || undefined,
            notes: form.notes || undefined,
            items: items.map(i => ({
                delivery_order_item_id: i.delivery_order_item_id,
                finished_product_id: i.finished_product_id,
                quantity_returned: i.quantity_returned,
                reason: i.reason || undefined,
                notes: i.notes || undefined,
            })),
        };

        try {
            const result = await createMutation.mutateAsync(req);
            navigate(`/return-orders/${result.id}`);
        } catch (error: any) {
            alert(error?.response?.data?.error || 'Lỗi tạo đơn hoàn');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/return-orders')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="p-2 bg-orange-100 rounded-lg">
                    <RotateCcw className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tạo đơn hoàn hàng</h1>
                    <p className="text-slate-500 text-sm">Chọn đơn giao hàng và sản phẩm hoàn trả</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* DO Selection */}
                <div className="card p-6 mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Đơn giao hàng</h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={doId}
                            onChange={e => setDoId(e.target.value)}
                            placeholder="Nhập ID đơn giao..."
                            className="input flex-1"
                        />
                        <button
                            type="button"
                            onClick={() => loadDO(doId)}
                            disabled={!doId || loadingDO}
                            className="btn-primary"
                        >
                            {loadingDO ? 'Đang tìm...' : 'Tìm'}
                        </button>
                    </div>
                    {doError && <p className="text-red-500 text-sm mt-2">{doError}</p>}
                    {deliveryOrder && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-4 text-sm">
                                <span className="font-mono font-medium">{deliveryOrder.do_number}</span>
                                <span className="text-slate-500">•</span>
                                <span>{deliveryOrder.customer_name}</span>
                                <span className="text-slate-500">•</span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{deliveryOrder.status}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Return Info */}
                <div className="card p-6 mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Thông tin hoàn hàng</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="label">Loại hoàn</label>
                            <select value={form.return_type} onChange={e => setForm({ ...form, return_type: e.target.value })} className="input w-full">
                                <option value="customer_return">Khách trả</option>
                                <option value="damaged">Hư hỏng</option>
                                <option value="wrong_item">Sai hàng</option>
                                <option value="refused">Từ chối nhận</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Ngày hoàn</label>
                            <input type="date" value={form.return_date} onChange={e => setForm({ ...form, return_date: e.target.value })} className="input w-full" />
                        </div>
                        <div>
                            <label className="label">Đơn vị vận chuyển</label>
                            <select value={form.carrier_id} onChange={e => setForm({ ...form, carrier_id: e.target.value })} className="input w-full">
                                <option value="">-- Chọn --</option>
                                {carriersData?.items?.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Mã vận đơn</label>
                            <input type="text" value={form.tracking_number} onChange={e => setForm({ ...form, tracking_number: e.target.value })} className="input w-full" placeholder="Số tracking..." />
                        </div>
                        <div>
                            <label className="label">Xử lý</label>
                            <select value={form.resolution} onChange={e => setForm({ ...form, resolution: e.target.value })} className="input w-full">
                                <option value="">-- Chưa quyết định --</option>
                                <option value="refund">Hoàn tiền</option>
                                <option value="replace">Đổi hàng</option>
                                <option value="restock">Nhập kho lại</option>
                                <option value="scrap">Thanh lý</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="label">Lý do hoàn</label>
                        <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="input w-full" rows={2} placeholder="Lý do hoàn hàng..." />
                    </div>
                    <div className="mt-4">
                        <label className="label">Ghi chú</label>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input w-full" rows={2} placeholder="Ghi chú thêm..." />
                    </div>
                </div>

                {/* Items selection */}
                {deliveryOrder && (
                    <div className="card p-6 mb-4">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Sản phẩm hoàn trả</h2>

                        {/* Available items from DO */}
                        <div className="mb-4">
                            <p className="text-sm text-slate-500 mb-2">Sản phẩm trong đơn giao:</p>
                            <div className="flex flex-wrap gap-2">
                                {deliveryOrder.items.map(doItem => (
                                    <button
                                        key={doItem.id}
                                        type="button"
                                        onClick={() => addItem(doItem)}
                                        disabled={items.some(i => i.delivery_order_item_id === doItem.id)}
                                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span className="font-mono text-xs">{doItem.product_sku}</span>
                                        <span>{doItem.product_name}</span>
                                        <span className="text-slate-400">(SL: {doItem.quantity})</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selected items */}
                        {items.length > 0 && (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b">
                                        <th className="text-left p-2 text-sm font-semibold text-slate-600">Sản phẩm</th>
                                        <th className="text-right p-2 text-sm font-semibold text-slate-600">SL hoàn</th>
                                        <th className="text-left p-2 text-sm font-semibold text-slate-600">Lý do</th>
                                        <th className="text-center p-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-100">
                                            <td className="p-2">
                                                <div className="text-sm font-medium">{item.product_name}</div>
                                                <div className="text-xs text-slate-400 font-mono">{item.product_sku}</div>
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={item.max_qty || 999}
                                                    value={item.quantity_returned}
                                                    onChange={e => updateItem(idx, 'quantity_returned', parseInt(e.target.value) || 1)}
                                                    className="input w-20 text-right"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={item.reason || ''}
                                                    onChange={e => updateItem(idx, 'reason', e.target.value)}
                                                    className="input w-full text-sm"
                                                    placeholder="Lý do..."
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <button type="button" onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/return-orders')} className="btn-secondary">Hủy</button>
                    <button
                        type="submit"
                        disabled={!deliveryOrder || items.length === 0 || createMutation.isPending}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {createMutation.isPending ? 'Đang tạo...' : 'Tạo đơn hoàn'}
                    </button>
                </div>
            </form>
        </div>
    );
}
