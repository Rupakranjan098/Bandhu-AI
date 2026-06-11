import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Bot, User } from 'lucide-react';

const ChatBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center mr-3 mt-1 shrink-0 border border-brand-purple/30 text-brand-purple">
          <Bot size={16} />
        </div>
      )}
      
      <div className={`relative max-w-[85%] px-5 py-3.5 rounded-2xl ${
        isUser 
          ? 'bg-gradient-to-br from-brand-blue to-brand-purple text-white rounded-tr-sm shadow-lg' 
          : 'bg-panel-dark border border-glass-border text-gray-200 rounded-tl-sm shadow-md'
      }`}>
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        {/* Copy Button for Assistant Messages */}
        {!isUser && (
          <button 
            onClick={handleCopy}
            className="absolute -right-10 top-2 p-1.5 rounded-lg bg-panel-dark border border-glass-border text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center ml-3 mt-1 shrink-0 text-xs font-bold shadow-md">
          TU
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
