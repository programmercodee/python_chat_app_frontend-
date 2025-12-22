/**
 * Avatar component.
 * Shows: avatar_url > default profile image
 */

import defaultProfileImage from '../../assets/default_profile_image.avif';

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

    // Use provided src, or fall back to default profile image
    const imageSrc = src || defaultProfileImage;

    return (
        <div className={`relative inline-block ${className}`}>
            <img
                src={imageSrc}
                alt={name || 'Profile'}
                className={`${sizes[size]} rounded-full object-cover`}
            />

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
