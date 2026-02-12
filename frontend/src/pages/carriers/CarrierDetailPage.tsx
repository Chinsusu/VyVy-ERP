import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCarrier, useDeleteCarrier } from '../../hooks/useCarriers';
import { Truck, ArrowLeft, Edit, Trash2, Globe, Phone, Mail, ExternalLink } from 'lucide-react';

export default function CarrierDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useCarrier(Number(id));
    const deleteCarrier = useDeleteCarrier();

    const carrier = data?.data;

    const handleDelete = () => {
        if (confirm(`Delete carrier "${carrier?.name}"?`)) {
            deleteCarrier.mutate(Number(id), {
                onSuccess: () => navigate('/carriers'),
            });
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!carrier) return <div className="p-8 text-center text-red-500">Carrier not found</div>;

    const carrierTypeLabel: Record<string, string> = { express: 'Express', freight: 'Freight', internal: 'Internal' };
    const carrierTypeColor: Record<string, string> = {
        express: 'bg-blue-50 text-blue-700 border-blue-200',
        freight: 'bg-amber-50 text-amber-700 border-amber-200',
        internal: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/carriers')} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Truck className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{carrier.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{carrier.code}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${carrierTypeColor[carrier.carrier_type] || ''}`}>
                                {carrierTypeLabel[carrier.carrier_type] || carrier.carrier_type}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${carrier.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${carrier.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                {carrier.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/carriers/${id}/edit`} className="btn flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Edit
                    </Link>
                    <button onClick={handleDelete} className="btn text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="card p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Contact Information</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{carrier.contact_phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{carrier.contact_email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-gray-400" />
                            {carrier.website ? (
                                <a href={carrier.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    {carrier.website} <ExternalLink className="w-3 h-3" />
                                </a>
                            ) : (
                                <span className="text-sm text-gray-400">No website</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tracking */}
                <div className="card p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Tracking</h3>
                    {carrier.tracking_url_template ? (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">URL Template:</p>
                            <code className="text-xs bg-gray-100 p-2 rounded block break-all">{carrier.tracking_url_template}</code>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No tracking URL configured</p>
                    )}
                    {carrier.description && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Description:</p>
                            <p className="text-sm">{carrier.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Metadata */}
            <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Audit Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Created:</span>{' '}
                        <span>{new Date(carrier.created_at).toLocaleDateString('vi-VN')}</span>
                        {carrier.created_by_name && <span className="text-gray-400 ml-1">by {carrier.created_by_name}</span>}
                    </div>
                    <div>
                        <span className="text-gray-500">Updated:</span>{' '}
                        <span>{new Date(carrier.updated_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
