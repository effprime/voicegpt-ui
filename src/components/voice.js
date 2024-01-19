import React, { useState } from 'react';

function VoiceRecorder() {
    const [recorder, setRecorder] = useState(null);
    const [audioURL, setAudioURL] = useState('');
    const [recording, setRecording] = useState(false);
    const [sessionId, setSessionId] = useState(null); // New state for session ID

    const startRecording = async () => {
        try {
            // Request access to the user's microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
            // Create an audio context
            const audioContext = new AudioContext();
            // Create a source from the stream
            const source = audioContext.createMediaStreamSource(stream);
    
            // Continue with setting up and starting MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    
            let chunks = [];
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                chunks = [];
    
                const formData = new FormData();
                formData.append('file', blob, 'recording.webm');
    
                // Replace with your upload URL
                const uploadURL = 'http://localhost:8080/upload';

                // Append session ID to the URL if it exists
                const urlWithSession = sessionId ? `${uploadURL}?session=${sessionId}` : uploadURL;
                if (sessionId) {
                    console.log("using session ID: ", sessionId)
                } else {
                    console.log("no session ID")
                }
    
                const response = await fetch(urlWithSession, {
                    method: 'POST',
                    body: formData,
                });

                // Extract and update session ID if not already set
                if (!sessionId) {
                    const newSessionId = response.headers.get('X-Session-Id');
                    if (newSessionId) {
                        console.log("setting new session ID: ", newSessionId)
                        setSessionId(newSessionId);
                    }
                }
                console.log(response.headers)
    
                const audioData = await response.blob();
                setAudioURL(URL.createObjectURL(audioData));
            };
    
            mediaRecorder.start();
            setRecorder(mediaRecorder);
            setRecording(true);
    
        } catch (error) {
            console.error('Error in starting audio recording:', error);
        }
    };
    
    const stopRecording = () => {
        recorder.stop();
        setRecording(false);
    };

    return (
        <div>
            {recording ? (
                <button onClick={stopRecording}>Stop Recording</button>
            ) : (
                <button onClick={startRecording}>Start Recording</button>
            )}
            {audioURL && <audio src={audioURL} controls />}
        </div>
    );
}

export default VoiceRecorder;
