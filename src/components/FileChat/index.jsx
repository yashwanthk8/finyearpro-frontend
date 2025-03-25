import React, { useState, useEffect, useRef } from 'react';
import './FileChat.css';
import { parseFileContent } from '../../utils/fileParser';
import { getGeminiResponse, isProcessableFile } from '../../utils/geminiApi';
import { FEATURES } from '../../config';

/**
 * FileChat component with Gemini API integration for document Q&A
 */
const FileChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! Upload a document and ask me questions about it using Google\'s Gemini AI.' }
  ]);
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [fileName, setFileName] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Ref for auto-scrolling the chat
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validate file type and size
    if (!isProcessableFile(selectedFile)) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, this file type or size is not supported. Please upload a text, CSV, JSON, or Excel file under 10MB.' 
      }]);
      return;
    }

    setLoading(true);
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setMessages(prev => [...prev, { type: 'user', content: `Uploading: ${selectedFile.name}` }]);

    try {
      // Use the file parser utility
      const content = await parseFileContent(selectedFile);
      setFileContent(content);
      
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `File "${selectedFile.name}" loaded successfully! Ask me any questions about it, and I'll analyze it using Google's Gemini AI.` 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `Error reading file: ${error.message}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !fileContent) return;

    const userQuestion = question;
    setQuestion('');
    setMessages(prev => [...prev, { type: 'user', content: userQuestion }]);
    setLoading(true);

    try {
      let answer;
      
      if (FEATURES.enableGeminiIntegration) {
        // Use Gemini API for real-time Q&A
        answer = await getGeminiResponse(fileContent, userQuestion, fileName);
      } else {
        // Fallback to simulated response if Gemini is disabled
        answer = generateSimpleResponse(userQuestion, fileName, fileContent);
      }
      
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: answer 
      }]);
    } catch (error) {
      // Handle rate limit errors specifically
      if (error.message.includes("429") || error.message.includes("quota")) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `You've reached the daily limit for free API calls. Please wait a few minutes before trying again. You can still use the basic file analysis features.` 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `Sorry, I encountered an error: ${error.message}` 
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Simple fallback function if Gemini API is not available
  const generateSimpleResponse = (question, fileName, fileContent) => {
    question = question.toLowerCase();
    
    // Extract file extension
    const fileExt = fileName.split('.').pop().toLowerCase();
    
    // Generate simple responses based on questions and file type
    if (question.includes('what') && question.includes('file')) {
      return `This is a ${fileExt.toUpperCase()} file named "${fileName}".`;
    }
    
    if (question.includes('how') && question.includes('big') || question.includes('size')) {
      return `The file size is approximately ${Math.round(fileContent.length / 1024)} KB.`;
    }
    
    // Default response
    return `I've analyzed the ${fileExt} file "${fileName}", but I need Gemini API integration to provide detailed insights. Please check your API configuration.`;
  };

  return (
    <div className="file-chat-container">
      {/* Chat toggle button */}
      <button 
        className="file-chat-button"
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="file-chat-panel">
          <div className="file-chat-header">
            <h3>Document AI Assistant</h3>
            {fileName && <div className="file-chat-subheader">Analyzing: {fileName}</div>}
          </div>

          {/* Messages area */}
          <div className="file-chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`file-chat-message ${msg.type}`}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="file-chat-message bot loading">
                <div className="loading-animation">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* File upload */}
          <div className="file-chat-upload">
            <label htmlFor="file-upload" className="file-upload-label">
              {file ? "Change Document" : "Upload Document"}
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.json,.md,.xml"
              onChange={handleFileUpload}
              className="file-upload-input"
            />
            {file && <span className="file-badge">{fileName}</span>}
          </div>

          {/* Question input */}
          <form onSubmit={handleQuestionSubmit} className="file-chat-input">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              disabled={!fileContent || loading}
            />
            <button type="submit" disabled={!fileContent || !question.trim() || loading}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FileChat;