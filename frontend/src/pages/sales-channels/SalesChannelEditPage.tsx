import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';
import { useSalesChannel, useUpdateSalesChannel } from '../../hooks/useSalesChannels';

export default function SalesChannelEditPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation('salesChannels');
    const navigate = useNavigate();
    const { data: channel, isLoading } = useSalesChannel(Number(id));
    const updateMutation = useUpdateSalesChannel();

    const [form, setForm] = useState({
        name: '',
        platform_type: '',
        is_active: true,
        description: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (channel) {
            setForm({
                name: channel.name,
                platform_type: channel.platform_type,
                is_active: channel.is_active,
                description: channel.description || '',
            });
        }
    }, [channel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await updateMutation.mutateAsync({ id: Number(id), input: form });
            navigate(`/sales-channels/${id}`);
        } catch (err: any) {
            setError(err.response?.data?.error || t('updateError'));
        }
    };

    if (isLoading) return <div className="p-12 text-center text-slate-400">{t('loading')}</div>;
    if (!channel) return <div className="p-12 text-center text-slate-400">{t('notFound')}</div>;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link to={`/sales-channels/${id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                    <Store className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('editTitle')}</h1>
                    <p className="text-sm text-slate-500 font-mono">{channel.code}</p>
                </div>
            </div>

            {/* Form */}
            <div className="card">
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.name')} *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.platformType')} *</label>
                            <select
                                value={form.platform_type}
                                onChange={e => setForm(prev => ({ ...prev, platform_type: e.target.value }))}
                                className="input-field"
                                required
                            >
                                <option value="marketplace">{t('platformTypes.marketplace')}</option>
                                <option value="social">{t('platformTypes.social')}</option>
                                <option value="branch">{t('platformTypes.branch')}</option>
                                <option value="other">{t('platformTypes.other')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.isActive')}</label>
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                />
                                <span className="text-sm text-slate-700">{form.is_active ? t('active') : t('inactive')}</span>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.description')}</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                className="input-field"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
                            {updateMutation.isPending ? t('saving') : t('actions.save')}
                        </button>
                        <Link to={`/sales-channels/${id}`} className="btn-secondary">{t('actions.cancel')}</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
