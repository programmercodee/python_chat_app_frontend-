/**
 * Call Store (Zustand)
 * 
 * Manages the state of voice/video calls.
 * Connects WebRTC service with Socket.IO signaling.
 * 
 * CALL STATES:
 * - idle:      No active call
 * - calling:   We initiated a call, waiting for answer
 * - ringing:   Someone is calling us
 * - connecting: Call accepted, setting up WebRTC
 * - connected: Call is active
 * - ended:     Call just ended (shows end screen briefly)
 */

import { create } from 'zustand';
import { useSocketStore } from './index';
import webRTCService from '../services/webrtc';

// Get socket from socketStore
const getSocket = () => useSocketStore.getState().socket;

// Flag to prevent duplicate listener registration
let listenersRegistered = false;


// -----------------------------
// CALL STORE
// -----------------------------

export const useCallStore = create((set, get) => ({
    // ----- STATE -----

    callStatus: 'idle',  // 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended'

    callType: null,      // 'video' | 'audio' | null

    remoteUser: null,    // { id, username, avatar } - The other person

    localStream: null,   // Our camera/mic stream

    remoteStream: null,  // Their video/audio stream

    isMuted: false,      // Is our mic muted?

    isCameraOff: false,  // Is our camera off?

    callDuration: 0,     // Call duration in seconds

    isOutgoing: false,   // Did we initiate the call?


    // ----- ACTIONS -----

    /**
     * Initiate a call to another user.
     * 
     * @param {string} userId - Who to call
     * @param {string} username - Their username (for UI)
     * @param {string} avatar - Their avatar URL
     * @param {string} type - 'video' or 'audio'
     */
    initiateCall: async (userId, username, avatar, type = 'video') => {
        try {
            // 1. Get our camera/microphone
            const localStream = await webRTCService.getLocalStream(
                type === 'video',  // video
                true               // audio
            );

            set({
                callStatus: 'calling',
                callType: type,
                remoteUser: { id: userId, username, avatar },
                localStream,
                isMuted: false,
                isCameraOff: false,
                isOutgoing: true  // We are the caller
            });

            // 2. Tell the server we're calling this user
            getSocket()?.emit('call_initiate', {
                to_user_id: userId,
                call_type: type
            });

        } catch (error) {
            console.error('[Call] Failed to start call:', error);
            set({ callStatus: 'idle' });
            throw error;
        }
    },


    /**
     * Accept an incoming call.
     */
    acceptCall: async () => {
        const { remoteUser, callType } = get();
        if (!remoteUser) return;

        try {
            // 1. Get our camera/microphone
            console.log('[Call] Accepting call, getting media...');
            const localStream = await webRTCService.getLocalStream(
                callType === 'video',
                true
            );
            console.log('[Call] Got local stream:', localStream?.getTracks().length, 'tracks');

            set({
                callStatus: 'connecting',
                localStream,
                isMuted: false,
                isCameraOff: false
            });

            // 2. Tell the caller we accepted
            console.log('[Call] Emitting call_accept to:', remoteUser.id);
            getSocket()?.emit('call_accept', {
                to_user_id: remoteUser.id
            });

        } catch (error) {
            console.error('[Call] Failed to accept call:', error);
            console.error('[Call] Error name:', error.name);
            console.error('[Call] Error message:', error.message);

            // Show user-friendly error
            if (error.name === 'NotAllowedError') {
                alert('Please allow camera/microphone access to accept the call.');
            } else if (error.name === 'NotFoundError') {
                alert('No camera or microphone found on this device.');
            } else {
                alert('Failed to access camera/microphone: ' + error.message);
            }

            get().endCall('failed');
        }
    },


    /**
     * Reject an incoming call.
     */
    rejectCall: () => {
        const { remoteUser } = get();
        if (!remoteUser) return;

        getSocket()?.emit('call_reject', {
            to_user_id: remoteUser.id
        });

        webRTCService.cleanup();
        set({
            callStatus: 'idle',
            remoteUser: null,
            localStream: null
        });
    },


    /**
     * End the current call.
     * 
     * @param {string} reason - Why the call ended
     * @param {boolean} emitEnd - Whether to emit call_end (false if we received call_ended)
     */
    endCall: (reason = 'ended', emitEnd = true) => {
        const { remoteUser, callStatus } = get();

        // Prevent calling endCall if already ended/idle
        if (callStatus === 'idle' || callStatus === 'ended') {
            return;
        }

        // Only emit if we're ending the call (not receiving)
        if (emitEnd && remoteUser) {
            getSocket()?.emit('call_end', {
                to_user_id: remoteUser.id,
                reason
            });
        }

        webRTCService.cleanup();

        set({
            callStatus: 'ended',
            remoteStream: null,
            callDuration: 0
        });

        // Reset to idle after 2 seconds
        setTimeout(() => {
            set({
                callStatus: 'idle',
                remoteUser: null,
                localStream: null,
                callType: null
            });
        }, 2000);
    },


    /**
     * Toggle microphone mute.
     */
    toggleMute: () => {
        const isMuted = webRTCService.toggleMute();
        set({ isMuted });
    },


    /**
     * Toggle camera on/off.
     */
    toggleCamera: () => {
        const isCameraOff = webRTCService.toggleCamera();
        set({ isCameraOff });
    },


    /**
     * Set remote stream (called when WebRTC connects).
     */
    setRemoteStream: (stream) => {
        set({ remoteStream: stream, callStatus: 'connected' });
    },


    /**
     * Handle incoming call from socket.
     */
    handleIncomingCall: (data) => {
        // Only if we're not already in a call
        if (get().callStatus !== 'idle') {
            // We're busy
            getSocket()?.emit('call_end', {
                to_user_id: data.from_user_id,
                reason: 'busy'
            });
            return;
        }

        set({
            callStatus: 'ringing',
            callType: data.call_type,
            remoteUser: {
                id: data.from_user_id,
                username: data.from_username,
                avatar: data.from_avatar
            },
            isOutgoing: false  // We are receiving the call
        });
    },


    /**
     * Reset store to initial state.
     */
    reset: () => {
        webRTCService.cleanup();
        set({
            callStatus: 'idle',
            callType: null,
            remoteUser: null,
            localStream: null,
            remoteStream: null,
            isMuted: false,
            isCameraOff: false,
            callDuration: 0
        });
    }
}));


// -----------------------------
// SOCKET.IO EVENT LISTENERS
// -----------------------------
// These connect the Socket.IO events to our store

export function setupCallSocketListeners() {
    // Prevent duplicate registration
    if (listenersRegistered) {
        return;
    }

    const socket = getSocket();
    if (!socket) {
        // Only retry if not already registered and under max retries
        console.warn('[Call] Socket not ready, will setup listeners when connected');
        return;
    }

    listenersRegistered = true;

    // Someone is calling us
    socket.on('incoming_call', (data) => {
        console.log('[Call] Incoming call from:', data.from_username);
        useCallStore.getState().handleIncomingCall(data);
    });

    // Our call is ringing on their end
    socket.on('call_ringing', (data) => {
        console.log('[Call] Ringing...');
    });

    // They accepted our call - start WebRTC offer
    socket.on('call_accepted', async (data) => {
        console.log('[Call] Call accepted, creating offer...');

        useCallStore.setState({ callStatus: 'connecting' });

        // Setup WebRTC callbacks
        webRTCService.onRemoteStream = (stream) => {
            useCallStore.getState().setRemoteStream(stream);
        };

        webRTCService.onIceCandidate = (candidate) => {
            getSocket()?.emit('call_ice_candidate', {
                to_user_id: data.from_user_id,
                candidate
            });
        };

        // Create and send offer
        webRTCService.createPeerConnection();
        const offer = await webRTCService.createOffer();

        getSocket()?.emit('call_offer', {
            to_user_id: data.from_user_id,
            offer
        });
    });

    // They rejected our call
    socket.on('call_rejected', (data) => {
        console.log('[Call] Call rejected');
        useCallStore.getState().endCall('rejected', false);  // false = don't re-emit
    });

    // Call failed (user offline, etc)
    socket.on('call_failed', (data) => {
        console.log('[Call] Call failed:', data.reason);
        useCallStore.getState().endCall(data.reason, false);  // false = don't re-emit
    });

    // Received WebRTC offer - create answer
    socket.on('call_offer', async (data) => {
        console.log('[Call] Received offer, creating answer...');

        const { remoteUser } = useCallStore.getState();

        // Setup WebRTC callbacks
        webRTCService.onRemoteStream = (stream) => {
            useCallStore.getState().setRemoteStream(stream);
        };

        webRTCService.onIceCandidate = (candidate) => {
            getSocket()?.emit('call_ice_candidate', {
                to_user_id: data.from_user_id,
                candidate
            });
        };

        // Handle offer and create answer
        webRTCService.createPeerConnection();
        const answer = await webRTCService.handleOffer(data.offer);

        getSocket()?.emit('call_answer', {
            to_user_id: data.from_user_id,
            answer
        });
    });

    // Received WebRTC answer
    socket.on('call_answer', async (data) => {
        console.log('[Call] Received answer');
        await webRTCService.handleAnswer(data.answer);
    });

    // Received ICE candidate
    socket.on('call_ice_candidate', async (data) => {
        await webRTCService.addIceCandidate(data.candidate);
    });

    // Call ended by other party (don't re-emit!)
    socket.on('call_ended', (data) => {
        console.log('[Call] Call ended:', data.reason);
        useCallStore.getState().endCall(data.reason, false);  // false = don't emit call_end
    });

    console.log('[Call] Socket listeners registered');
}


export default useCallStore;
