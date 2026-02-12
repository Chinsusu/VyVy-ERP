import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCarrier, useUpdateCarrier } from '../../hooks/useCarriers';
import { Truck, ArrowLeft, Save } from 'lucide-react';
import type { UpdateCarrierRequest } from '../../types/carrier';

export default function CarrierEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useCarrier(Number(id));
    const updateCarrier = useUpdateCarrier();
    const carrier = data?.data;

    const [formData, setFormData] = useState<UpdateCarrierRequest>({});

    useEffect(() => {
        if (carrier) {
            setFormData({
                name: carrier.name,
                carrier_type: carrier.carrier_type,
                contact_phone: carrier.contact_phone || '',
                contact_email: carrier.contact_email || '',
                website: carrier.website || '',
                tracking_url_template: carrier.tracking_url_template || '',
                description: carrier.description || '',
                is_active: carrier.is_active,
            });
        }
    }, [carrier]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateCarrier.mutateAsync({ id: Number(id), data: formData });
            navigate(`/carriers/${id}`);
        } catch (err: any) {
            alert(err?.response?.data?.error || 'Error updating carrier');
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!carrier) return <div className="p-8 text-center text-red-500">Carrier not found</div>;

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/carriers/${id}`)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <Truck className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Edit {carrier.code}</h1>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Code</label>
                        <input type="text" className="input w-full bg-gray-50" value={carrier.code} disabled />
                    </div>
                    <div>
                        <label className="label">Type</label>
                        <select className="select w-full" value={formData.carrier_type || ''}
                            onChange={(e) => setFormData({ ...formData, carrier_type: e.target.value })}>
                            <option value="express">Express</option>
                            <option value="freight">Freight</option>
                            <option value="internal">Internal</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="label">Name</label>
                    <input type="text" className="input w-full"
                        value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Phone</label>
                        <input type="text" className="input w-full"
                            value={formData.contact_phone || ''} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="label">Email</label>
                        <input type="email" className="input w-full"
                            value={formData.contact_email || ''} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} />
                    </div>
                </div>

                <div>
                    <label className="label">Website</label>
                    <input type="url" className="input w-full"
                        value={formData.website || ''} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                </div>

                <div>
                    <label className="label">Tracking URL Template</label>
                    <input type="text" className="input w-full"
                        value={formData.tracking_url_template || ''} onChange={(e) => setFormData({ ...formData, tracking_url_template: e.target.value })} />
                    <p className="text-xs text-gray-400 mt-1">Use {'{tracking}'} as placeholder for tracking number</p>
                </div>

                <div>
                    <label className="label">Description</label>
                    <textarea className="input w-full" rows={3}
                        value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_active" checked={formData.is_active ?? true}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                    <label htmlFor="is_active" className="text-sm font-medium">Active</label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate(`/carriers/${id}`)} className="btn">Cancel</button>
                    <button type="submit" disabled={updateCarrier.isPending} className="btn btn-primary flex items-center gap-2">
                        <Save className="w-4 h-4" /> {updateCarrier.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
