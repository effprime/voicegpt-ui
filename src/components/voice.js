import React, { useState } from 'react';
import './voice.css'

function VoiceRecorder() {
    const [recorder, setRecorder] = useState(null);
    const [audioURL, setAudioURL] = useState('');
    const [recording, setRecording] = useState(false);
    const [sessionId, setSessionId] = useState(null); // New state for session ID
    const [history, setHistory] = useState([])

    const addItemToHistory = (item) => {
        setHistory([...history, item]);
    };

    const startRecording = async () => {
        try {
            // Request access to the user's microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
                } else {
                    try {
                        const response = await fetch("http://localhost:8080/session/" + sessionId, {
                            method: 'GET',
                        });
                        if (!response.ok) {
                            console.error("HTTP error! Status: " + response.status);
                        } else {
                            const data = await response.json();
                            if (data?.messages) {
                                console.log("Setting history: ", data.messages)
                                setHistory(data.messages)
                            }
                        }
                    } catch (error) {
                        console.error('An error occurred:', error.message);
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
            <div className="convo-div">
            {audioURL && <audio src={audioURL} controls />}
            {history.map((message, index) => (
                <div key={index} className={message.role === 'user' ? 'user-message' : 'assistant-message'}>
                {message.content.split('\n').map((line, lineIndex) => (
                    <p key={lineIndex}>{line}</p>
                ))}
                </div>
            ))}
            </div>
            <div className="input-div">
            {recording ? (
                <button onClick={stopRecording}>Stop Recording</button>
            ) : (
                <button onClick={startRecording}>Start Recording</button>
            )}
            </div>
            
        </div>
    );
}

export default VoiceRecorder;
