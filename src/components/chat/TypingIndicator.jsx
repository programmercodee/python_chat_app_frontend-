import React, { useState, useEffect } from 'react';

export default function TypingIndicator() {
    const [text, setText] = useState('');
    const fullText = 'typing...';

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            // Type out the text
            if (index <= fullText.length) {
                setText(fullText.slice(0, index));
                index++;
            } else {
                // Reset when done
                index = 0;
            }
        }, 200);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex justify-start !mb-2">
            <div className="!py-2 !px-2 rounded-2xl rounded-bl-md bg-gray-900 border border-gray-700 shadow-2xl">
                <div className="flex items-center">
                    <span className="text-white font-mono text-sm">{text}</span>
                    <span className="text-white font-mono text-sm ml-0.5 animate-blink">|</span>
                </div>
            </div>
        </div>
    );
}
