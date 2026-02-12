interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

const statusConfig: Record<string, { className: string; label: string }> = {
    // Generic
    active: { className: 'badge-success', label: 'Active' },
    inactive: { className: 'badge-secondary', label: 'Inactive' },

    // Purchase Orders
    draft: { className: 'badge-secondary badge-dot', label: 'Draft' },
    approved: { className: 'badge-info badge-dot', label: 'Approved' },
    cancelled: { className: 'badge-danger badge-dot', label: 'Cancelled' },
    completed: { className: 'badge-success badge-dot', label: 'Completed' },

    // GRN
    pending_qc: { className: 'badge-warning badge-dot', label: 'Pending QC' },
    qc_passed: { className: 'badge-success badge-dot', label: 'QC Passed' },
    qc_failed: { className: 'badge-danger badge-dot', label: 'QC Failed' },
    posted: { className: 'badge-success badge-dot', label: 'Posted' },

    // Material Request
    pending: { className: 'badge-warning badge-dot', label: 'Pending' },
    picking: { className: 'badge-info badge-dot', label: 'Picking' },
    issued: { className: 'badge-success badge-dot', label: 'Issued' },
    partially_issued: { className: 'badge-info badge-dot', label: 'Partial Issue' },

    // Delivery Order
    shipped: { className: 'badge-success badge-dot', label: 'Shipped' },
    delivered: { className: 'badge-success badge-dot', label: 'Delivered' },

    // QC
    passed: { className: 'badge-success', label: 'Passed' },
    failed: { className: 'badge-danger', label: 'Failed' },

    // Stock
    increase: { className: 'badge-success', label: 'Increase' },
    decrease: { className: 'badge-danger', label: 'Decrease' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const normalized = status?.toLowerCase().replace(/\s+/g, '_') || '';
    const config = statusConfig[normalized] || { className: 'badge-secondary', label: status };

    return (
        <span className={`badge ${config.className} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}>
            {config.label}
        </span>
    );
}
