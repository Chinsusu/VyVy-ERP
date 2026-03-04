import { PieChart } from 'lucide-react';
import type { ProductionTask } from '../../types/productionPlan';

const CATEGORY_LABELS: Record<string, string> = {
    pha_che: 'Pha chế',
    dong_goi: 'Đóng gói',
    kiem_tra: 'Kiểm tra CL',
    dong_thung: 'Đóng thùng',
    in_an: 'In ấn / Dán nhãn',
    van_chuyen: 'Vận chuyển',
    other: 'Khác',
};

const CATEGORY_COLORS: Record<string, string> = {
    pha_che: '#9333ea',
    dong_goi: '#3b82f6',
    kiem_tra: '#eab308',
    dong_thung: '#f97316',
    in_an: '#14b8a6',
    van_chuyen: '#6366f1',
    other: '#6b7280',
};

interface Props {
    tasks: ProductionTask[];
}

export default function ProductionProgressChart({ tasks }: Props) {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="card">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-primary" />
                    Tiến Độ Sản Xuất
                </h3>
                <div className="text-center py-8 text-gray-400 text-sm">Chưa có dữ liệu</div>
            </div>
        );
    }

    // Calculate overall progress
    const activeTasks = tasks.filter(t => t.status !== 'cancelled');
    const overallProgress = activeTasks.length > 0
        ? Math.round(activeTasks.reduce((sum, t) => sum + t.progress_percent, 0) / activeTasks.length)
        : 0;

    // Group by category
    const categoryStats = activeTasks.reduce<Record<string, { total: number; progress: number; count: number }>>((acc, t) => {
        if (!acc[t.category]) acc[t.category] = { total: 0, progress: 0, count: 0 };
        acc[t.category].total += 100;
        acc[t.category].progress += t.progress_percent;
        acc[t.category].count++;
        return acc;
    }, {});

    // Status counts
    const statusCounts = {
        completed: activeTasks.filter(t => t.status === 'completed').length,
        in_progress: activeTasks.filter(t => t.status === 'in_progress').length,
        pending: activeTasks.filter(t => t.status === 'pending').length,
    };

    // SVG donut chart
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference * (1 - overallProgress / 100);

    // Donut color based on progress
    const getProgressColor = (p: number) => {
        if (p >= 80) return '#22c55e';
        if (p >= 50) return '#3b82f6';
        if (p >= 20) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-primary" />
                Tiến Độ Sản Xuất
            </h3>

            <div className="flex flex-col items-center gap-6">
                {/* Donut Chart */}
                <div className="relative">
                    <svg width="160" height="160" viewBox="0 0 160 160">
                        {/* Background circle */}
                        <circle cx="80" cy="80" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="12" />
                        {/* Progress arc */}
                        <circle
                            cx="80" cy="80" r={radius}
                            fill="none"
                            stroke={getProgressColor(overallProgress)}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={progressOffset}
                            transform="rotate(-90 80 80)"
                            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-800">{overallProgress}%</span>
                        <span className="text-xs text-gray-500">Hoàn thành</span>
                    </div>
                </div>

                {/* Status summary */}
                <div className="flex gap-4 text-center">
                    <div>
                        <div className="text-lg font-bold text-green-600">{statusCounts.completed}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Xong</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-blue-600">{statusCounts.in_progress}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Đang làm</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-gray-400">{statusCounts.pending}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Chờ</div>
                    </div>
                </div>

                {/* Category breakdown */}
                <div className="w-full space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Theo danh mục</p>
                    {Object.entries(categoryStats).map(([cat, stats]) => {
                        const avg = Math.round(stats.progress / stats.count);
                        const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
                        return (
                            <div key={cat} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span className="text-xs text-gray-600 w-28 truncate">{CATEGORY_LABELS[cat] || cat}</span>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${avg}%`, backgroundColor: color }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-gray-500 w-8 text-right">{avg}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
