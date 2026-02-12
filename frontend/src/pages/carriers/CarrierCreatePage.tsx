import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCarrier } from '../../hooks/useCarriers';
import { Truck, ArrowLeft, Save } from 'lucide-react';
import type { CreateCarrierRequest } from '../../types/carrier';

export default function CarrierCreatePage() {
    const navigate = useNavigate();
    const createCarrier = useCreateCarrier();
    const [formData, setFormData] = useState<CreateCarrierRequest>({
        code: '',
        name: '',
        carrier_type: 'express',
        contact_phone: '',
        contact_email: '',
        website: '',
        tracking_url_template: '',
        description: '',
        is_active: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCarrier.mutateAsync(formData);
            navigate('/carriers');
        } catch (err: any) {
            alert(err?.response?.data?.error || 'Error creating carrier');
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/carriers')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <Truck className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Add Carrier</h1>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Code *</label>
                        <input type="text" className="input w-full" placeholder="JNT" required
                            value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                    </div>
                    <div>
                        <label className="label">Type</label>
                        <select className="select w-full" value={formData.carrier_type}
                            onChange={(e) => setFormData({ ...formData, carrier_type: e.target.value })}>
                            <option value="express">Express</option>
                            <option value="freight">Freight</option>
                            <option value="internal">Internal</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="label">Name *</label>
                    <input type="text" className="input w-full" placeholder="J&T Express" required
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Phone</label>
                        <input type="text" className="input w-full" placeholder="0123456789"
                            value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="label">Email</label>
                        <input type="email" className="input w-full" placeholder="contact@example.com"
                            value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} />
                    </div>
                </div>

                <div>
                    <label className="label">Website</label>
                    <input type="url" className="input w-full" placeholder="https://example.com"
                        value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                </div>

                <div>
                    <label className="label">Tracking URL Template</label>
                    <input type="text" className="input w-full" placeholder="https://example.com/track?code={tracking}"
                        value={formData.tracking_url_template} onChange={(e) => setFormData({ ...formData, tracking_url_template: e.target.value })} />
                    <p className="text-xs text-gray-400 mt-1">Use {'{tracking}'} as placeholder for tracking number</p>
                </div>

                <div>
                    <label className="label">Description</label>
                    <textarea className="input w-full" rows={3} placeholder="Notes about this carrier..."
                        value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_active" checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                    <label htmlFor="is_active" className="text-sm font-medium">Active</label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate('/carriers')} className="btn">Cancel</button>
                    <button type="submit" disabled={createCarrier.isPending} className="btn btn-primary flex items-center gap-2">
                        <Save className="w-4 h-4" /> {createCarrier.isPending ? 'Creating...' : 'Create Carrier'}
                    </button>
                </div>
            </form>
        </div>
    );
}
