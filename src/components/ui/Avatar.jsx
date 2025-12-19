/**
 * Avatar component.
 */

export default function Avatar({
    src,
    name,
    size = 'md',
    isOnline = false,
    className = ''
}) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-xl',
    };

    const onlineSizes = {
        sm: 'w-2 h-2 right-0 bottom-0',
        md: 'w-2.5 h-2.5 right-0 bottom-0',
        lg: 'w-3 h-3 right-0.5 bottom-0.5',
        xl: 'w-4 h-4 right-0.5 bottom-0.5',
    };

    // Get initials from name
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    // Generate color from name
    const colors = [
        'bg-[#3b82f6]', 'bg-[#10b981]', 'bg-[#f59e0b]',
        'bg-[#ef4444]', 'bg-[#8b5cf6]', 'bg-[#ec4899]',
    ];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

    return (
        <div className={`relative inline-block ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className={`${sizes[size]} rounded-full object-cover`}
                />
            ) : (
                <div className={`
          ${sizes[size]} ${colors[colorIndex]}
          rounded-full flex items-center justify-center font-medium text-white
        `}>
                    {initials}
                </div>
            )}

            {isOnline && (
                <span className={`
          absolute ${onlineSizes[size]}
          bg-[#10b981] rounded-full
          ring-2 ring-[#0f0f0f]
        `} />
            )}
        </div>
    );
}
