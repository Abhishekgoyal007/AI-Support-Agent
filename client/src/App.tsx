import { useState, useRef, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import './App.css';

function App() {
  const { messages, isLoading, error, send, clearChat, setError } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim()) {
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

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>🛒 TechNest Support</h1>
        <button onClick={clearChat} className="clear-btn">New Chat</button>
      </header>

      {/* Messages */}
      <main className="messages">
        {messages.length === 0 && !isLoading && (
          <div className="welcome">
            <p>👋 Hi! I'm your TechNest support assistant.</p>
            <p>Ask me about shipping, returns, payments, or anything else!</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="bubble">{msg.text}</div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai">
            <div className="bubble typing">Thinking...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Error Toast */}
      {error && (
        <div className="error-toast">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Input */}
      <footer className="input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          Send
        </button>
      </footer>
    </div>
  );
}

export default App;
