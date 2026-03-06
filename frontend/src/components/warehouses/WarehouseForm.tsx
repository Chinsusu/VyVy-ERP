import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateWarehouse, useUpdateWarehouse } from '../../hooks/useWarehouses';
import type { Warehouse, CreateWarehouseInput } from '../../types/warehouse';

interface WarehouseFormProps {
    warehouse?: Warehouse;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function WarehouseForm({ warehouse, onSuccess, onCancel }: WarehouseFormProps) {
    const navigate = useNavigate();
    const createWarehouse = useCreateWarehouse();
    const updateWarehouse = useUpdateWarehouse();

    const [formData, setFormData] = useState<CreateWarehouseInput>({
        code: warehouse?.code || '',
        name: warehouse?.name || '',
        warehouse_type: warehouse?.warehouse_type || 'lab',
        address: warehouse?.address || '',
        city: warehouse?.city || '',
        manager_id: warehouse?.manager_id,
        is_active: warehouse?.is_active ?? true,
        notes: warehouse?.notes || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Vui lòng nhập mã kho';
        }
        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập tên kho';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (warehouse) {
                await updateWarehouse.mutateAsync({
                    id: warehouse.id,
                    input: formData,
                });
                navigate(`/warehouses/${warehouse.id}`);
            } else {
                await createWarehouse.mutateAsync(formData);
                navigate('/warehouses');
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving warehouse:', error);
            setErrors({ submit: 'Lưu thất bại. Vui lòng thử lại.' });
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/warehouses');
        }
    };

    const handleChange = (field: keyof CreateWarehouseInput, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const isSubmitting = createWarehouse.isPending || updateWarehouse.isPending;

    return (
        <form onSubmit={handleSubmit} className="card">
            <h2 className="text-xl font-semibold mb-6">
                {warehouse ? 'Chỉnh Sửa Kho Hàng' : 'Tạo Kho Hàng Mới'}
            </h2>

            {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {errors.submit}
                </div>
            )}

            <div className="space-y-6">
                {/* Thông tin cơ bản */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Thông Tin Cơ Bản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                Mã kho <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input ${errors.code ? 'border-red-500' : ''}`}
                                value={formData.code}
                                onChange={(e) => handleChange('code', e.target.value)}
                                disabled={!!warehouse || isSubmitting}
                                placeholder="VD: KHO-001"
                            />
                            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                        </div>

                        <div>
                            <label className="label">
                                Tên kho <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`input ${errors.name ? 'border-red-500' : ''}`}
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="VD: Kho Tổng Hà Nội"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="label">Loại kho</label>
                            <select
                                className="input"
                                value={formData.warehouse_type}
                                onChange={(e) => handleChange('warehouse_type', e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="lab">Kho Lab (Nguyên Vật Liệu)</option>
                                <option value="commercial">Kho Bán Hàng (Thành Phẩm &amp; Bao Bì)</option>
                                <option value="factory">Kho Nhà Máy (Nguyên Liệu &amp; Bao Bì)</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Tỉnh/Thành phố</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="VD: Hồ Chí Minh"
                            />
                        </div>
                    </div>
                </div>

                {/* Địa chỉ */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Địa Chỉ</h3>
                    <div>
                        <label className="label">Địa chỉ đầy đủ</label>
                        <textarea
                            className="input"
                            rows={3}
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Nhập địa chỉ đầy đủ của kho..."
                        />
                    </div>
                </div>

                {/* Thông tin bổ sung */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Thông Tin Bổ Sung</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="label">Ghi chú</label>
                            <textarea
                                className="input"
                                rows={4}
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Ghi chú thêm về kho hàng..."
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

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                >
                    Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang lưu...' : warehouse ? 'Cập Nhật Kho Hàng' : 'Tạo Kho Hàng'}
                </button>
            </div>
        </form>
    );
}
