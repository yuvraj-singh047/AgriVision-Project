import React, { useState, useEffect, useRef } from 'react';

// --- Styles Component ---
const AppStyles = () => (
  <style>{`
    :root {
      --primary-green: #2e7d32;
      --secondary-green: #4caf50;
      --light-green-bg: #f0f4f0;
      --light-gray-border: #e0e0e0;
      --dark-text: #333;
      --light-text: #666;
      --white: #ffffff;
      --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      --danger-red: #d32f2f;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: var(--light-green-bg);
      color: var(--dark-text);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .App {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .app-header {
      width: 100%;
      background-color: var(--white);
      text-align: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--light-gray-border);
      box-shadow: var(--shadow);
      position: sticky;
      top: 0;
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
    }
    .app-header h1 {
      margin: 0;
      color: var(--primary-green);
      font-size: 1.5em;
      font-weight: 600;
    }
    .header-logo {
      max-height: 40px;
      height: 40px;
      width: auto;
      object-fit: contain;
    }
    .main-content {
      width: 100%;
      max-width: 1200px;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .upload-section, .chatbot-section {
      background-color: var(--white);
      padding: 30px 40px;
      border-radius: 12px;
      text-align: center;
      box-shadow: var(--shadow);
      margin: 0 auto 40px auto;
      max-width: 600px;
    }
    .upload-section h2, .chatbot-section h2 {
      margin-top: 0;
      font-size: 1.8em;
      color: var(--dark-text);
    }
    .upload-section p {
      color: var(--light-text);
      margin-bottom: 30px;
      font-size: 1.1em;
    }
    input[type="file"] { display: none; }
    .upload-button {
      background-color: var(--secondary-green);
      color: white;
      padding: 15px 30px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1em;
      font-weight: bold;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: background-color 0.3s ease, transform 0.2s ease;
    }
    .upload-button:hover {
      background-color: var(--primary-green);
      transform: translateY(-2px);
    }
    .loader {
      border: 5px solid #f3f3f3;
      border-top: 5px solid var(--primary-green);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 40px auto;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .results-container {
      margin-top: 40px;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 30px;
      align-items: start;
      margin-bottom: 40px;
    }
    .image-preview-card, .results-card {
      background-color: var(--white);
      padding: 30px;
      border-radius: 12px;
      box-shadow: var(--shadow);
      text-align: left;
    }
    .image-preview-card h3, .results-card h3 {
      margin-top: 0;
      border-bottom: 1px solid var(--light-gray-border);
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .image-preview-card img {
      width: 100%;
      border-radius: 8px;
      object-fit: cover;
    }
    .disease-name {
      font-size: 1.6em;
      font-weight: bold;
      color: var(--primary-green);
      margin: 0;
    }
    .confidence-score {
      background-color: var(--light-green-bg);
      color: var(--primary-green);
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.9em;
      margin-top: 15px;
      font-weight: 500;
    }
    .results-card h4 { margin-top: 30px; margin-bottom: 10px; }
    .recommendations { color: var(--light-text); line-height: 1.6; }
    .error-card { border-left: 5px solid var(--danger-red); background-color: #fff8f8; }
    .chatbot-container {
      border: 1px solid var(--light-gray-border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 500px;
    }
    .chatbot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background-color: #f7f7f7;
      border-bottom: 1px solid var(--light-gray-border);
      font-weight: bold;
      color: var(--dark-text);
    }
    .clear-chat-button {
      background-color: transparent;
      border: 1px solid var(--light-gray-border);
      color: var(--light-text);
      padding: 5px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8em;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    .clear-chat-button:hover { background-color: #e0e0e0; color: var(--dark-text); }
    .chatbot-messages {
      flex-grow: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .message {
      padding: 10px 15px;
      border-radius: 18px;
      max-width: 80%;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .message.user {
      background-color: var(--primary-green);
      color: var(--white);
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .message.bot {
      background-color: #f1f1f1;
      color: var(--dark-text);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .chatbot-input-form {
      display: flex;
      border-top: 1px solid var(--light-gray-border);
      align-items: center;
    }
    .chatbot-input-form input {
      flex-grow: 1;
      border: none;
      padding: 15px;
      font-size: 1em;
      outline: none;
    }
    .chatbot-input-form input:disabled { background-color: #f9f9f9; }
    .chatbot-input-form button {
      background-color: var(--secondary-green);
      color: var(--white);
      border: none;
      padding: 0 25px;
      font-size: 1em;
      cursor: pointer;
      transition: background-color 0.3s ease;
      height: 100%;
    }
    .chatbot-input-form button:hover { background-color: var(--primary-green); }
    .chatbot-input-form button:disabled { background-color: #cccccc; cursor: not-allowed; }
    .mic-button {
      background: transparent;
      border: none;
      padding: 0 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mic-button svg {
      fill: var(--light-text);
      transition: fill 0.3s ease;
    }
    .mic-button.listening svg {
      fill: var(--danger-red);
    }
    .typing-indicator span {
      height: 8px;
      width: 8px;
      background-color: #9E9E9E;
      border-radius: 50%;
      display: inline-block;
      animation: bob 1.4s infinite ease-in-out both;
    }
    .typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
    @keyframes bob { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
    
    .speech-status {
      font-size: 0.9em;
      padding: 0 20px 10px 20px;
      text-align: center;
      min-height: 1.2em; /* Prevent layout shift */
    }
    .speech-status.listening {
      color: var(--primary-green);
    }
    .speech-status.error {
      color: var(--danger-red);
    }

    @media (max-width: 900px) { .results-container { grid-template-columns: 1fr; } }
  `}</style>
);

// --- Icon Components ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
  </svg>
);

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M6 6h12v12H6V6z"/>
    </svg>
);

// --- ❗ IMPORTANT CONFIGURATION ❗ ---
// This variable controls where the frontend sends its requests.
// For testing on your PC, this MUST be your local address.
const BACKEND_URL = 'http://127.0.0.1:5000';


// --- Chatbot Component ---
const Chatbot = () => {
  const initialMessage = { text: "Hello! I'm AgriBot. Ask me any follow-up questions about your diagnosis or general farming.", sender: 'bot' };
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const recognition = useRef(null);
  const messagesEndRef = useRef(null);
  const statusTimeoutRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';
      setSpeechSupported(true);

      recognition.current.onstart = () => {
        setIsListening(true);
        setStatusMessage("Listening...");
        setIsError(false);
      };
      
      recognition.current.onend = () => {
        setIsListening(false);
        setStatusMessage(null);
      };
      
      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setStatusMessage(null);
      };
      
      recognition.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        let errorMessage;
        switch (event.error) {
          case 'no-speech':
            errorMessage = "Sorry, I didn't hear anything. Please try again.";
            break;
          case 'audio-capture':
          case 'not-allowed':
            errorMessage = "Microphone access is blocked. Please check your browser permissions.";
            break;
          case 'network':
            errorMessage = "The speech service is unavailable. Please check your connection or try again later.";
            break;
          default:
            errorMessage = "An unknown error occurred with speech recognition.";
            break;
        }
        setStatusMessage(errorMessage);
        setIsError(true);
        setIsListening(false);
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
      setSpeechSupported(false);
    }
  }, []);
  
  useEffect(() => {
    if (statusMessage) {
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => setStatusMessage(null), 5000);
    }
    return () => {
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, [statusMessage]);

  const handleMicClick = () => {
    if (isListening) {
      recognition.current.stop();
    } else {
      recognition.current.start();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const botMessage = { text: data.reply, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage = { text: "Sorry, AgriBot seems to be offline. Please ensure your local server is running.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([initialMessage]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <span>AgriBot Assistant</span>
        <button onClick={handleClearChat} className="clear-chat-button">Clear Chat</button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`speech-status ${isListening ? 'listening' : ''} ${isError ? 'error' : ''}`}>
        {statusMessage}
      </div>

      <form className="chatbot-input-form" onSubmit={handleSendMessage}>
        {speechSupported && (
            <button type="button" onClick={handleMicClick} className={`mic-button ${isListening ? 'listening' : ''}`} aria-label={isListening ? "Stop listening" : "Use microphone"}>
                {isListening ? <StopIcon /> : <MicIcon />}
            </button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AgriBot a question..."
          aria-label="Chat input"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>Send</button>
      </form>
    </div>
  );
};


// --- Main App Component ---
function App() {
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    };

    setResult(null);
    setIsLoading(true);
    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setResult({
        prediction: data.prediction,
        confidence: data.confidence ? (data.confidence * 100).toFixed(1) + "%" : "N/A",
        recommendation: data.recommendation,
      });
    } catch (error) {
      console.error("Prediction error:", error);
      setResult({ error: "Could not connect to the server. Please ensure your local backend is running." });
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="App">
      <AppStyles /> {/* Render the styles */}
      <header className="app-header">
        <img src="https://i.postimg.cc/VkZ5ty1x/252889de-ccb6-4c06-bbf5-0e151ab7f1b3.jpg" alt="AgriVision Logo" className="header-logo" />
        <h1>AgriVision AI</h1>
      </header>
      <main className="main-content">
        <div className="upload-section">
          <h2>1. Get an Instant Diagnosis</h2>
          <p>Upload a clear photo of a plant leaf.</p>
          <label htmlFor="imageUploader" className="upload-button">
            <UploadIcon />
            Upload Image
          </label>
          <input 
            type="file" 
            id="imageUploader"
            accept="image/*" 
            onChange={handleImageChange} 
          />
        </div>

        {isLoading && <div className="loader"></div>}

        {result && (
          <div className="results-container">
            <div className="image-preview-card">
              <h3>Your Image</h3>
              <img src={imagePreview} alt="Leaf preview" />
            </div>
            {result.error ? (
              <div className="results-card error-card">
                 <h3>Error</h3>
                 <p>{result.error}</p>
              </div>
            ) : (
              <div className="results-card">
                <h3>Analysis Result</h3>
                <p className="disease-name">{result.prediction}</p>
                <div className="confidence-score">
                  <strong>Confidence:</strong> {result.confidence}
                </div>
                <h4>Treatment Recommendations</h4>
                <p className="recommendations">{result.recommendation}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="chatbot-section">
          <h2>2. Ask a Follow-up Question</h2>
          <Chatbot />
        </div>
      </main>
    </div>
  );
}

export default App;

