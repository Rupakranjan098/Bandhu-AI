import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Trash2, ListTodo, Clock, CheckCircle2, TrendingUp, 
  Target, Coffee, PartyPopper, Calendar as CalendarIcon, Star, 
  MoreHorizontal, Filter, List, LayoutGrid, Bell, MessageSquare, Bot, ArrowRight, X, Edit3, CalendarDays, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay, isAfter, isBefore, addDays, parseISO } from 'date-fns';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [activeView, setActiveView] = useState('List View');
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8001/tasks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleQuickAdd = async (e) => {
    if (e.key === 'Enter' && newTaskInput.trim()) {
      try {
        await axios.post('http://localhost:8001/tasks', {
          title: newTaskInput,
          category: 'General',
          priority: 'Medium',
          due_date: format(new Date(), 'yyyy-MM-dd')
        }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setNewTaskInput('');
        fetchTasks();
      } catch (error) {
        console.error("Error quick adding task", error);
      }
    }
  };

  const toggleTask = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8001/tasks/${id}`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setTasks(tasks.map(t => t.id === id ? response.data : t));
    } catch (error) {
      console.error("Error toggling task", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'Medium': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      case 'Low': return 'bg-green-500/10 text-green-500 border border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
  };

  const getCategoryColor = (category) => {
    switch(category?.toLowerCase()) {
      case 'work': return 'bg-brand-purple/20 text-brand-purple';
      case 'development': return 'bg-brand-blue/20 text-brand-blue';
      case 'design': return 'bg-pink-500/20 text-pink-500';
      case 'setup': return 'bg-green-500/20 text-green-500';
      case 'database': return 'bg-blue-600/20 text-blue-600';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filters
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Completed') return task.is_completed;
    
    if (!task.due_date) return activeTab === 'Upcoming';

    const taskDate = parseISO(task.due_date);
    const today = new Date();
    
    if (activeTab === 'Today') {
      return isSameDay(taskDate, today) && !task.is_completed;
    }
    if (activeTab === 'Upcoming') {
      return isAfter(taskDate, today) && !isSameDay(taskDate, today) && !task.is_completed;
    }
    return true;
  });

  // Circular Progress for Today's Overview
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (productivityScore / 100) * circumference;

  const nextUpTasks = tasks
    .filter(t => !t.is_completed && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  return (
    <div className="flex-1 h-full flex py-8 px-8 gap-6 overflow-hidden">
      
      {/* Main Tasks Area */}
      <div className="flex-[2.5] flex flex-col min-w-0 h-full">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-4xl font-semibold text-white mt-1">Tasks</h1>
            <p className="text-gray-400 mt-2 text-sm">Manage your to-do lists and reminders</p>
          </div>
          <button 
            onClick={() => navigate('/tasks/new')} 
            className="bg-brand-blue hover:bg-blue-600 transition-colors text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center gap-2"
          >
            <Plus size={18} /> Create Task <ChevronDown size={16} />
          </button>
        </div>

        {/* Quick Add Bar */}
        <div className="glass-panel p-2 pl-4 rounded-2xl flex items-center gap-3 mb-6 border border-glass-border focus-within:border-brand-blue/50 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
            <Plus size={18} />
          </div>
          <input 
            type="text" 
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            onKeyDown={handleQuickAdd}
            placeholder="Add a new task..."
            className="flex-1 bg-transparent border-none text-white outline-none placeholder:text-gray-500"
          />
          <div className="text-xs text-gray-500 pr-4 font-medium">Press Enter to add</div>
        </div>

        {/* Filters and Views Row */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex bg-[#131620] p-1 rounded-xl border border-white/5">
            {[
              { id: 'All', icon: <LayoutGrid size={16} /> },
              { id: 'Today', icon: <Clock size={16} /> },
              { id: 'Upcoming', icon: <CalendarDays size={16} /> },
              { id: 'Completed', icon: <CheckCircle2 size={16} /> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-brand-purple/20 text-brand-purple shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-gray-400 hover:text-white'}`}
              >
                {tab.icon} {tab.id}
              </button>
            ))}
          </div>

          <div className="flex bg-[#131620] p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveView('List View')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'List View' ? 'bg-brand-purple/20 text-brand-purple shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={16} /> List View
            </button>
            <button 
              onClick={() => setActiveView('Kanban View')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'Kanban View' ? 'bg-brand-purple/20 text-brand-purple shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutGrid size={16} /> Kanban View
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="glass-panel p-5 rounded-3xl border border-glass-border flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 flex items-center justify-center text-brand-purple border border-brand-purple/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <ListTodo size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalTasks}</div>
              <div className="text-xs text-gray-400">Total Tasks</div>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-3xl border border-glass-border flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{pendingTasks}</div>
              <div className="text-xs text-gray-400">Pending</div>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-3xl border border-glass-border flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{completedTasks}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-3xl border border-glass-border flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 flex items-center justify-center text-brand-blue border border-brand-blue/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{productivityScore}%</div>
              <div className="text-xs text-gray-400">Productivity</div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#131620]/50 rounded-3xl border border-white/5 p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Your Tasks</h2>
            <div className="text-sm text-gray-400 flex items-center gap-1 cursor-pointer hover:text-white">
              Sort by: Priority <ChevronDown size={14} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No tasks found.</div>
            ) : filteredTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group">
                <div className="flex items-start gap-4">
                  <div 
                    onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center cursor-pointer transition-colors border ${task.is_completed ? 'bg-green-500 border-green-500 text-bg-dark' : 'border-gray-500 text-transparent hover:border-brand-blue hover:bg-brand-blue/10'}`}
                  >
                    <CheckSquare size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <div className={`font-medium mb-1 transition-colors ${task.is_completed ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-white'}`}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {task.category && (
                        <span className={`px-2 py-0.5 rounded-md font-medium ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon size={12} />
                          {isSameDay(parseISO(task.due_date), new Date()) ? 'Due Today' : format(parseISO(task.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      {task.is_important === 1 && (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Star size={12} fill="currentColor" /> Important
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                    {task.priority || 'Medium'}
                  </span>
                  <button className="text-gray-500 hover:text-yellow-400 transition-colors">
                    <Star size={18} className={task.is_important ? "fill-yellow-400 text-yellow-400" : ""} />
                  </button>
                  <button className="text-gray-500 hover:text-white transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="mt-6 glass-panel rounded-3xl p-6 border border-glass-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Bot size={18} className="text-brand-purple" /> AI Suggestions
            </h3>
            <button className="text-brand-purple text-sm hover:text-purple-400 transition-colors">See all</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#131620] rounded-2xl p-4 border border-white/5 flex items-start gap-4 group hover:border-brand-purple/30 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 text-xl">🎯</div>
              <div className="flex-1">
                <div className="text-sm text-gray-200 font-medium mb-1 group-hover:text-brand-purple transition-colors">You have {tasks.filter(t => t.priority === 'High' && !t.is_completed).length} high priority tasks</div>
                <div className="text-xs text-gray-500">Focus on completing them today.</div>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-brand-purple" />
            </div>
            <div className="bg-[#131620] rounded-2xl p-4 border border-white/5 flex items-start gap-4 group hover:border-brand-blue/30 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 text-xl">☕</div>
              <div className="flex-1">
                <div className="text-sm text-gray-200 font-medium mb-1 group-hover:text-brand-blue transition-colors">Good time to take a break!</div>
                <div className="text-xs text-gray-500">You've been productive for 2+ hours.</div>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-brand-blue" />
            </div>
            <div className="bg-[#131620] rounded-2xl p-4 border border-white/5 flex items-start gap-4 group hover:border-green-500/30 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 text-xl">🎉</div>
              <div className="flex-1">
                <div className="text-sm text-gray-200 font-medium mb-1 group-hover:text-green-400 transition-colors">Review your completed tasks</div>
                <div className="text-xs text-gray-500">Celebrate your achievements!</div>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-green-400" />
            </div>
          </div>
        </div>

      </div>

      {/* Custom Tasks Right Panel */}
      <div className="w-[320px] shrink-0 h-full overflow-y-auto no-scrollbar flex flex-col gap-6">
        
        {/* Today's Overview */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border flex flex-col gap-6">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <CalendarIcon size={18} className="text-brand-purple" /> Today's Overview
          </h2>
          
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle 
                  cx="40" cy="40" r={radius} 
                  fill="none" 
                  stroke="url(#gradient)" 
                  strokeWidth="6" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{productivityScore}%</span>
                <span className="text-[10px] text-gray-400">Completed</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-blue shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>
                <div>
                  <div className="text-white font-semibold text-sm">{totalTasks}</div>
                  <div className="text-[10px] text-gray-500">Total Tasks</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
                <div>
                  <div className="text-white font-semibold text-sm">{completedTasks}</div>
                  <div className="text-[10px] text-gray-500">Completed</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div>
                <div>
                  <div className="text-white font-semibold text-sm">{pendingTasks}</div>
                  <div className="text-[10px] text-gray-500">Pending</div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/calendar')} className="w-full text-center text-brand-purple text-xs font-medium mt-2 hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
            View Calendar <ArrowRight size={14} />
          </button>
        </div>

        {/* Next Up */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border flex flex-col gap-5">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Clock size={18} className="text-brand-purple" /> Next Up
          </h2>
          <div className="flex flex-col gap-4">
            {nextUpTasks.length > 0 ? nextUpTasks.map((task, idx) => (
              <div key={idx} className="flex justify-between items-center group cursor-pointer border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-gray-500 group-hover:text-brand-purple transition-colors">
                    <Clock size={14} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-200 font-medium group-hover:text-white transition-colors">{task.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {isSameDay(parseISO(task.due_date), new Date()) ? 'Due Today' : format(parseISO(task.due_date), 'MMM d')} • {task.priority === 'High' ? '75%' : '40%'}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                  {task.priority || 'Medium'}
                </span>
              </div>
            )) : (
              <div className="text-sm text-gray-500">No upcoming tasks</div>
            )}
          </div>
          <button className="w-full text-center text-brand-purple text-xs font-medium mt-2 hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
            View All Tasks <ArrowRight size={14} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-purple" /> Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => navigate('/tasks/new')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 transition-all">
                <CheckSquare size={20} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-200">New Task</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple/20 group-hover:border-brand-purple/50 transition-all">
                <Bell size={20} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-200">Set Reminder</span>
            </button>
            <button onClick={() => navigate('/notes')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/50 transition-all">
                <Edit3 size={20} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-200">Add Note</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple/20 group-hover:border-brand-purple/50 transition-all">
                <MessageSquare size={20} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-200">Start Chat</span>
            </button>
          </div>
        </div>

        {/* AI Assistant CTA */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-purple/20 blur-3xl rounded-full"></div>
          <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple border border-brand-purple/30 mb-2">
            <Bot size={24} />
          </div>
          <h3 className="text-white font-medium text-lg relative z-10">AI Assistant</h3>
          <p className="text-gray-400 text-xs leading-relaxed relative z-10 mb-2">
            Ask Bandhu AI to create tasks, set reminders or plan your day.
          </p>
          <button className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-opacity text-white py-3 rounded-xl font-medium shadow-[0_0_20px_rgba(168,85,247,0.4)] relative z-10">
            Ask Bandhu AI ✨
          </button>
        </div>

      </div>

    </div>
  );
};

export default TasksPage;
