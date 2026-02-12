import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';
import { useCreateSalesChannel } from '../../hooks/useSalesChannels';

export default function SalesChannelCreatePage() {
    const { t } = useTranslation('salesChannels');
    const navigate = useNavigate();
    const createMutation = useCreateSalesChannel();

    const [form, setForm] = useState({
        code: '',
        name: '',
        platform_type: 'marketplace',
        description: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await createMutation.mutateAsync(form);
            navigate('/sales-channels');
        } catch (err: any) {
            setError(err.response?.data?.error || t('createError'));
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link to="/sales-channels" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                    <Store className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('createTitle')}</h1>
                    <p className="text-sm text-slate-500">{t('createSubtitle')}</p>
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
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.code')} *</label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                className="input-field"
                                placeholder="SHOPEE"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.name')} *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                className="input-field"
                                placeholder="Shopee"
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
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('form.description')}</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                className="input-field"
                                rows={3}
                                placeholder={t('form.descriptionPlaceholder')}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                            {createMutation.isPending ? t('saving') : t('actions.create')}
                        </button>
                        <Link to="/sales-channels" className="btn-secondary">{t('actions.cancel')}</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
