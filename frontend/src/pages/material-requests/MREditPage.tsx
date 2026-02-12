import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMaterialRequest } from '../../hooks/useMaterialRequests';
import MRForm from '../../components/material-requests/MRForm';

export default function MREditPage() {
    const { id } = useParams<{ id: string }>();
    const mrId = parseInt(id || '0', 10);

    const { data: mr, isLoading, error } = useMaterialRequest(mrId);

    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center">
                <div className="text-gray-500">Loading Material Request...</div>
            </div>
        );
    }

    if (error || !mr) {
        return (
            <div className="animate-fade-in p-6">
                <div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Error loading Material Request: {error?.message || 'Request not found'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div>
                <div className="mb-6">
                    <Link
                        to={`/material-requests/${mrId}`}
                        className="text-gray-600 hover:text-primary flex items-center gap-2 mb-4 w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Details
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Material Request</h1>
                    <p className="text-gray-600 mt-1">Editing {mr.mr_number}</p>
                </div>

                <MRForm initialData={mr} isEdit />
            </div>
        </div>
    );
}
