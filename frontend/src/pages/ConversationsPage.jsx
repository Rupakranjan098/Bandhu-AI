import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, Plus, FileText, Lightbulb, Code, BarChart2, BookOpen, Star, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ICONS = [MessageSquare, FileText, Lightbulb, Code, BarChart2, BookOpen, Star];
const COLORS = [
  'text-brand-purple bg-brand-purple/20',
  'text-blue-400 bg-blue-400/20',
  'text-green-400 bg-green-400/20',
  'text-orange-400 bg-orange-400/20',
  'text-purple-400 bg-purple-400/20',
  'text-teal-400 bg-teal-400/20',
  'text-pink-400 bg-pink-400/20'
];

const getIconConfig = (id) => {
  const IconComponent = ICONS[id % ICONS.length];
  const colorClass = COLORS[id % COLORS.length];
  return { IconComponent, colorClass };
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const ConversationsPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('http://localhost:8001/conversations', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 h-full flex flex-col py-10 px-8 relative overflow-hidden">
      <div className="w-full mb-8">
        <h1 className="text-4xl font-semibold text-white mt-1">Conversations</h1>
        <p className="text-gray-400 mt-2 text-sm">View your past chat history</p>
      </div>
      
      {/* Action Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-panel-dark border border-glass-border rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors"
          />
        </div>
        <button className="px-4 py-3 bg-panel-dark border border-glass-border rounded-xl text-gray-400 hover:text-white hover:border-brand-purple transition-all flex items-center justify-center">
          <Filter size={18} />
        </button>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-brand-purple hover:bg-purple-600 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
        >
          New Chat <Plus size={18} />
        </button>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar glass-panel rounded-3xl border border-glass-border p-2">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="w-16 h-16 rounded-full bg-brand-purple/20 flex items-center justify-center mb-4 border border-brand-purple/30">
              <MessageSquare size={24} className="text-brand-purple" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No conversations found</h3>
            <p className="text-gray-400 text-sm max-w-xs">Start a new chat or try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredConversations.map((conv, index) => {
              const { IconComponent, colorClass } = getIconConfig(conv.id);
              const isLast = index === filteredConversations.length - 1;
              return (
                <div key={conv.id} className="relative group">
                  <div 
                    onClick={() => navigate(`/?id=${conv.id}`)}
                    className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                      <IconComponent size={18} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">{conv.title}</h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.subtitle}</p>
                    </div>
                    
                    {/* Time & Options */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-500">{formatTime(conv.created_at)}</span>
                      <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                  {/* Divider */}
                  {!isLast && <div className="h-px w-[calc(100%-4rem)] bg-glass-border mx-auto ml-16"></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;
