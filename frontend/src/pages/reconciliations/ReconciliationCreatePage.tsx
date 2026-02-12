import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateReconciliation } from '../../hooks/useReconciliations';
import { useCarriers } from '../../hooks/useCarriers';
import { FileCheck, ArrowLeft, Save } from 'lucide-react';

export default function ReconciliationCreatePage() {
    const navigate = useNavigate();
    const createRecon = useCreateReconciliation();
    const { data: carriersData } = useCarriers({ is_active: true });
    const carriers = carriersData?.data || [];

    const [formData, setFormData] = useState({
        carrier_id: 0,
        period_start: '',
        period_end: '',
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.carrier_id) {
            alert('Please select a carrier');
            return;
        }
        try {
            const result = await createRecon.mutateAsync({
                carrier_id: formData.carrier_id,
                period_start: formData.period_start || undefined,
                period_end: formData.period_end || undefined,
                notes: formData.notes || undefined,
            });
            navigate(`/reconciliations/${result.data.id}`);
        } catch (err: any) {
            alert(err?.response?.data?.error || 'Error creating reconciliation');
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/reconciliations')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <FileCheck className="w-7 h-7 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">New Reconciliation</h1>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
                <div>
                    <label className="label">Carrier *</label>
                    <select className="select w-full" required
                        value={formData.carrier_id || ''}
                        onChange={(e) => setFormData({ ...formData, carrier_id: Number(e.target.value) })}>
                        <option value="">-- Select Carrier --</option>
                        {carriers.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Period Start</label>
                        <input type="date" className="input w-full"
                            value={formData.period_start} onChange={(e) => setFormData({ ...formData, period_start: e.target.value })} />
                    </div>
                    <div>
                        <label className="label">Period End</label>
                        <input type="date" className="input w-full"
                            value={formData.period_end} onChange={(e) => setFormData({ ...formData, period_end: e.target.value })} />
                    </div>
                </div>

                <div>
                    <label className="label">Notes</label>
                    <textarea className="input w-full" rows={3} placeholder="Notes about this reconciliation..."
                        value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate('/reconciliations')} className="btn">Cancel</button>
                    <button type="submit" disabled={createRecon.isPending} className="btn btn-primary flex items-center gap-2">
                        <Save className="w-4 h-4" /> {createRecon.isPending ? 'Creating...' : 'Create Reconciliation'}
                    </button>
                </div>
            </form>
        </div>
    );
}
