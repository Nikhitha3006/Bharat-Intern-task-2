const peer = new Peer(); // Create a PeerJS instance

let myPeerId;
let peerConnection;
let localStream;

const videoSection = document.getElementById('video-section');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');

// Set up PeerJS events
peer.on('open', (id) => {
    myPeerId = id;
    console.log(`My peer ID is: ${id}`);
});

peer.on('call', (call) => {
    // Answer incoming call and start video stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            localStream = stream;
            localVideo.srcObject = stream;
            call.answer(stream);
            call.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
            });
        })
        .catch((error) => {
            console.error('Error accessing local media:', error);
        });
});

// Handle chat messages
function sendMessage() {
    const message = chatInput.value;
    const messageElement = document.createElement('div');
    messageElement.textContent = `You: ${message}`;
    chatMessages.appendChild(messageElement);
    
    // Send message to the remote peer
    peerConnection.send(message);
    
    chatInput.value = '';
}

// Start a video call with a remote peer
function startVideoCall() {
    const remotePeerId = prompt('Enter the peer ID you want to call:');
    
    // Get local media stream and display it
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            localStream = stream;
            localVideo.srcObject = stream;

            // Create a PeerJS connection and call the remote peer
            peerConnection = peer.call(remotePeerId, stream);
            
            // Handle incoming data (chat messages) from the remote peer
            peerConnection.on('data', (data) => {
                const messageElement = document.createElement('div');
                messageElement.textContent = `Remote: ${data}`;
                chatMessages.appendChild(messageElement);
            });
            
            peerConnection.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
            });
        })
        .catch((error) => {
            console.error('Error accessing local media:', error);
        });
}

// Stop the video call
function stopVideoCall() {
    if (peerConnection) {
        peerConnection.close();
        localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;
    }
}

// Handle the 'Enter' key in the chat input
chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});