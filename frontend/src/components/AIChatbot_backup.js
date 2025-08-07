import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import syntheticDataService from '../services/syntheticDataService';
import './AIChatbot.css';

function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI trading analyst. I have access to your portfolio, market data, and news. Ask me anything about the stock market, trading strategies, investment insights, or your portfolio analysis!",
      isAI: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [portfolioData, setPortfolioData] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [userContext, setUserContext] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get user data
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load user data in background if user exists
    if (user) {
      loadUserData().catch(error => {
        console.error('Failed to load user data:', error);
      });
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      console.log('Starting to load user data...');
      
      // Set default data first
      setPortfolioData({
        portfolio: { holdings: [], total_value: 10000, cash: 10000 },
        performance: { realized_pnl: 0, unrealized_pnl: 0, total_pnl: 0 }
      });
      setMarketData([]);
      setNewsData([]);
      setUserContext('Demo mode - some data may be limited.');

      // Try to load real data in background (non-blocking)
      try {
        await syntheticDataService.initialize();
        const currentPrices = syntheticDataService.getAllCurrentPrices();
        setMarketData(currentPrices);
      } catch (e) {
        console.warn('Synthetic data failed:', e);
      }

      try {
        const [portfolioRes, performanceRes] = await Promise.all([
          api.get(`/portfolio/user/${user.id}`),
          api.get(`/trading/portfolio/performance/${user.id}`)
        ]);
        
        setPortfolioData({
          portfolio: portfolioRes.data,
          performance: performanceRes.data
        });
      } catch (e) {
        console.warn('Portfolio data failed:', e);
      }

      try {
        const newsRes = await api.get('/news');
        setNewsData(newsRes.data.news || []);
      } catch (e) {
        console.warn('News data failed:', e);
      }

    } catch (error) {
      console.error('Error in loadUserData:', error);
    }
  };

  const prepareUserContext = (portfolio, performance, prices, news) => {
    let context = "USER PORTFOLIO AND MARKET CONTEXT:\n\n";

    if (portfolio && portfolio.holdings) {
      context += "CURRENT PORTFOLIO:\n";
      context += `- Total Value: $${portfolio.total_value?.toFixed(2) || 0}\n`;
      context += `- Cash: $${portfolio.cash?.toFixed(2) || 0}\n`;
      context += "\n";
    }

    if (prices && prices.length > 0) {
      context += "CURRENT MARKET PRICES (Top 5):\n";
      prices.slice(0, 5).forEach(price => {
        context += `- ${price.symbol}: $${price.price?.toFixed(2)}\n`;
      });
      context += "\n";
    }

    return context;
  };

  const sendMessageToGemini = async (userMessage) => {
    const API_KEY = 'AIzaSyDQTfgGXCfU0a41vWsJyX8Dyeq1Bel8apk';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;
    
    let prompt = `You are an expert stock trading analyst. Answer the following market-related question professionally, concisely, and with actionable insights for traders and investors.

${userContext}

USER QUESTION: ${userMessage}

Provide helpful trading and investment insights.`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected response format from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      isAI: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const aiResponse = await sendMessageToGemini(userMessage.text);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        isAI: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setError('Sorry, I encountered an error. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your AI trading analyst. Ask me anything about the stock market!",
        isAI: true,
        timestamp: new Date()
      }
    ]);
    setError('');
  };

  return (
    <div className="ai-chatbot">
      <div className="chatbot-header">
        <div className="header-content">
          <div className="header-info">
            <h2>🤖 AI Trading Analyst</h2>
            <p>Powered by Google Gemini Flash 2.0</p>
          </div>
          <div className="header-actions">
            <button onClick={clearChat} className="clear-chat-btn">
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.isAI ? 'ai-message' : 'user-message'}`}
            >
              <div className="message-avatar">
                {message.isAI ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.text}
                </div>
                <div className="message-timestamp">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message ai-message">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="quick-actions">
            <button 
              className="quick-action-btn" 
              onClick={() => setInputMessage("Give me my portfolio analysis")}
              disabled={isLoading}
            >
              📊 Portfolio Analysis
            </button>
            <button 
              className="quick-action-btn" 
              onClick={() => setInputMessage("What are the latest market trends?")}
              disabled={isLoading}
            >
              📈 Market Trends
            </button>
            <button 
              className="quick-action-btn" 
              onClick={() => setInputMessage("Give me trading recommendations")}
              disabled={isLoading}
            >
              💡 Recommendations
            </button>
          </div>
          
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me about stocks, trading strategies, market analysis..."
              rows="1"
              className="message-input"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? (
                <span className="send-icon">⏳</span>
              ) : (
                <span className="send-icon">📤</span>
              )}
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChatbot;
