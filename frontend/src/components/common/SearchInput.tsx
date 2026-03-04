import { Search, X } from 'lucide-react';
import { useRef } from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    /** Width class, default 'w-56' */
    width?: string;
}

/**
 * Reusable realtime search input with clear button.
 * Fires onChange on every keystroke (realtime).
 */
export default function SearchInput({
    value,
    onChange,
    placeholder = 'Tìm kiếm...',
    className = '',
    width = 'w-56',
}: SearchInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={`relative ${width} ${className}`}>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="input w-full pl-8 pr-8 py-1.5 text-sm"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => {
                        onChange('');
                        inputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Xoá tìm kiếm"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}
