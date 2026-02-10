import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    Building2,
    FileText,
    History,
    AlertCircle,
    Package,
    ClipboardCheck,
    Plus
} from 'lucide-react';
import {
    useMaterialRequest,
    useApproveMaterialRequest,
    useCancelMaterialRequest,
    useDeleteMaterialRequest
} from '../../hooks/useMaterialRequests';
import type { MaterialRequestItem } from '../../types/materialRequest';

export default function MRDetailPage() {
    const { id } = useParams<{ id: string }>();
    const mrId = parseInt(id || '0', 10);
    const navigate = useNavigate();

    const { data: mr, isLoading, error } = useMaterialRequest(mrId);
    const approveMutation = useApproveMaterialRequest();
    const cancelMutation = useCancelMaterialRequest();
    const deleteMutation = useDeleteMaterialRequest();

    const [isDeleting, setIsDeleting] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading Material Request...</div>
            </div>
        );
    }

    if (error || !mr) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Error loading Material Request: {error?.message || 'Request not found'}
                    </div>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="badge badge-secondary">Draft</span>;
            case 'approved':
                return <span className="badge badge-primary">Approved</span>;
            case 'issued':
                return <span className="badge badge-warning">Issued</span>;
            case 'closed':
                return <span className="badge badge-success">Closed</span>;
            case 'cancelled':
                return <span className="badge badge-danger">Cancelled</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const handleApprove = async () => {
        if (window.confirm('Are you sure you want to approve this Material Request?')) {
            try {
                await approveMutation.mutateAsync(mrId);
            } catch (err) {
                alert('Error approving request: ' + (err as Error).message);
            }
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel this Material Request?')) {
            try {
                await cancelMutation.mutateAsync(mrId);
            } catch (err) {
                alert('Error cancelling request: ' + (err as Error).message);
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this draft? This cannot be undone.')) {
            setIsDeleting(true);
            try {
                await deleteMutation.mutateAsync(mrId);
                navigate('/material-requests');
            } catch (err) {
                alert('Error deleting request: ' + (err as Error).message);
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/material-requests"
                            className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-primary-600 border border-transparent hover:border-gray-200"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">{mr.mr_number}</h1>
                                {getStatusBadge(mr.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Requested: {new Date(mr.request_date).toLocaleDateString('vi-VN')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    By: {mr.department}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {mr.status === 'draft' && (
                            <>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="btn btn-secondary text-red-600 border-red-100 hover:bg-red-50"
                                >
                                    Delete Draft
                                </button>
                                <Link
                                    to={`/material-requests/${mr.id}/edit`}
                                    className="btn btn-secondary"
                                >
                                    Edit Request
                                </Link>
                                <button
                                    onClick={handleApprove}
                                    disabled={approveMutation.isPending}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve Request
                                </button>
                            </>
                        )}
                        {mr.status === 'approved' && (
                            <button
                                onClick={handleCancel}
                                disabled={cancelMutation.isPending}
                                className="btn btn-secondary text-red-600 border-red-100 hover:bg-red-50 flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancel Request
                            </button>
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
                                General Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Source Warehouse</p>
                                            <p className="font-medium text-gray-900">{mr.warehouse?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Required Date</p>
                                            <p className="font-medium text-gray-900">
                                                {mr.required_date ? new Date(mr.required_date).toLocaleDateString('vi-VN') : 'Not Specified'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Purpose</p>
                                            <p className="text-gray-900">{mr.purpose || 'No purpose specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {mr.notes && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Additional Notes</p>
                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">
                                        {mr.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Items Card */}
                        <div className="card scroll-mt-6" id="items">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary-600" />
                                Requested Materials
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Material</th>
                                            <th className="text-right">Requested</th>
                                            <th className="text-right">Issued</th>
                                            <th className="text-right">Remaining</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mr.items.map((item: MaterialRequestItem) => {
                                            const remaining = item.requested_quantity - item.issued_quantity;
                                            return (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="font-medium text-gray-900">{item.material?.trading_name}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{item.material?.code}</div>
                                                    </td>
                                                    <td className="text-right font-medium">
                                                        {item.requested_quantity.toLocaleString()} {item.material?.unit}
                                                    </td>
                                                    <td className="text-right text-gray-600">
                                                        {item.issued_quantity.toLocaleString()} {item.material?.unit}
                                                    </td>
                                                    <td className="text-right font-semibold text-primary-600">
                                                        {remaining.toLocaleString()} {item.material?.unit}
                                                    </td>
                                                    <td className="text-sm text-gray-500 italic">
                                                        {item.notes || '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Workflow & History */}
                    <div className="space-y-8">
                        {/* Approval Status Card */}
                        <div className="card bg-gray-50 border-gray-200">
                            <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Workflow Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${mr.status !== 'draft' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <ClipboardCheck className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">Approved</span>
                                    </div>
                                    {mr.approved_at ? (
                                        <span className="text-xs text-gray-500">
                                            {new Date(mr.approved_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    ) : (
                                        <span className="text-xs italic text-gray-400">Pending</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${mr.status === 'issued' || mr.status === 'closed' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">Material Issue</span>
                                    </div>
                                    <span className="text-xs italic text-gray-400">
                                        {mr.status === 'issued' ? 'In Progress' : mr.status === 'closed' ? 'Completed' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {mr.status === 'approved' && (
                                <div className="mt-6">
                                    <Link
                                        to={`/material-issues/new?mr_id=${mr.id}`}
                                        className="btn btn-primary w-full flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Package className="w-4 h-4" />
                                        Issue Materials
                                    </Link>
                                    <p className="text-center text-[10px] text-gray-400 mt-2">
                                        Create a Material Issue Note for this approved request
                                    </p>
                                </div>
                            )}
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
                                    <p className="text-sm font-bold text-gray-900">Request Created</p>
                                    <p className="text-xs text-gray-500">{new Date(mr.created_at).toLocaleString('vi-VN')}</p>
                                    <p className="text-xs mt-1 text-gray-600">Requested by {mr.department}</p>
                                </div>

                                {mr.approved_at && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-green-500 rounded-full flex items-center justify-center z-10">
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">Request Approved</p>
                                        <p className="text-xs text-gray-500">{new Date(mr.approved_at).toLocaleString('vi-VN')}</p>
                                    </div>
                                )}

                                {mr.status === 'cancelled' && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-red-500 rounded-full flex items-center justify-center z-10">
                                            <XCircle className="w-3 h-3 text-red-500" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">Request Cancelled</p>
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
