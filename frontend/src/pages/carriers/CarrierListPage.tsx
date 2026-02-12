import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCarriers, useDeleteCarrier } from '../../hooks/useCarriers';
import { Truck, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import type { Carrier, CarrierFilter } from '../../types/carrier';

export default function CarrierListPage() {
    const [filter, setFilter] = useState<CarrierFilter>({ limit: 20, offset: 0 });
    const [search, setSearch] = useState('');
    const { data, isLoading } = useCarriers({ ...filter, search: search || undefined });
    const deleteCarrier = useDeleteCarrier();

    const carriers: Carrier[] = data?.data || [];
    const total = data?.total || 0;

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete carrier "${name}"?`)) {
            deleteCarrier.mutate(id);
        }
    };

    const carrierTypeLabel = (type: string) => {
        const labels: Record<string, string> = { express: 'Express', freight: 'Freight', internal: 'Internal' };
        return labels[type] || type;
    };

    const carrierTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            express: 'bg-blue-50 text-blue-700 border-blue-200',
            freight: 'bg-amber-50 text-amber-700 border-amber-200',
            internal: 'bg-gray-50 text-gray-700 border-gray-200',
        };
        return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Truck className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Carriers</h1>
                        <p className="text-sm text-gray-500">{total} carrier(s)</p>
                    </div>
                </div>
                <Link to="/carriers/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Carrier
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            className="input pl-10 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="input"
                        value={filter.carrier_type || ''}
                        onChange={(e) => setFilter({ ...filter, carrier_type: e.target.value || undefined, offset: 0 })}
                    >
                        <option value="">All Types</option>
                        <option value="express">Express</option>
                        <option value="freight">Freight</option>
                        <option value="internal">Internal</option>
                    </select>
                    <select
                        className="input"
                        value={filter.is_active === undefined ? '' : String(filter.is_active)}
                        onChange={(e) => setFilter({ ...filter, is_active: e.target.value === '' ? undefined : e.target.value === 'true', offset: 0 })}
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : carriers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No carriers found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {carriers.map((carrier) => (
                                <tr key={carrier.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-sm font-semibold">{carrier.code}</td>
                                    <td className="px-4 py-3 font-medium">{carrier.name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${carrierTypeColor(carrier.carrier_type)}`}>
                                            {carrierTypeLabel(carrier.carrier_type)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{carrier.contact_phone || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${carrier.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${carrier.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {carrier.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link to={`/carriers/${carrier.id}`} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="View">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link to={`/carriers/${carrier.id}/edit`} className="p-1.5 hover:bg-yellow-50 rounded text-yellow-600" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => handleDelete(carrier.id, carrier.name)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {total > (filter.limit || 20) && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Showing {(filter.offset || 0) + 1} - {Math.min((filter.offset || 0) + (filter.limit || 20), total)} of {total}</p>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-sm"
                            disabled={(filter.offset || 0) === 0}
                            onClick={() => setFilter({ ...filter, offset: Math.max(0, (filter.offset || 0) - (filter.limit || 20)) })}
                        >Previous</button>
                        <button
                            className="btn btn-sm"
                            disabled={(filter.offset || 0) + (filter.limit || 20) >= total}
                            onClick={() => setFilter({ ...filter, offset: (filter.offset || 0) + (filter.limit || 20) })}
                        >Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}
