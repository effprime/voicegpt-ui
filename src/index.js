import React from 'react';
import ReactDOM from 'react-dom';
import VoiceRecorder from './components/voice';

const App = () => {
    return <VoiceRecorder></VoiceRecorder>;
};

ReactDOM.render(<App />, document.getElementById('root'));
