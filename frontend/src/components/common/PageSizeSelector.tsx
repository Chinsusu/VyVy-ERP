interface PageSizeSelectorProps {
    pageSize: number;
    onChange: (size: number) => void;
    totalItems?: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const ALL_VALUE = 999999;

export default function PageSizeSelector({ pageSize, onChange, totalItems }: PageSizeSelectorProps) {
    const isAll = pageSize >= ALL_VALUE;

    return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Hiển thị:</span>
            <div className="flex items-center gap-1">
                {PAGE_SIZE_OPTIONS.map((size) => (
                    <button
                        key={size}
                        onClick={() => onChange(size)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${!isAll && pageSize === size
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {size}
                    </button>
                ))}
                <button
                    onClick={() => onChange(ALL_VALUE)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${isAll
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Tất cả{totalItems !== undefined ? ` (${totalItems})` : ''}
                </button>
            </div>
        </div>
    );
}
