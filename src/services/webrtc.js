/**
 * WebRTC Service
 * 
 * Handles peer-to-peer audio/video connections using WebRTC.
 * This service manages the RTCPeerConnection and media streams.
 * 
 * HOW IT WORKS:
 * 1. User A creates an "offer" (their connection capabilities)
 * 2. User B receives offer and creates an "answer"
 * 3. Both exchange "ICE candidates" (network paths to connect)
 * 4. Once connected, audio/video flows directly between browsers
 */

// -----------------------------
// ICE SERVERS CONFIGURATION
// -----------------------------
// STUN servers help discover our public IP address.
// TURN servers relay traffic when direct connection fails.
// For now, we only use free Google STUN servers.
// To add TURN later, just add to this array!

const ICE_SERVERS = [
    // Free Google STUN servers (helps find public IP)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },

    // TODO: Add TURN server here if users behind strict NAT can't connect
    // Example: { urls: 'turn:your-server.com:3478', username: 'user', credential: 'pass' }
];


// -----------------------------
// WEBRTC SERVICE CLASS
// -----------------------------

class WebRTCService {
    constructor() {
        // The main WebRTC connection object
        this.peerConnection = null;

        // Our local camera/microphone stream
        this.localStream = null;

        // The remote user's stream (what we see/hear)
        this.remoteStream = null;

        // Callbacks for events
        this.onRemoteStream = null;      // Called when we receive remote video
        this.onIceCandidate = null;      // Called when we find a network path
        this.onConnectionStateChange = null;  // Called when connection status changes
    }


    // -----------------------------
    // GET USER'S CAMERA/MICROPHONE
    // -----------------------------

    /**
     * Request access to user's camera and/or microphone.
     * 
     * @param {boolean} video - Include video (camera)
     * @param {boolean} audio - Include audio (microphone)
     * @returns {MediaStream} The local media stream
     */
    async getLocalStream(video = true, audio = true) {
        try {
            // Ask browser for camera/mic access
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: video ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'  // Front camera on mobile
                } : false,
                audio: audio ? {
                    echoCancellation: true,
                    noiseSuppression: true
                } : false
            });

            return this.localStream;
        } catch (error) {
            console.error('[WebRTC] Failed to get media:', error);
            throw error;
        }
    }


    // -----------------------------
    // CREATE PEER CONNECTION
    // -----------------------------

    /**
     * Create a new WebRTC peer connection.
     * This is the main object that handles the connection.
     */
    createPeerConnection() {
        // Create connection with our ICE servers
        this.peerConnection = new RTCPeerConnection({
            iceServers: ICE_SERVERS
        });

        // EVENT: When we find a network path (ICE candidate)
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.onIceCandidate) {
                // Send this candidate to the other user via Socket.IO
                this.onIceCandidate(event.candidate);
            }
        };

        // EVENT: When we receive the remote user's stream
        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            if (this.onRemoteStream) {
                this.onRemoteStream(this.remoteStream);
            }
        };

        // EVENT: When connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            console.log('[WebRTC] Connection state:', state);

            if (this.onConnectionStateChange) {
                this.onConnectionStateChange(state);
            }
        };

        // Add our local tracks (audio/video) to the connection
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }

        return this.peerConnection;
    }


    // -----------------------------
    // CREATE OFFER (CALLER SIDE)
    // -----------------------------

    /**
     * Create an offer to send to the person we're calling.
     * The offer contains our connection capabilities.
     * 
     * @returns {RTCSessionDescription} The offer to send
     */
    async createOffer() {
        if (!this.peerConnection) {
            this.createPeerConnection();
        }

        // Create the offer
        const offer = await this.peerConnection.createOffer();

        // Set it as our local description
        await this.peerConnection.setLocalDescription(offer);

        return offer;
    }


    // -----------------------------
    // HANDLE OFFER (RECEIVER SIDE)
    // -----------------------------

    /**
     * Handle an incoming offer from the caller.
     * Create and return an answer.
     * 
     * @param {RTCSessionDescription} offer - The offer from caller
     * @returns {RTCSessionDescription} Our answer to send back
     */
    async handleOffer(offer) {
        if (!this.peerConnection) {
            this.createPeerConnection();
        }

        // Set the caller's offer as remote description
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        // Create our answer
        const answer = await this.peerConnection.createAnswer();

        // Set it as our local description
        await this.peerConnection.setLocalDescription(answer);

        return answer;
    }


    // -----------------------------
    // HANDLE ANSWER (CALLER SIDE)
    // -----------------------------

    /**
     * Handle the answer from the receiver.
     * 
     * @param {RTCSessionDescription} answer - The answer from receiver
     */
    async handleAnswer(answer) {
        if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }


    // -----------------------------
    // ADD ICE CANDIDATE
    // -----------------------------

    /**
     * Add an ICE candidate received from the other user.
     * ICE candidates are network paths that might work.
     * 
     * @param {RTCIceCandidate} candidate - The ICE candidate
     */
    async addIceCandidate(candidate) {
        if (this.peerConnection && candidate) {
            try {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('[WebRTC] Error adding ICE candidate:', error);
            }
        }
    }


    // -----------------------------
    // MEDIA CONTROLS
    // -----------------------------

    /**
     * Toggle microphone on/off.
     * @returns {boolean} New mute state
     */
    toggleMute() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                return !audioTrack.enabled;  // Return true if muted
            }
        }
        return false;
    }

    /**
     * Toggle camera on/off.
     * @returns {boolean} New camera-off state
     */
    toggleCamera() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                return !videoTrack.enabled;  // Return true if camera off
            }
        }
        return false;
    }


    // -----------------------------
    // CLEANUP
    // -----------------------------

    /**
     * End the call and cleanup all resources.
     */
    cleanup() {
        // Stop all local tracks (camera/mic)
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Close the peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.remoteStream = null;
        console.log('[WebRTC] Cleaned up');
    }
}


// Export a singleton instance
export const webRTCService = new WebRTCService();
export default webRTCService;
