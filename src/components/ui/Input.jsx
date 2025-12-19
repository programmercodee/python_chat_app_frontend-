/**
 * Reusable Input component.
 */

export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    disabled = false,
    className = '',
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`
          w-full px-4 py-2.5 rounded-lg
          bg-[#1a1a1a] border border-[#2e2e2e]
          text-white placeholder-[#52525b]
          focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${error ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-[#ef4444]">{error}</p>
            )}
        </div>
    );
}
