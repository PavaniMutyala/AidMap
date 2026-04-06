import { useState, useRef, useEffect } from 'react';
import { chatbotAPI } from '../services/api';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! 👋 I'm AidBot, your AidMap assistant. I can help you with:\n\n• How to register and get started\n• Submitting help requests\n• Becoming a volunteer\n• Understanding categories\n• Using the map\n• And more!\n\nWhat would you like to know?",
      time: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickQuestions = [
    'What is AidMap?',
    'How to register?',
    'How to submit a request?',
    'How to volunteer?',
    'Types of help available',
    'How does the map work?',
  ];

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      time: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await chatbotAPI.sendMessage(text.trim());
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: data.botResponse,
        time: data.timestamp,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Local fallback chatbot
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: getLocalResponse(text.trim()),
        time: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const getLocalResponse = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
      return "Hello! 👋 Welcome to AidMap. How can I assist you today?";
    if (lower.includes('what is aidmap') || lower.includes('about'))
      return "AidMap is a Smart Volunteer Allocation System that connects communities in need with nearby volunteers through location-based mapping and AI-powered skill matching.";
    if (lower.includes('register') || lower.includes('sign up'))
      return "To register:\n1. Click 'Register' on the home page\n2. Fill in your details\n3. Select your role\n4. Submit and you're ready!";
    if (lower.includes('submit') || lower.includes('request') || lower.includes('help'))
      return "To submit a help request:\n1. Go to your Community Dashboard\n2. Click 'New Help Request'\n3. Fill in details and location\n4. Submit — we'll find matching volunteers!";
    if (lower.includes('volunteer'))
      return "To volunteer:\n1. Register with 'Volunteer' role\n2. Select your skills\n3. You'll get notifications for nearby requests\n4. Accept tasks and make a difference!";
    if (lower.includes('map'))
      return "The map shows help requests as colored circles:\n🔴 Critical • 🟡 High • 🔵 Medium • 🟢 Low\nCircle sizes represent the number of people affected.";
    if (lower.includes('categor') || lower.includes('type'))
      return "Available categories:\n🍚 Food • 🏥 Medical • 🏠 Shelter • 📚 Education\n🚰 Sanitation • 🌪️ Disaster Relief • 👕 Clothing • 🧠 Mental Health";
    if (lower.includes('thank'))
      return "You're welcome! 😊 Happy to help!";
    if (lower.includes('bye'))
      return "Goodbye! 👋 Stay safe and keep helping!";
    return "I'm not sure about that. Try asking about:\n• Registration\n• Help requests\n• Volunteering\n• Map features\n• Categories";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">AidBot Assistant</h1>
          <p className="page-subtitle">Ask me anything about the AidMap platform.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="live-dot" />
          <span style={{ fontSize: '13px', color: 'var(--success-400)', fontWeight: 600 }}>Online</span>
        </div>
      </div>

      <div className="glass-card chatbot-container">
        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.type}`}>
              <div className="msg-avatar">
                {msg.type === 'bot' ? '🤖' : '👤'}
              </div>
              <div className="msg-bubble">
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < msg.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message bot">
              <div className="msg-avatar">🤖</div>
              <div className="msg-bubble">
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'pulse 1s ease infinite' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'pulse 1s ease infinite 0.2s' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)', animation: 'pulse 1s ease infinite 0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 var(--space-lg)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                className="btn btn-outline btn-sm"
                onClick={() => sendMessage(q)}
                style={{ fontSize: '12px' }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form className="chat-input-bar" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={!input.trim() || loading}>
            <HiOutlinePaperAirplane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
