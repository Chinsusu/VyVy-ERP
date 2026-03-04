import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, X, ShoppingCart } from 'lucide-react';
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

const selectCls = 'w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
const inputCls = 'input w-full';
const inputRightCls = 'input w-full text-right';

export default function PurchaseOrderForm({ initialData, isEdit }: PurchaseOrderFormProps) {
    const navigate = useNavigate();

    const { data: materialsData } = useMaterials({ page: 1, page_size: 1000 });
    const { data: suppliersData } = useSuppliers({ page: 1, page_size: 1000 });
    const { data: warehousesData } = useWarehouses();

    const materials = materialsData?.data || [];
    const suppliers = suppliersData?.data || [];
    const warehouses = warehousesData?.data || [];

    const createMutation = useCreatePurchaseOrder();
    const updateMutation = useUpdatePurchaseOrder();

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
            const now = new Date();
            const genPO = `PO-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
            setFormData(prev => ({ ...prev, po_number: genPO }));
        }
    }, [initialData]);

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
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const totals = useMemo(() => {
        let subtotal = 0, taxAmount = 0, discountAmount = 0;
        items.forEach(item => {
            const base = item.quantity * item.unit_price;
            subtotal += base;
            taxAmount += base * ((item.tax_rate || 0) / 100);
            discountAmount += base * ((item.discount_rate || 0) / 100);
        });
        return { subtotal, taxAmount, discountAmount, total: subtotal + taxAmount - discountAmount };
    }, [items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.supplier_id === 0 || formData.warehouse_id === 0 || items.some(i => i.material_id === 0)) {
            alert('Vui lòng điền đầy đủ thông tin và chọn nguyên vật liệu cho tất cả dòng hàng.');
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
            alert('Lỗi khi lưu đơn mua hàng. Vui lòng kiểm tra lại.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Thông tin chung */}
            <div className="card grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <label className="label">Số PO <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className={inputCls}
                        value={formData.po_number}
                        onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                        disabled={isEdit}
                        required
                    />
                </div>
                <div>
                    <label className="label">Nhà cung cấp <span className="text-red-500">*</span></label>
                    <select
                        className={selectCls}
                        value={formData.supplier_id}
                        onChange={(e) => setFormData({ ...formData, supplier_id: Number(e.target.value) })}
                        required
                    >
                        <option value={0}>-- Chọn nhà cung cấp --</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Kho nhận hàng <span className="text-red-500">*</span></label>
                    <select
                        className={selectCls}
                        value={formData.warehouse_id}
                        onChange={(e) => setFormData({ ...formData, warehouse_id: Number(e.target.value) })}
                        required
                    >
                        <option value={0}>-- Chọn kho --</option>
                        {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Ngày đặt hàng <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        className={inputCls}
                        value={formData.order_date}
                        onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="label">Ngày giao hàng dự kiến</label>
                    <input
                        type="date"
                        className={inputCls}
                        value={formData.expected_delivery_date}
                        onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                    />
                </div>
            </div>

            {/* Danh sách hàng hóa */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        Danh Sách Hàng Hóa
                    </h3>
                    <button
                        type="button"
                        onClick={addItem}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm dòng
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="table w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                                <th className="py-2 px-3 text-left" style={{ minWidth: 220 }}>Nguyên vật liệu <span className="text-red-500">*</span></th>
                                <th className="py-2 px-3 text-right" style={{ width: 110 }}>Số lượng</th>
                                <th className="py-2 px-3 text-right" style={{ width: 130 }}>Đơn giá</th>
                                <th className="py-2 px-3 text-right" style={{ width: 90 }}>Thuế (%)</th>
                                <th className="py-2 px-3 text-right" style={{ width: 100 }}>Giảm giá (%)</th>
                                <th className="py-2 px-3 text-right" style={{ width: 120 }}>Thành tiền</th>
                                <th className="py-2 px-3 text-left" style={{ minWidth: 160 }}>Ghi chú</th>
                                <th className="py-2 px-3" style={{ width: 44 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const lineTotal = item.quantity * item.unit_price * (1 + (item.tax_rate || 0) / 100) * (1 - (item.discount_rate || 0) / 100);
                                return (
                                    <tr key={index} className="border-b last:border-0 align-top">
                                        <td className="py-2 px-3">
                                            <select
                                                className={selectCls}
                                                value={item.material_id}
                                                onChange={(e) => updateItem(index, 'material_id', Number(e.target.value))}
                                                required
                                            >
                                                <option value={0}>-- Chọn NVL --</option>
                                                {materials.map(m => (
                                                    <option key={m.id} value={m.id}>{m.trading_name} ({m.code})</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                step="0.001"
                                                className={inputRightCls}
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                min={0.001}
                                                required
                                            />
                                        </td>
                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className={inputRightCls}
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                                                min={0}
                                                required
                                            />
                                        </td>
                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                step="0.1"
                                                className={inputRightCls}
                                                value={item.tax_rate}
                                                onChange={(e) => updateItem(index, 'tax_rate', Number(e.target.value))}
                                                min={0}
                                                max={100}
                                            />
                                        </td>
                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                step="0.1"
                                                className={inputRightCls}
                                                value={item.discount_rate}
                                                onChange={(e) => updateItem(index, 'discount_rate', Number(e.target.value))}
                                                min={0}
                                                max={100}
                                            />
                                        </td>
                                        <td className="py-2 px-3 text-right font-medium align-middle">
                                            <span className="text-sm">{lineTotal.toLocaleString('vi-VN')}</span>
                                        </td>
                                        <td className="py-2 px-3">
                                            <textarea
                                                className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                rows={2}
                                                placeholder="Ghi chú cho dòng hàng này..."
                                                value={item.notes}
                                                onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                            />
                                        </td>
                                        <td className="py-2 px-3 text-center align-middle">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                                disabled={items.length <= 1}
                                                title="Xóa dòng"
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

            {/* Thông tin thêm + Tổng kết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card space-y-4">
                    <h3 className="text-lg font-bold">Thông Tin Thêm</h3>
                    <div>
                        <label className="label">Điều khoản thanh toán</label>
                        <input
                            type="text"
                            className={inputCls}
                            value={formData.payment_terms}
                            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                            placeholder="VD: Trả ngay, Net 30, ..."
                        />
                    </div>
                    <div>
                        <label className="label">Phương thức vận chuyển</label>
                        <input
                            type="text"
                            className={inputCls}
                            value={formData.shipping_method}
                            onChange={(e) => setFormData({ ...formData, shipping_method: e.target.value })}
                            placeholder="VD: DHL, Xe tải, ..."
                        />
                    </div>
                    <div>
                        <label className="label">Ghi chú nội bộ</label>
                        <textarea
                            className={inputCls}
                            rows={4}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Ghi chú hoặc hướng dẫn đặc biệt..."
                        />
                    </div>
                </div>

                <div className="card bg-gray-50 flex flex-col justify-between">
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold">Tổng Kết Đơn Hàng</h3>
                        <div className="flex justify-between text-gray-600 border-b pb-2">
                            <span>Tạm tính</span>
                            <span>{totals.subtotal.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="flex justify-between text-gray-600 border-b pb-2">
                            <span>Thuế</span>
                            <span>+ {totals.taxAmount.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="flex justify-between text-red-600 border-b pb-2">
                            <span>Giảm giá</span>
                            <span>- {totals.discountAmount.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-3">
                            <span>Tổng cộng</span>
                            <span className="text-primary">{totals.total.toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            <Save className="w-4 h-4" />
                            {isEdit ? 'Cập nhật đơn hàng' : 'Tạo đơn mua hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
