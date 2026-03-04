import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import MRForm from '../../components/production-plans/MRForm';

export default function MRCreatePage() {
    return (
        <div className="animate-fade-in">
            <div>
                <div className="mb-6">
                    <Link
                        to="/production-plans"
                        className="text-gray-600 hover:text-primary flex items-center gap-2 mb-4 w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại danh sách
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tạo Kế Hoạch Sản Xuất Mới</h1>
                    <p className="text-gray-600 mt-1">Yêu cầu nguyên vật liệu cho sản xuất</p>
                </div>

                <MRForm />
            </div>
        </div>
    );
}
