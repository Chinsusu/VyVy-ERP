import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Store, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSalesChannels } from '../../hooks/useSalesChannels';
import type { SalesChannelFilters } from '../../types/salesChannel';

export default function SalesChannelListPage() {
    const { t } = useTranslation('salesChannels');
    const [filters, setFilters] = useState<SalesChannelFilters>({ offset: 0, limit: 20 });
    const { data, isLoading } = useSalesChannels(filters);

    const channels = data?.data || [];
    const total = data?.total || 0;
    const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1;
    const totalPages = Math.ceil(total / (filters.limit || 20));

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, search: e.target.value, offset: 0 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, offset: (newPage - 1) * (prev.limit || 20) }));
    };

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
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
                        <p className="text-sm text-slate-500">{t('subtitle', { count: total })}</p>
                    </div>
                </div>
                <Link to="/sales-channels/new" className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> {t('actions.create')}
                </Link>
            </div>

            {/* Search */}
            <div className="card mb-6">
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={filters.search || ''}
                            onChange={handleSearch}
                            className="input-field pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">{t('loading')}</div>
                ) : channels.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">{t('empty')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.code')}</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.name')}</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.platform')}</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.status')}</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('table.description')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {channels.map(channel => (
                                    <tr key={channel.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <Link to={`/sales-channels/${channel.id}`} className="font-mono text-sm font-medium text-violet-600 hover:text-violet-800">
                                                {channel.code}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link to={`/sales-channels/${channel.id}`} className="text-sm font-medium text-slate-900 hover:text-violet-600">
                                                {channel.name}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${platformBadge(channel.platform_type)}`}>
                                                {t(`platformTypes.${channel.platform_type}`)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${channel.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {channel.is_active ? t('active') : t('inactive')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-500 max-w-xs truncate">
                                            {channel.description || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            {t('pagination', { from: (filters.offset || 0) + 1, to: Math.min((filters.offset || 0) + (filters.limit || 20), total), total })}
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-slate-700">{currentPage} / {totalPages}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
