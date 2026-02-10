import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import MINForm from '../../components/material-issue-notes/MINForm';

export default function MINCreatePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6">
                    <Link
                        to="/material-issue-notes"
                        className="text-gray-600 hover:text-primary flex items-center gap-2 mb-4 w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to MIN List
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">New Material Issue Note</h1>
                    <p className="text-gray-600 mt-1">Select batches and quantities to issue based on approved request</p>
                </div>

                <MINForm />
            </div>
        </div>
    );
}
