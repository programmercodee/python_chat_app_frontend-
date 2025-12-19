/**
 * Reusable Button component.
 */

export default function Button({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    ...props
}) {
    const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f0f]
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const variants = {
        primary: 'bg-[#3b82f6] hover:bg-[#2563eb] text-white focus:ring-[#3b82f6]',
        secondary: 'bg-[#262626] hover:bg-[#323232] text-white focus:ring-[#262626]',
        danger: 'bg-[#ef4444] hover:bg-[#dc2626] text-white focus:ring-[#ef4444]',
        ghost: 'bg-transparent hover:bg-[#262626] text-[#a1a1aa] hover:text-white',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    );
}
