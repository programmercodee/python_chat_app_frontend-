/**
 * Typing indicator component.
 */

export default function TypingIndicator({ username }) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 text-[#a1a1aa] text-sm">
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#a1a1aa] rounded-full typing-dot" />
                <span className="w-2 h-2 bg-[#a1a1aa] rounded-full typing-dot" />
                <span className="w-2 h-2 bg-[#a1a1aa] rounded-full typing-dot" />
            </div>
            <span>{username} is typing...</span>
        </div>
    );
}
