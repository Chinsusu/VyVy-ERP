import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SearchableSelectOption {
    value: number;
    label: string;   // hiển thị trong dropdown
    searchText?: string; // thêm nếu muốn search theo text khác label
}

interface SearchableSelectProps {
    options: SearchableSelectOption[];
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    className?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Chọn...',
    searchPlaceholder = 'Tìm kiếm...',
    disabled = false,
    className = '',
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = options.find(o => o.value === value);

    // đóng khi click bên ngoài
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // focus vào input khi mở
    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    const filtered = options.filter(o => {
        const q = search.toLowerCase();
        const text = (o.searchText ?? o.label).toLowerCase();
        return text.includes(q);
    });

    function handleSelect(val: number) {
        onChange(val);
        setOpen(false);
        setSearch('');
    }

    function handleClear(e: React.MouseEvent) {
        e.stopPropagation();
        onChange(0);
        setSearch('');
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen(prev => !prev)}
                className={`input w-full flex items-center justify-between gap-2 text-left ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className={`truncate flex-1 ${!selected ? 'text-gray-400' : ''}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                    {selected && (
                        <span
                            onClick={handleClear}
                            className="p-0.5 hover:text-red-500 text-gray-400 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="input w-full pl-8 py-1.5 text-sm"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options list */}
                    <ul className="max-h-56 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-gray-400 text-center">Không tìm thấy</li>
                        ) : (
                            filtered.map(opt => (
                                <li
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-primary-50 hover:text-primary-700 ${opt.value === value ? 'bg-primary-50 font-medium text-primary-700' : 'text-gray-700'}`}
                                >
                                    {opt.label}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
