import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    backTo?: string;
    backLabel?: string;
    actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon, backTo, backLabel, actions }: PageHeaderProps) {
    return (
        <div className="mb-6 animate-fade-in">
            {backTo && (
                <Link
                    to={backTo}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    {backLabel || 'Back'}
                </Link>
            )}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
            </div>
        </div>
    );
}
