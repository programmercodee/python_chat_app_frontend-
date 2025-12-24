/**
 * IncomingCallModal Component
 * 
 * Popup shown when someone is calling us.
 * Has Accept, Reject, and Minimize buttons.
 */

import { useState } from 'react';
import { Phone, PhoneOff, Video, User, Minimize2, X } from 'lucide-react';
import useCallStore from '../../store/callStore';

export default function IncomingCallModal() {
    const { callStatus, callType, remoteUser, acceptCall, rejectCall } = useCallStore();
    const [isMinimized, setIsMinimized] = useState(false);

    if (callStatus !== 'ringing') return null;

    // Minimized view - small floating notification
    if (isMinimized) {
        return (
            <div className="fixed top-4 right-4 z-[10000] bg-[#1a1a1a] rounded-xl p-3 shadow-2xl border border-[#2a2a2a] animate-pulse">
                <div className="flex items-center gap-3">
                    {remoteUser?.avatar ? (
                        <img src={remoteUser.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-green-500" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{remoteUser?.username}</p>
                        <p className="text-green-400 text-xs">{callType === 'video' ? 'Video' : 'Voice'} Call</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsMinimized(false)} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
                            <Minimize2 className="w-4 h-4" />
                        </button>
                        <button onClick={acceptCall} className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600">
                            <Phone className="w-4 h-4" />
                        </button>
                        <button onClick={rejectCall} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Full modal view
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#2a2a2a] w-full max-w-xs sm:max-w-sm animate-pulse relative">

                {/* Minimize button (top right) */}
                <button
                    onClick={() => setIsMinimized(true)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/10 text-zinc-400 hover:bg-white/20 hover:text-white transition"
                    title="Minimize"
                >
                    <Minimize2 className="w-4 h-4" />
                </button>

                {/* Caller Avatar */}
                <div className="flex justify-center mb-4 sm:mb-6">
                    {remoteUser?.avatar ? (
                        <img
                            src={remoteUser.avatar}
                            alt={remoteUser.username}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-green-500 shadow-lg shadow-green-500/30"
                        />
                    ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-4 border-green-500">
                            <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                        </div>
                    )}
                </div>

                {/* Caller Name */}
                <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2 truncate px-2">
                    {remoteUser?.username || 'Unknown'}
                </h2>

                {/* Call Type */}
                <p className="text-zinc-400 text-center mb-6 sm:mb-8 flex items-center justify-center gap-2 text-sm sm:text-base">
                    {callType === 'video' ? (
                        <>
                            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                            Incoming Video Call
                        </>
                    ) : (
                        <>
                            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                            Incoming Voice Call
                        </>
                    )}
                </p>

                {/* Action Buttons */}
                <div className="flex justify-center gap-6 sm:gap-8">
                    <button
                        onClick={rejectCall}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-lg hover:scale-105"
                        title="Reject"
                    >
                        <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>

                    <button
                        onClick={acceptCall}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition shadow-lg hover:scale-105"
                        title="Accept"
                    >
                        <Phone className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                </div>

                {/* Hint */}
                <p className="text-zinc-500 text-xs sm:text-sm text-center mt-4 sm:mt-6">
                    Tap minimize to answer later
                </p>
            </div>
        </div>
    );
}
