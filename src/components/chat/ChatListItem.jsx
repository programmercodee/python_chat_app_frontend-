/**
 * Chat list item component.
 */

import { Avatar } from '../ui';

export default function ChatListItem({
    conversation,
    isActive,
    onClick,
    currentUserId
}) {
    // Get the other user for direct messages, or show group name
    const isGroup = conversation.type === 'group';
    const otherMember = !isGroup
        ? conversation.members?.find(m => m.user_id !== currentUserId)
        : null;

    const displayName = isGroup
        ? conversation.name
        : otherMember?.username || 'Unknown';

    const isOnline = otherMember?.is_online || false;

    return (
        <button
            onClick={onClick}
            className={`
        w-full flex items-center gap-3 p-3 rounded-xl transition-all
        ${isActive
                    ? 'bg-[#3b82f6]/10 border border-[#3b82f6]/30'
                    : 'hover:bg-[#262626] border border-transparent'
                }
      `}
        >
            <Avatar
                name={displayName}
                isOnline={isOnline}
                size="md"
            />

            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-[#e4e4e7]'}`}>
                        {displayName}
                    </p>
                    {conversation.last_message && (
                        <span className="text-xs text-[#71717a]">
                            {new Date(conversation.last_message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-[#71717a] truncate">
                        {conversation.last_message
                            ? 'Encrypted message'
                            : 'No messages yet'
                        }
                    </p>
                    {conversation.unread_count > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-[#3b82f6] text-white rounded-full">
                            {conversation.unread_count}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
