import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    CheckCircle,
    Calendar,
    Building2,
    FileText,
    History,
    Package,
    ClipboardCheck,
    Truck,
    Clock,
    Plus
} from 'lucide-react';
import {
    useMaterialIssueNote,
    usePostMaterialIssueNote,
    useCancelMaterialIssueNote
} from '../../hooks/useMaterialIssueNotes';
import type { MaterialIssueNoteItem } from '../../types/materialIssueNote';

export default function MINDetailPage() {
    const { t } = useTranslation('mins');
    const { t: tc } = useTranslation('common');
    const { id } = useParams<{ id: string }>();
    const minId = parseInt(id || '0', 10);
    const navigate = useNavigate();

    const { data: min, isLoading, error } = useMaterialIssueNote(minId);
    const postMutation = usePostMaterialIssueNote();
    const cancelMutation = useCancelMaterialIssueNote();

    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center">
                <div className="text-gray-500">Loading Issue Note...</div>
            </div>
        );
    }

    if (error || !min) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Error loading Issue Note: {error?.message || 'Note not found'}
                    </div>
                </div>
            </div>
        );
    }

    const handlePost = async () => {
        if (window.confirm('Are you sure you want to post this issue note? This will reduce stock officially.')) {
            try {
                await postMutation.mutateAsync(minId);
                alert('Material issue note posted successfully!');
            } catch (err) {
                alert('Error posting note: ' + (err as Error).message);
            }
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel this draft?')) {
            try {
                await cancelMutation.mutateAsync(minId);
                navigate('/material-issue-notes');
            } catch (err) {
                alert('Error cancelling note: ' + (err as Error).message);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="badge badge-secondary uppercase">Draft</span>;
            case 'posted':
                return <span className="badge badge-success uppercase">Posted</span>;
            case 'cancelled':
                return <span className="badge badge-danger uppercase">Cancelled</span>;
            default:
                return <span className="badge uppercase">{status}</span>;
        }
    };

    return (
        <div className="animate-fade-in pb-12">
            <div>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/material-issue-notes"
                            className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-primary-600 border border-transparent hover:border-gray-200"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">{min.min_number}</h1>
                                {getStatusBadge(min.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Issue Date: {new Date(min.issue_date).toLocaleDateString('vi-VN')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Truck className="w-4 h-4" />
                                    {min.warehouse?.name}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {min.status === 'draft' && (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="btn btn-secondary text-red-600 border-red-100 hover:bg-red-50"
                                >
                                    Cancel Draft
                                </button>
                                <button
                                    onClick={handlePost}
                                    disabled={postMutation.isPending}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Post Issue Note
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details & Items */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary Card */}
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-600" />
                                Issuance Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <History className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Linked Material Request</p>
                                            <Link to={`/material-requests/${min.material_request_id}`} className="font-medium text-primary-600 hover:underline">
                                                {min.material_request?.mr_number || `#${min.material_request_id}`}
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Source Warehouse</p>
                                            <p className="font-medium text-gray-900">{min.warehouse?.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Items</p>
                                            <p className="font-medium text-gray-900">{min.items.length} materials</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {min.notes && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Notes</p>
                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">
                                        {min.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Items Table */}
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary-600" />
                                Issued Items
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Material</th>
                                            <th>Batch / Expiry</th>
                                            <th>Location</th>
                                            <th className="text-right">Quantity</th>
                                            {min.is_posted && <th className="text-right">Unit Cost</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {min.items.map((item: MaterialIssueNoteItem) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="font-medium text-gray-900">{item.material?.trading_name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{item.material?.code}</div>
                                                </td>
                                                <td>
                                                    <div className="text-sm font-medium">{item.batch_number || '-'}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.expiry_date ? `Exp: ${new Date(item.expiry_date).toLocaleDateString('vi-VN')}` : ''}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                                                        {item.warehouse_location?.code || '-'}
                                                    </span>
                                                </td>
                                                <td className="text-right font-semibold">
                                                    {item.quantity.toLocaleString()} {item.material?.unit}
                                                </td>
                                                {min.is_posted && (
                                                    <td className="text-right text-sm text-gray-600">
                                                        {item.unit_cost ? item.unit_cost.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '-'}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Workflow status & Audit */}
                    <div className="space-y-8">
                        {/* Posting Status Card */}
                        <div className={`card ${min.is_posted ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                            <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Transaction Status</h3>
                            <div className="flex items-start gap-3">
                                {min.is_posted ? (
                                    <>
                                        <div className="p-2 bg-green-100 text-green-600 rounded-full">
                                            <ClipboardCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-800">Posted officially</p>
                                            <p className="text-xs text-green-600 mt-1">Stock balance has been updated</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-orange-800">Draft Status</p>
                                            <p className="text-xs text-orange-600 mt-1">Action required to update stock</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Audit Log Card */}
                        <div className="card">
                            <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Audit Log
                            </h3>
                            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                <div className="relative pl-8">
                                    <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-primary-600 rounded-full flex items-center justify-center z-10">
                                        <Plus className="w-3 h-3 text-primary-600" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">Note Created</p>
                                    <p className="text-xs text-gray-500">{new Date(min.created_at).toLocaleString('vi-VN')}</p>
                                </div>

                                {min.posted_at && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-green-500 rounded-full flex items-center justify-center z-10">
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">Note Posted</p>
                                        <p className="text-xs text-gray-500">{new Date(min.posted_at).toLocaleString('vi-VN')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
