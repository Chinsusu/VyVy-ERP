import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Store, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useSalesChannel, useDeleteSalesChannel } from '../../hooks/useSalesChannels';

export default function SalesChannelDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation('salesChannels');
    const { data: channel, isLoading } = useSalesChannel(Number(id));
    const deleteMutation = useDeleteSalesChannel();

    const handleDelete = async () => {
        if (window.confirm(t('confirmDelete'))) {
            await deleteMutation.mutateAsync(Number(id));
            navigate('/sales-channels');
        }
    };

    if (isLoading) return <div className="p-12 text-center text-slate-400">{t('loading')}</div>;
    if (!channel) return <div className="p-12 text-center text-slate-400">{t('notFound')}</div>;

    const platformBadge = (type: string) => {
        const styles: Record<string, string> = {
            marketplace: 'bg-blue-50 text-blue-700 border-blue-200',
            social: 'bg-purple-50 text-purple-700 border-purple-200',
            branch: 'bg-green-50 text-green-700 border-green-200',
            other: 'bg-slate-50 text-slate-700 border-slate-200',
        };
        return styles[type] || styles.other;
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link to="/sales-channels" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{channel.name}</h1>
                        <p className="text-sm text-slate-500 font-mono">{channel.code}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link to={`/sales-channels/${id}/edit`} className="btn-secondary flex items-center gap-2">
                        <Edit className="w-4 h-4" /> {t('actions.edit')}
                    </Link>
                    <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> {t('actions.delete')}
                    </button>
                </div>
            </div>

            {/* Detail Card */}
            <div className="card">
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.code')}</label>
                            <p className="text-sm font-mono text-slate-900 mt-1">{channel.code}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.name')}</label>
                            <p className="text-sm text-slate-900 mt-1">{channel.name}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.platform')}</label>
                            <div className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${platformBadge(channel.platform_type)}`}>
                                    {t(`platformTypes.${channel.platform_type}`)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.status')}</label>
                            <div className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${channel.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {channel.is_active ? t('active') : t('inactive')}
                                </span>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.description')}</label>
                            <p className="text-sm text-slate-900 mt-1">{channel.description || '—'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
