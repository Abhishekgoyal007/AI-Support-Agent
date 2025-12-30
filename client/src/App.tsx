import { useState, useRef, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import './App.css';

function App() {
  const { messages, isLoading, error, send, clearChat, setError } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      send(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <span className="header-icon">💬</span>
          <div>
            <h1>TechNest Support</h1>
            <span className="header-status">
              <span className="status-dot"></span>
              Online
            </span>
          </div>
        </div>
        <button onClick={clearChat} className="btn-new-chat">
          + New Chat
        </button>
      </header>

      {/* Messages */}
      <main className="messages">
        {messages.length === 0 && !isLoading && (
          <div className="welcome">
            <div className="welcome-icon">🛒</div>
            <h2>Welcome to TechNest Support!</h2>
            <p>I'm your AI assistant. Ask me about shipping, returns, payments, or anything else!</p>
            <div className="suggestions">
              <button onClick={() => send("What are your shipping options?")}>📦 Shipping Options</button>
              <button onClick={() => send("What is your return policy?")}>🔄 Return Policy</button>
              <button onClick={() => send("What payment methods do you accept?")}>💳 Payment Methods</button>
              <button onClick={() => send("Do you have any discounts?")}>🎉 Discounts</button>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            {msg.sender === 'ai' && <div className="avatar">🤖</div>}
            <div className="message-content">
              <div className="bubble">{msg.text}</div>
              <span className="timestamp">{formatTime(msg.timestamp)}</span>
            </div>
            {msg.sender === 'user' && <div className="avatar user-avatar">👤</div>}
          </div>
        ))}

        {isLoading && (
          <div className="message ai">
            <div className="avatar">🤖</div>
            <div className="message-content">
              <div className="bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Error Toast */}
      {error && (
        <div className="error-toast">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* Input */}
      <footer className="input-area">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            maxLength={4000}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="input-hint">Press Enter to send</p>
      </footer>
    </div>
  );
}

export default App;
