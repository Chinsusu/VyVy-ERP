import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import WarehouseForm from '../../components/warehouses/WarehouseForm';

export default function WarehouseCreatePage() {
    return (
        <div className="animate-fade-in">
            <div>
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/warehouses"
                        className="text-primary hover:underline flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tạo Kho Hàng Mới</h1>
                    <p className="text-gray-600 mt-1">Thêm kho hàng mới vào hệ thống</p>
                </div>

                {/* Form */}
                <WarehouseForm />
            </div>
        </div>
    );
}
