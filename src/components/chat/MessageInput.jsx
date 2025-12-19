/**
 * Message input component.
 */

import { useState, useRef } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

export default function MessageInput({ onSend, onTyping, disabled = false }) {
    const [message, setMessage] = useState('');
    const typingTimeoutRef = useRef(null);

    const handleChange = (e) => {
        setMessage(e.target.value);

        // Trigger typing indicator
        if (onTyping) {
            onTyping(true);

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing after 2 seconds of no input
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
            }, 2000);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!message.trim() || disabled) return;

        // In a real app, encrypt the message here
        onSend(message.trim());
        setMessage('');

        // Stop typing indicator
        if (onTyping) {
            onTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-[#1a1a1a] border-t border-[#2e2e2e]">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="p-2 text-[#71717a] hover:text-white hover:bg-[#262626] rounded-lg transition-colors"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <input
                    type="text"
                    value={message}
                    onChange={handleChange}
                    placeholder="Type a message..."
                    disabled={disabled}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#262626] border border-[#2e2e2e] text-white placeholder-[#52525b] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors disabled:opacity-50"
                />

                <button
                    type="button"
                    className="p-2 text-[#71717a] hover:text-white hover:bg-[#262626] rounded-lg transition-colors"
                >
                    <Smile className="w-5 h-5" />
                </button>

                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className="p-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}
