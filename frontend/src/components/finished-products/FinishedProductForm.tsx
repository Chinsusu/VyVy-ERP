import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateFinishedProduct, useUpdateFinishedProduct } from '../../hooks/useFinishedProducts';
import type { FinishedProduct, CreateFinishedProductInput } from '../../types/finishedProduct';

interface FinishedProductFormProps {
    product?: FinishedProduct;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function FinishedProductForm({ product, onSuccess, onCancel }: FinishedProductFormProps) {
    const navigate = useNavigate();
    const createProduct = useCreateFinishedProduct();
    const updateProduct = useUpdateFinishedProduct();

    const [formData, setFormData] = useState<CreateFinishedProductInput>({
        code: product?.code || '',
        name: product?.name || '',
        name_en: product?.name_en || '',
        category: product?.category || '',
        sub_category: product?.sub_category || '',
        unit: product?.unit || 'PCS',
        barcode: product?.barcode || '',
        net_weight: product?.net_weight,
        gross_weight: product?.gross_weight,
        volume: product?.volume,
        min_stock_level: product?.min_stock_level,
        max_stock_level: product?.max_stock_level,
        reorder_point: product?.reorder_point,
        shelf_life_days: product?.shelf_life_days,
        storage_conditions: product?.storage_conditions || '',
        standard_cost: product?.standard_cost,
        selling_price: product?.selling_price,
        is_active: product?.is_active ?? true,
        notes: product?.notes || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Mã sản phẩm không được để trống';
        }
        if (!formData.name.trim()) {
            newErrors.name = 'Tên sản phẩm không được để trống';
        }
        if (!formData.unit.trim()) {
            newErrors.unit = 'Đơn vị tính không được để trống';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (product) {
                await updateProduct.mutateAsync({
                    id: product.id,
                    input: formData,
                });
            } else {
                await createProduct.mutateAsync(formData);
            }

            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/finished-products');
            }
        } catch (error) {
            console.error('Error saving finished product:', error);
            setErrors({ submit: 'Lưu thành phẩm thất bại. Vui lòng thử lại.' });
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/finished-products');
        }
    };

    const handleChange = (field: keyof CreateFinishedProductInput, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const isSubmitting = createProduct.isPending || updateProduct.isPending;

    return (
        <form onSubmit={handleSubmit} className="card">
            <h2 className="text-xl font-semibold mb-6">
                {product ? 'Chỉnh Sửa Thành Phẩm' : 'Thêm Thành Phẩm Mới'}
            </h2>

            {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {errors.submit}
                </div>
            )}

            <div className="space-y-6">
                {/* 1. Thông Tin Cơ Bản */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Thông Tin Cơ Bản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                Mã Sản Phẩm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input ${errors.code ? 'border-red-500' : ''}`}
                                value={formData.code}
                                onChange={(e) => handleChange('code', e.target.value)}
                                disabled={!!product || isSubmitting}
                                placeholder="VD: TP001"
                            />
                            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                        </div>

                        <div>
                            <label className="label">
                                Tên Sản Phẩm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input ${errors.name ? 'border-red-500' : ''}`}
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="VD: Dầu Gội Retro Nano 350ml"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="label">Tên Tiếng Anh</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.name_en}
                                onChange={(e) => handleChange('name_en', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="VD: Retro Nano Shampoo 350ml"
                            />
                        </div>

                        <div>
                            <label className="label">Danh Mục</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="VD: tóc"
                            />
                        </div>

                        <div>
                            <label className="label">Danh Mục Con</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.sub_category}
                                onChange={(e) => handleChange('sub_category', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="VD: Dầu gội"
                            />
                        </div>

                        <div>
                            <label className="label">
                                Đơn Vị Tính <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`input ${errors.unit ? 'border-red-500' : ''}`}
                                value={formData.unit}
                                onChange={(e) => handleChange('unit', e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="Chai">Chai</option>
                                <option value="Hủ">Hủ</option>
                                <option value="Tuýp">Tuýp</option>
                                <option value="Túi">Túi</option>
                                <option value="Gói">Gói</option>
                                <option value="Hộp">Hộp</option>
                                <option value="Cái">Cái</option>
                                <option value="Bộ">Bộ</option>
                                <option value="PCS">PCS</option>
                                <option value="KG">KG</option>
                                <option value="CTN">CTN (Thùng)</option>
                            </select>
                            {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                        </div>

                        <div>
                            <label className="label">Barcode</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.barcode}
                                onChange={(e) => handleChange('barcode', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="VD: 8934561234567"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Thông Số Kỹ Thuật */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Thông Số Kỹ Thuật</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="label">Khối Lượng Tịnh (kg)</label>
                            <input
                                type="number"
                                step="0.001"
                                className="input"
                                value={formData.net_weight || ''}
                                onChange={(e) => handleChange('net_weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.000"
                            />
                        </div>

                        <div>
                            <label className="label">Khối Lượng Tổng (kg)</label>
                            <input
                                type="number"
                                step="0.001"
                                className="input"
                                value={formData.gross_weight || ''}
                                onChange={(e) => handleChange('gross_weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.000"
                            />
                        </div>

                        <div>
                            <label className="label">Thể Tích (m³)</label>
                            <input
                                type="number"
                                step="0.001"
                                className="input"
                                value={formData.volume || ''}
                                onChange={(e) => handleChange('volume', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.000"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Quản Lý Tồn Kho */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Quản Lý Tồn Kho</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Tồn Kho Tối Thiểu</label>
                            <input
                                type="number"
                                step="0.001"
                                className="input"
                                value={formData.min_stock_level || ''}
                                onChange={(e) => handleChange('min_stock_level', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.000"
                            />
                        </div>

                        <div>
                            <label className="label">Tồn Kho Tối Đa</label>
                            <input
                                type="number"
                                step="0.001"
                                className="input"
                                value={formData.max_stock_level || ''}
                                onChange={(e) => handleChange('max_stock_level', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.000"
                            />
                        </div>

                        <div>
                            <label className="label">Điểm Đặt Hàng Lại</label>
                            <input
                                type="number"
                                step="0.001"
                                className="input"
                                value={formData.reorder_point || ''}
                                onChange={(e) => handleChange('reorder_point', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.000"
                            />
                        </div>

                        <div>
                            <label className="label">Hạn Sử Dụng (ngày)</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.shelf_life_days || ''}
                                onChange={(e) => handleChange('shelf_life_days', e.target.value ? parseInt(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="VD: 365"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Điều Kiện Bảo Quản</label>
                            <textarea
                                className="input"
                                rows={3}
                                value={formData.storage_conditions}
                                onChange={(e) => handleChange('storage_conditions', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="VD: Bảo quản nơi khô ráo, thoáng mát. Tránh ánh nắng trực tiếp."
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Định Giá */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Định Giá</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Giá Thành Chuẩn (VNĐ)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input"
                                value={formData.standard_cost || ''}
                                onChange={(e) => handleChange('standard_cost', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="label">Giá Bán (VNĐ)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input"
                                value={formData.selling_price || ''}
                                onChange={(e) => handleChange('selling_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                                disabled={isSubmitting}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* 5. Thông Tin Bổ Sung */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Thông Tin Bổ Sung</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="label">Ghi Chú</label>
                            <textarea
                                className="input"
                                rows={4}
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Ghi chú thêm về sản phẩm..."
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.target.checked)}
                                disabled={isSubmitting}
                                className="mr-2"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                Đang hoạt động
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nút Hành Động */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                >
                    Huỷ
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang lưu...' : product ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm'}
                </button>
            </div>
        </form>
    );
}
