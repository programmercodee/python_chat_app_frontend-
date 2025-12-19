/**
 * Message bubble component.
 */

import { Check, CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, isOwn, senderName }) {
    const time = new Date(message.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`
        max-w-[75%] px-4 py-2 rounded-2xl
        ${isOwn
                    ? 'bg-[#3b82f6] text-white rounded-br-md'
                    : 'bg-[#262626] text-white rounded-bl-md'
                }
      `}>
                {/* Sender name for group chats */}
                {!isOwn && senderName && (
                    <p className="text-xs text-[#60a5fa] font-medium mb-1">
                        {senderName}
                    </p>
                )}

                {/* Message content - in real app this would be decrypted */}
                <p className="text-sm break-words">
                    {message.content_type === 'text'
                        ? '🔒 Encrypted message'
                        : `[${message.content_type}]`
                    }
                </p>

                {/* Time and status */}
                <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : 'text-[#71717a]'}`}>
                    <span className="text-[10px]">{time}</span>
                    {isOwn && (
                        message.is_read
                            ? <CheckCheck className="w-3.5 h-3.5 text-[#60a5fa]" />
                            : <Check className="w-3.5 h-3.5" />
                    )}
                </div>
            </div>
        </div>
    );
}
