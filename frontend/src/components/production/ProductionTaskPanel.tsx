import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, ClipboardList, UserCheck, Calendar } from 'lucide-react';
import { useProductionTasks, useCreateProductionTask, useUpdateProductionTask, useDeleteProductionTask } from '../../hooks/useProductionTasks';
import type { ProductionTask, CreateProductionTaskInput, UpdateProductionTaskInput } from '../../types/materialRequest';

const CATEGORIES: Record<string, { label: string; color: string }> = {
    pha_che: { label: 'Pha chế', color: 'bg-purple-100 text-purple-700' },
    dong_goi: { label: 'Đóng gói', color: 'bg-blue-100 text-blue-700' },
    kiem_tra: { label: 'Kiểm tra CL', color: 'bg-yellow-100 text-yellow-700' },
    dong_thung: { label: 'Đóng thùng', color: 'bg-orange-100 text-orange-700' },
    in_an: { label: 'In ấn / Dán nhãn', color: 'bg-teal-100 text-teal-700' },
    van_chuyen: { label: 'Vận chuyển', color: 'bg-indigo-100 text-indigo-700' },
    other: { label: 'Khác', color: 'bg-gray-100 text-gray-600' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Chưa bắt đầu', color: 'bg-gray-100 text-gray-600' },
    in_progress: { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

interface Props {
    mrId: number;
    editable?: boolean;
}

const EMPTY_FORM: CreateProductionTaskInput = {
    category: 'other',
    task_name: '',
    description: '',
    assigned_to: null,
    planned_start: '',
    planned_end: '',
    status: 'pending',
    progress_percent: 0,
    sort_order: 0,
    notes: '',
};

export default function ProductionTaskPanel({ mrId, editable = true }: Props) {
    const { data: tasks, isLoading } = useProductionTasks(mrId);
    const createMutation = useCreateProductionTask(mrId);
    const updateMutation = useUpdateProductionTask(mrId);
    const deleteMutation = useDeleteProductionTask(mrId);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CreateProductionTaskInput>({ ...EMPTY_FORM });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<UpdateProductionTaskInput>({});

    const handleCreate = async () => {
        if (!form.task_name.trim()) return;
        await createMutation.mutateAsync(form);
        setForm({ ...EMPTY_FORM });
        setShowForm(false);
    };

    const startEdit = (task: ProductionTask) => {
        setEditingId(task.id);
        setEditForm({
            category: task.category,
            task_name: task.task_name,
            description: task.description || '',
            assigned_to: task.assigned_to,
            planned_start: task.planned_start || '',
            planned_end: task.planned_end || '',
            actual_start: task.actual_start || '',
            actual_end: task.actual_end || '',
            status: task.status,
            progress_percent: task.progress_percent,
            notes: task.notes || '',
        });
    };

    const handleUpdate = async () => {
        if (editingId === null) return;
        await updateMutation.mutateAsync({ taskId: editingId, input: editForm });
        setEditingId(null);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Xóa công việc này?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    Danh Mục Công Việc
                </h3>
                {editable && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn btn-primary text-sm flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm công việc
                    </button>
                )}
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="border border-primary/20 rounded-lg p-4 mb-4 bg-primary/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Tên công việc *</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={form.task_name}
                                onChange={(e) => setForm({ ...form, task_name: e.target.value })}
                                placeholder="VD: Pha chế lô 001"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Danh mục</label>
                            <select
                                className="input w-full"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                {Object.entries(CATEGORIES).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ngày bắt đầu</label>
                            <input
                                type="date"
                                className="input w-full"
                                value={form.planned_start || ''}
                                onChange={(e) => setForm({ ...form, planned_start: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Ngày kết thúc</label>
                            <input
                                type="date"
                                className="input w-full"
                                value={form.planned_end || ''}
                                onChange={(e) => setForm({ ...form, planned_end: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={form.description || ''}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Mô tả chi tiết..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowForm(false)} className="btn btn-secondary text-sm">Hủy</button>
                        <button
                            onClick={handleCreate}
                            disabled={createMutation.isPending || !form.task_name.trim()}
                            className="btn btn-primary text-sm flex items-center gap-1"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </div>
            )}

            {/* Loading */}
            {isLoading && <div className="text-center py-6 text-gray-400 text-sm">Đang tải...</div>}

            {/* Empty state */}
            {!isLoading && (!tasks || tasks.length === 0) && (
                <div className="text-center py-8 text-gray-400 text-sm">
                    Chưa có công việc nào. Nhấn "Thêm công việc" để bắt đầu.
                </div>
            )}

            {/* Task List */}
            {tasks && tasks.length > 0 && (
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <div key={task.id} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors">
                            {editingId === task.id ? (
                                /* Edit Mode */
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Tên</label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={editForm.task_name || ''}
                                                onChange={(e) => setEditForm({ ...editForm, task_name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Danh mục</label>
                                            <select
                                                className="input w-full"
                                                value={editForm.category || ''}
                                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            >
                                                {Object.entries(CATEGORIES).map(([k, v]) => (
                                                    <option key={k} value={k}>{v.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
                                            <select
                                                className="input w-full"
                                                value={editForm.status || 'pending'}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            >
                                                {Object.entries(STATUS_MAP).map(([k, v]) => (
                                                    <option key={k} value={k}>{v.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Tiến độ: {editForm.progress_percent || 0}%
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                className="w-full"
                                                value={editForm.progress_percent || 0}
                                                onChange={(e) => setEditForm({ ...editForm, progress_percent: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Bắt đầu dự kiến</label>
                                            <input type="date" className="input w-full" value={editForm.planned_start || ''} onChange={(e) => setEditForm({ ...editForm, planned_start: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Kết thúc dự kiến</label>
                                            <input type="date" className="input w-full" value={editForm.planned_end || ''} onChange={(e) => setEditForm({ ...editForm, planned_end: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Bắt đầu thực tế</label>
                                            <input type="date" className="input w-full" value={editForm.actual_start || ''} onChange={(e) => setEditForm({ ...editForm, actual_start: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Kết thúc thực tế</label>
                                            <input type="date" className="input w-full" value={editForm.actual_end || ''} onChange={(e) => setEditForm({ ...editForm, actual_end: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditingId(null)} className="btn btn-secondary text-sm flex items-center gap-1"><X className="w-3.5 h-3.5" /> Hủy</button>
                                        <button onClick={handleUpdate} disabled={updateMutation.isPending} className="btn btn-primary text-sm flex items-center gap-1">
                                            <Save className="w-3.5 h-3.5" /> {updateMutation.isPending ? 'Đang lưu...' : 'Cập nhật'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode */
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 ${CATEGORIES[task.category]?.color || CATEGORIES.other.color}`}>
                                            {CATEGORIES[task.category]?.label || task.category}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{task.task_name}</p>
                                            {task.description && <p className="text-xs text-gray-500 truncate">{task.description}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* Assigned user */}
                                        {task.assigned_user_name && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <UserCheck className="w-3.5 h-3.5" />
                                                {task.assigned_user_name}
                                            </span>
                                        )}

                                        {/* Timeline */}
                                        {task.planned_start && (
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                {task.planned_start}
                                            </span>
                                        )}

                                        {/* Progress bar */}
                                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${task.progress_percent === 100 ? 'bg-green-500' : task.progress_percent > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                                                style={{ width: `${task.progress_percent}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 w-8 text-right">{task.progress_percent}%</span>

                                        {/* Status */}
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_MAP[task.status]?.color || STATUS_MAP.pending.color}`}>
                                            {STATUS_MAP[task.status]?.label || task.status}
                                        </span>

                                        {/* Actions */}
                                        {editable && (
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => startEdit(task)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Chỉnh sửa">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Xóa">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
