import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import MRForm from '../../components/material-requests/MRForm';

export default function MRCreatePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6">
                    <Link
                        to="/material-requests"
                        className="text-gray-600 hover:text-primary flex items-center gap-2 mb-4 w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Material Requests
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">New Material Request</h1>
                    <p className="text-gray-600 mt-1">Request materials for production or departmental use</p>
                </div>

                <MRForm />
            </div>
        </div>
    );
}
