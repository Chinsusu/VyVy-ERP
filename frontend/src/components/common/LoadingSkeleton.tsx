interface LoadingSkeletonProps {
    variant?: 'card' | 'table' | 'detail' | 'text';
    count?: number;
}

export default function LoadingSkeleton({ variant = 'card', count = 4 }: LoadingSkeletonProps) {
    if (variant === 'table') {
        return (
            <div className="card p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="skeleton h-8 w-64 rounded-lg" />
                </div>
                <div className="divide-y divide-slate-50">
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4">
                            <div className="skeleton h-4 w-20 rounded" />
                            <div className="skeleton h-4 flex-1 rounded" />
                            <div className="skeleton h-4 w-24 rounded" />
                            <div className="skeleton h-6 w-16 rounded-full" />
                            <div className="skeleton h-4 w-12 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (variant === 'detail') {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <div className="skeleton w-12 h-12 rounded-xl" />
                    <div>
                        <div className="skeleton h-7 w-48 rounded mb-2" />
                        <div className="skeleton h-4 w-32 rounded" />
                    </div>
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="card">
                        <div className="skeleton h-5 w-40 rounded mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j}>
                                    <div className="skeleton h-3 w-20 rounded mb-2" />
                                    <div className="skeleton h-5 w-32 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'text') {
        return (
            <div className="space-y-3 animate-fade-in">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="skeleton skeleton-text rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
                ))}
            </div>
        );
    }

    // card variant
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="skeleton w-10 h-10 rounded-lg" />
                    </div>
                    <div className="skeleton h-3 w-24 rounded mb-2" />
                    <div className="skeleton h-7 w-16 rounded" />
                </div>
            ))}
        </div>
    );
}
