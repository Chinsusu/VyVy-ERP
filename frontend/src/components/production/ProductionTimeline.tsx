import { CalendarRange } from 'lucide-react';
import type { ProductionTask } from '../../types/materialRequest';

const CATEGORY_COLORS: Record<string, string> = {
    pha_che: '#9333ea',
    dong_goi: '#3b82f6',
    kiem_tra: '#eab308',
    dong_thung: '#f97316',
    in_an: '#14b8a6',
    van_chuyen: '#6366f1',
    other: '#6b7280',
};

const CATEGORY_LABELS: Record<string, string> = {
    pha_che: 'Pha chế',
    dong_goi: 'Đóng gói',
    kiem_tra: 'Kiểm tra CL',
    dong_thung: 'Đóng thùng',
    in_an: 'In ấn / Dán nhãn',
    van_chuyen: 'Vận chuyển',
    other: 'Khác',
};

interface Props {
    tasks: ProductionTask[];
}

export default function ProductionTimeline({ tasks }: Props) {
    // Filter tasks with dates
    const timedTasks = tasks.filter(t => t.planned_start && t.planned_end);

    if (timedTasks.length === 0) {
        return (
            <div className="card">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <CalendarRange className="w-5 h-5 text-primary" />
                    Lịch Sản Xuất (Timeline)
                </h3>
                <div className="text-center py-8 text-gray-400 text-sm">
                    Thêm ngày bắt đầu và kết thúc cho công việc để xem timeline
                </div>
            </div>
        );
    }

    // Calculate date range
    const allDates = timedTasks.flatMap(t => [
        new Date(t.planned_start!).getTime(),
        new Date(t.planned_end!).getTime(),
        ...(t.actual_start ? [new Date(t.actual_start).getTime()] : []),
        ...(t.actual_end ? [new Date(t.actual_end).getTime()] : []),
    ]);
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    // Add padding of 1 day
    minDate.setDate(minDate.getDate() - 1);
    maxDate.setDate(maxDate.getDate() + 1);

    const totalDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));

    const getPosition = (dateStr: string) => {
        const d = new Date(dateStr).getTime();
        return ((d - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;
    };

    const getWidth = (start: string, end: string) => {
        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        return Math.max(2, ((e - s) / (maxDate.getTime() - minDate.getTime())) * 100);
    };

    // Generate date labels
    const labelCount = Math.min(totalDays, 8);
    const dateLabels: string[] = [];
    for (let i = 0; i <= labelCount; i++) {
        const d = new Date(minDate.getTime() + (i / labelCount) * (maxDate.getTime() - minDate.getTime()));
        dateLabels.push(d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
    }

    return (
        <div className="card">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <CalendarRange className="w-5 h-5 text-primary" />
                Lịch Sản Xuất (Timeline)
            </h3>

            <div className="space-y-3">
                {/* Header - date labels */}
                <div className="relative h-6 ml-36 mr-4">
                    {dateLabels.map((label, i) => (
                        <span
                            key={i}
                            className="absolute text-[10px] text-gray-400 -translate-x-1/2"
                            style={{ left: `${(i / labelCount) * 100}%` }}
                        >
                            {label}
                        </span>
                    ))}
                </div>

                {/* Task bars */}
                {timedTasks.map((task) => {
                    const color = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.other;
                    const left = getPosition(task.planned_start!);
                    const width = getWidth(task.planned_start!, task.planned_end!);
                    const hasActual = task.actual_start && task.actual_end;
                    const actualLeft = hasActual ? getPosition(task.actual_start!) : 0;
                    const actualWidth = hasActual ? getWidth(task.actual_start!, task.actual_end!) : 0;

                    return (
                        <div key={task.id} className="flex items-center gap-2">
                            {/* Label */}
                            <div className="w-36 shrink-0 text-right pr-2">
                                <p className="text-xs font-medium text-gray-700 truncate">{task.task_name}</p>
                                <p className="text-[10px] text-gray-400">
                                    {CATEGORY_LABELS[task.category] || task.category}
                                </p>
                            </div>
                            {/* Bar area */}
                            <div className="flex-1 relative h-8 bg-gray-50 rounded mr-4">
                                {/* Planned bar */}
                                <div
                                    className="absolute top-1 h-3 rounded-full opacity-80 transition-all"
                                    style={{
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        backgroundColor: color,
                                    }}
                                    title={`Dự kiến: ${task.planned_start} → ${task.planned_end}`}
                                />
                                {/* Actual bar (if exists) */}
                                {hasActual && (
                                    <div
                                        className="absolute bottom-1 h-3 rounded-full opacity-50 transition-all"
                                        style={{
                                            left: `${actualLeft}%`,
                                            width: `${actualWidth}%`,
                                            backgroundColor: color,
                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)',
                                        }}
                                        title={`Thực tế: ${task.actual_start} → ${task.actual_end}`}
                                    />
                                )}
                                {/* Progress overlay */}
                                {task.progress_percent > 0 && task.progress_percent < 100 && (
                                    <div
                                        className="absolute top-1 h-3 rounded-full bg-white/40"
                                        style={{
                                            left: `${left + (width * task.progress_percent / 100)}%`,
                                            width: `${width * (100 - task.progress_percent) / 100}%`,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t text-[10px] text-gray-500">
                <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-full bg-blue-500 opacity-80" /> Dự kiến</div>
                <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-full bg-blue-500 opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,0.4) 1px, rgba(255,255,255,0.4) 2px)' }} /> Thực tế</div>
            </div>
        </div>
    );
}
