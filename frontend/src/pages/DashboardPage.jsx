import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckSquare, Calendar as CalendarIcon, Bell, Brain, ChevronRight, PenTool, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isToday } from 'date-fns';
import CenterContent from '../components/CenterContent';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [tasksRes, eventsRes, convsRes] = await Promise.all([
          axios.get('http://localhost:8001/tasks', config),
          axios.get('http://localhost:8001/events', config),
          axios.get('http://localhost:8001/conversations', config)
        ]);
        setTasks(tasksRes.data);
        setEvents(eventsRes.data);
        setConversations(convsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const pendingTasks = tasks.filter(t => t.is_completed === 0);
  const completedTasks = tasks.filter(t => t.is_completed === 1);
  const todayEvents = events.filter(e => isToday(new Date(e.date)));
  
  const productivityScore = tasks.length === 0 ? 100 : Math.round((completedTasks.length / tasks.length) * 100);

  // Mock data for the chart as we don't have historical data yet
  const chartData = [
    { name: 'Mon', Conversations: 2, Tasks: 1, Events: 0 },
    { name: 'Tue', Conversations: 5, Tasks: 3, Events: 1 },
    { name: 'Wed', Conversations: 3, Tasks: 2, Events: 0 },
    { name: 'Thu', Conversations: 7, Tasks: 5, Events: 2 },
    { name: 'Fri', Conversations: 4, Tasks: 1, Events: 1 },
    { name: 'Sat', Conversations: 0, Tasks: 0, Events: 0 },
    { name: 'Sun', Conversations: conversations.length, Tasks: completedTasks.length, Events: todayEvents.length }
  ];

  return (
    <div className="flex-1 h-full flex flex-col py-8 px-8 overflow-y-auto no-scrollbar relative text-white">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold mb-1">Dashboard</h1>
        <p className="text-gray-400 text-sm">Welcome back! Here's what's happening with your day.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Content Column */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Top Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-glass-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Conversations</p>
                <h3 className="text-xl font-semibold">{conversations.length}</h3>
                <p className="text-[10px] text-gray-500 mt-1">Total chats</p>
              </div>
            </div>
            
            <div className="glass-panel p-5 rounded-2xl border border-glass-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                <CheckSquare size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Tasks Pending</p>
                <h3 className="text-xl font-semibold">{pendingTasks.length}</h3>
                <p className="text-[10px] text-gray-500 mt-1">Pending tasks</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-glass-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
                <CalendarIcon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Events Today</p>
                <h3 className="text-xl font-semibold">{todayEvents.length}</h3>
                <p className="text-[10px] text-gray-500 mt-1">Scheduled today</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-glass-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                <Bell size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Reminders</p>
                <h3 className="text-xl font-semibold">0</h3>
                <p className="text-[10px] text-gray-500 mt-1">Pending reminders</p>
              </div>
            </div>
          </div>

          {/* Middle Row: Chart & Productivity */}
          <div className="flex gap-6">
            <div className="flex-[2] glass-panel p-6 rounded-2xl border border-glass-border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium">Weekly Activity</h3>
                <select className="bg-white/5 border border-white/10 rounded-lg text-xs px-2 py-1 outline-none text-gray-300">
                  <option>This Week</option>
                </select>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e2335', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="Conversations" stroke="#a855f7" strokeWidth={2} dot={{ r: 4, fill: '#a855f7' }} />
                    <Line type="monotone" dataKey="Tasks" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                    <Line type="monotone" dataKey="Events" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-2"><div className="w-3 h-1 bg-brand-purple rounded-full"></div> Conversations</div>
                <div className="flex items-center gap-2"><div className="w-3 h-1 bg-brand-blue rounded-full"></div> Tasks Completed</div>
                <div className="flex items-center gap-2"><div className="w-3 h-1 bg-green-500 rounded-full"></div> Events</div>
              </div>
            </div>

            <div className="flex-[1] glass-panel p-6 rounded-2xl border border-glass-border flex flex-col items-center justify-center text-center">
              <h3 className="font-medium w-full text-left mb-6">Productivity Score</h3>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-brand-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" strokeDasharray={`${productivityScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{productivityScore}%</span>
                  <span className="text-[10px] text-gray-400">Good</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-6">Keep it up! You're doing great.</p>
            </div>
          </div>

          {/* Third Row: Events & Conversations */}
          <div className="flex gap-6">
            <div className="flex-1 glass-panel p-5 rounded-2xl border border-glass-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-sm">Upcoming Events</h3>
                <button onClick={() => navigate('/calendar')} className="text-brand-purple text-xs hover:underline flex items-center">View Calendar <ChevronRight size={14} /></button>
              </div>
              <div className="flex flex-col gap-3">
                {events.slice(0, 2).map(evt => (
                  <div key={evt.id} className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-white/5 rounded-lg w-12 h-12 border border-white/5">
                      <span className="text-[10px] text-gray-400 uppercase">{format(new Date(evt.date), 'MMM')}</span>
                      <span className="font-semibold">{format(new Date(evt.date), 'dd')}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{evt.title}</p>
                      <p className="text-xs text-gray-400">{evt.event_type}</p>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p className="text-xs text-gray-500 italic">No upcoming events.</p>}
              </div>
            </div>

            <div className="flex-1 glass-panel p-5 rounded-2xl border border-glass-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-sm">Recent Conversations</h3>
                <button onClick={() => navigate('/conversations')} className="text-brand-purple text-xs hover:underline flex items-center">View All <ChevronRight size={14} /></button>
              </div>
              <div className="flex flex-col gap-3">
                {conversations.slice(0, 2).map(c => (
                  <div key={c.id} onClick={() => navigate(`/chat?id=${c.id}`)} className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0">
                      <MessageSquare size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-gray-400 truncate">{c.subtitle}</p>
                    </div>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-20 opacity-50">
                    <MessageSquare size={24} className="mb-2" />
                    <p className="text-xs text-gray-400">No recent conversations</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Tasks Overview & Quick Actions */}
          <div className="flex gap-6">
            <div className="flex-[2] glass-panel p-5 rounded-2xl border border-glass-border flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-4">Tasks Overview</h3>
                <div className="flex gap-12">
                  <div>
                    <h4 className="text-2xl font-bold text-brand-blue">{pendingTasks.length}</h4>
                    <p className="text-xs text-gray-400 mt-1">Pending</p>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-green-500">{completedTasks.length}</h4>
                    <p className="text-xs text-gray-400 mt-1">Completed</p>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-orange-400">0</h4>
                    <p className="text-xs text-gray-400 mt-1">In Progress</p>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-brand-purple">0</h4>
                    <p className="text-xs text-gray-400 mt-1">Overdue</p>
                  </div>
                </div>
              </div>
              <div className="w-24 h-24 opacity-20">
                <CheckSquare size={96} />
              </div>
            </div>

            <div className="flex-[1] glass-panel p-5 rounded-2xl border border-glass-border">
              <h3 className="font-medium text-sm mb-4 flex items-center gap-2"><Brain size={16} className="text-brand-purple"/> Quick Actions</h3>
              <div className="grid grid-cols-4 gap-2">
                <button onClick={() => navigate('/tasks/new')} className="flex flex-col items-center gap-2 text-gray-400 hover:text-brand-blue group">
                  <div className="w-10 h-10 rounded-full border border-white/10 group-hover:border-brand-blue/50 flex items-center justify-center transition-colors">
                    <CheckSquare size={14} />
                  </div>
                  <span className="text-[10px] text-center">New Task</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-orange-400 group">
                  <div className="w-10 h-10 rounded-full border border-white/10 group-hover:border-orange-400/50 flex items-center justify-center transition-colors">
                    <Bell size={14} />
                  </div>
                  <span className="text-[10px] text-center">Reminder</span>
                </button>
                <button onClick={() => navigate('/notes')} className="flex flex-col items-center gap-2 text-gray-400 hover:text-green-400 group">
                  <div className="w-10 h-10 rounded-full border border-white/10 group-hover:border-green-400/50 flex items-center justify-center transition-colors">
                    <PenTool size={14} />
                  </div>
                  <span className="text-[10px] text-center">Add Note</span>
                </button>
                <button onClick={() => navigate('/chat')} className="flex flex-col items-center gap-2 text-gray-400 hover:text-brand-purple group">
                  <div className="w-10 h-10 rounded-full border border-white/10 group-hover:border-brand-purple/50 flex items-center justify-center transition-colors">
                    <MessageSquare size={14} />
                  </div>
                  <span className="text-[10px] text-center">Chat</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Sidebar: AI Assistant */}
        <div className="w-[400px] flex flex-col glass-panel rounded-3xl border border-glass-border overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-panel-dark/80 backdrop-blur-xl shrink-0">
          <CenterContent />
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
