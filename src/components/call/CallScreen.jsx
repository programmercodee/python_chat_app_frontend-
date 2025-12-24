/**
 * CallScreen Component
 * 
 * Full-screen call interface shown during active calls.
 * Responsive and always on top with mobile safe areas.
 */

import { useEffect, useRef, useState } from 'react';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    User, Maximize2, Minimize2
} from 'lucide-react';
import useCallStore from '../../store/callStore';

export default function CallScreen() {
    const {
        callStatus,
        callType,
        remoteUser,
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        isOutgoing,
        toggleMute,
        toggleCamera,
        endCall
    } = useCallStore();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteAudioRef = useRef(null);  // For voice calls
    const [callTime, setCallTime] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);

    // Attach local stream
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream (video call uses video element, voice call uses audio element)
    useEffect(() => {
        if (remoteStream) {
            if (callType === 'video' && remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            } else if (callType === 'audio' && remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = remoteStream;
            }
        }
    }, [remoteStream, callType]);

    // Call timer
    useEffect(() => {
        let timer;
        if (callStatus === 'connected') {
            timer = setInterval(() => setCallTime(prev => prev + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [callStatus]);

    // Reset timer when call ends
    useEffect(() => {
        if (callStatus === 'idle') {
            setCallTime(0);
        }
    }, [callStatus]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusText = () => {
        const direction = isOutgoing ? 'Outgoing' : 'Incoming';
        const typeText = callType === 'video' ? 'Video' : 'Voice';

        switch (callStatus) {
            case 'calling': return `${direction} ${typeText} Call...`;
            case 'ringing': return `${direction} ${typeText} Call - Ringing...`;
            case 'connecting': return 'Connecting...';
            case 'connected': return formatTime(callTime);
            case 'ended': return 'Call Ended';
            default: return '';
        }
    };

    // Don't render if no active call or if receiver is seeing incoming call modal
    // The IncomingCallModal handles 'ringing' state for receivers
    if (callStatus === 'idle') return null;
    if (callStatus === 'ringing' && !isOutgoing) return null;  // Receiver sees IncomingCallModal instead

    return (
        <>
            {/* Call screen - leaves space for bottom nav on mobile */}
            <div
                className={`
                    fixed z-[9999] bg-[#0a0a0a] flex flex-col
                    ${isMinimized
                        ? 'w-72 sm:w-80 h-40 sm:h-48 top-2 right-2 sm:top-4 sm:right-4 rounded-xl shadow-2xl'
                        : 'top-0 left-0 right-0 bottom-16 sm:bottom-0'}
                `}
            >

                {/* Remote Video / Avatar */}
                {callType === 'video' && remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] px-4">
                        {remoteUser?.avatar ? (
                            <img
                                src={remoteUser.avatar}
                                alt={remoteUser.username}
                                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white/20"
                            />
                        ) : (
                            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                            </div>
                        )}
                        <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center">
                            {remoteUser?.username || 'Unknown'}
                        </h2>
                        <p className="mt-2 text-base sm:text-lg text-zinc-400">{getStatusText()}</p>

                        {/* Hidden audio element for voice calls */}
                        {callType === 'audio' && remoteStream && (
                            <audio ref={remoteAudioRef} autoPlay />
                        )}
                    </div>
                )}

                {/* Local Video Preview */}
                {callType === 'video' && localStream && !isCameraOff && (
                    <div className="absolute top-14 sm:top-16 right-2 sm:right-4 w-20 h-28 sm:w-28 sm:h-36 lg:w-32 lg:h-44 rounded-lg overflow-hidden shadow-lg border-2 border-white/20">
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    </div>
                )}

                {/* Top Bar */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-2 sm:gap-3 safe-area-top">
                    <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                        <span className="text-white font-medium text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
                            {remoteUser?.username}
                        </span>
                        <span className="text-zinc-400 text-xs sm:text-sm">{getStatusText()}</span>
                    </div>
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="hidden sm:flex p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                    >
                        {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                    </button>
                </div>

                {/* Call Controls */}
                <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={toggleMute}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition
                            ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>

                    {callType === 'video' && (
                        <button
                            onClick={toggleCamera}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition
                                ${isCameraOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {isCameraOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>
                    )}

                    <button
                        onClick={() => endCall('ended')}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                    >
                        <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                </div>
            </div>
        </>
    );
}
