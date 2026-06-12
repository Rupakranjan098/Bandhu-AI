import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Plus, X, Trash2, Filter, Settings, CheckSquare, Bell, ArrowRight } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({ title: '', event_type: 'Meeting', description: '', time: '' });
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchEvents();
    fetchTasks();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:8001/events', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8001/tasks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8001/events', {
        ...newEvent,
        date: format(selectedDate, 'yyyy-MM-dd')
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setIsModalOpen(false);
      setNewEvent({ title: '', event_type: 'Meeting', description: '', time: '' });
      fetchEvents();
    } catch (error) {
      console.error("Error creating event", error);
    }
  };

  const handleDeleteEvent = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:8001/events/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event", error);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventStyles = (type) => {
    switch(type) {
      case 'Meeting': return 'bg-purple-500/10 border-l-2 border-purple-500 text-purple-400';
      case 'Work': return 'bg-blue-500/10 border-l-2 border-blue-500 text-blue-400';
      case 'Personal': return 'bg-green-500/10 border-l-2 border-green-500 text-green-400';
      case 'Reminder': return 'bg-orange-500/10 border-l-2 border-orange-500 text-orange-400';
      case 'Other': return 'bg-cyan-500/10 border-l-2 border-cyan-500 text-cyan-400';
      default: return 'bg-purple-500/10 border-l-2 border-purple-500 text-purple-400';
    }
  };

  const getDotColor = (type) => {
    switch(type) {
      case 'Meeting': return 'bg-purple-500';
      case 'Work': return 'bg-blue-500';
      case 'Personal': return 'bg-green-500';
      case 'Reminder': return 'bg-orange-500';
      case 'Other': return 'bg-cyan-500';
      default: return 'bg-purple-500';
    }
  };

  const productivityData = [
    { val: 65 }, { val: 78 }, { val: 72 }, { val: 85 }, { val: 80 }, { val: 92 }, { val: 87 }
  ];

  const pendingTasksCount = tasks.filter(t => !t.is_completed).length;
  const todayEventsCount = events.filter(e => e.date === format(new Date(), 'yyyy-MM-dd')).length;

  const upcomingEvents = [...events]
    .filter(e => new Date(e.date) >= new Date(format(new Date(), 'yyyy-MM-dd')))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <div className="flex-1 h-full flex py-8 px-8 gap-6 overflow-hidden">
      
      {/* Main Calendar Area */}
      <div className="flex-[2.5] flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-semibold text-white">Calendar</h1>
            <p className="text-gray-400 mt-2 text-sm">Schedule your occasions, meetings, and special days</p>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => { setSelectedDate(new Date()); setIsModalOpen(true); }}
              className="bg-brand-purple hover:bg-purple-600 transition-colors text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
            >
              <Plus size={18} /> New Event
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="bg-panel-dark border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors"
            >
              Today
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              <Filter size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border flex-1 flex flex-col min-h-0">
          
          {/* Calendar Header inside panel */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentDate(new Date())} className="text-gray-300 border border-white/10 rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors">
                Today
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><ChevronLeft size={18}/></button>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><ChevronRight size={18}/></button>
              </div>
              <div className="flex items-center gap-2 text-xl font-medium text-white cursor-pointer ml-2">
                {format(currentDate, 'MMMM yyyy')} <ChevronDown size={20} className="text-gray-400" />
              </div>
            </div>
            
            {/* View Toggle Group */}
            <div className="flex bg-[#1e2335] rounded-xl p-1 border border-white/5">
              {['Month', 'Week', 'Day', 'Agenda'].map(view => (
                <button key={view} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'Month' ? 'bg-brand-purple/20 text-brand-purple shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-gray-400 hover:text-white'}`}>
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Area */}
          <div className="flex-1 grid grid-cols-7 gap-px rounded-xl overflow-hidden border border-white/5 bg-white/5">
            {days.map((day, idx) => {
              const dayEvents = events.filter(e => e.date === format(day, 'yyyy-MM-dd'));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isSameDay(day, new Date());
              const displayEvents = dayEvents.slice(0, 2);
              const extraEvents = dayEvents.length - 2;

              return (
                <div 
                  key={idx}
                  onClick={() => { setSelectedDate(day); setIsModalOpen(true); }}
                  className={`bg-[#131620] p-3 flex flex-col min-h-[100px] cursor-pointer group transition-colors hover:bg-[#1a1f2e]
                    ${isTodayDate ? 'border border-brand-purple/50 bg-[#1a1f2e] shadow-[0_0_15px_rgba(168,85,247,0.15)]' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium ${isTodayDate ? 'w-6 h-6 flex items-center justify-center rounded-full bg-brand-purple text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' : isCurrentMonth ? 'text-gray-200' : 'text-gray-600'}`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 flex-1">
                    {displayEvents.length > 0 ? displayEvents.map(evt => (
                      <div key={evt.id} className={`px-2 py-1.5 rounded-r flex flex-col gap-0.5 relative group/evt ${getEventStyles(evt.event_type)}`}>
                        {evt.time && <span className="text-[10px] font-semibold opacity-90">{evt.time}</span>}
                        <span className="text-xs truncate opacity-80">{evt.title}</span>
                        <button onClick={(e) => handleDeleteEvent(evt.id, e)} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/evt:opacity-100 hover:text-white transition-opacity">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )) : (
                      <span className="text-xs text-gray-600 font-medium mt-1">No events</span>
                    )}
                    {extraEvents > 0 && (
                      <span className="text-xs text-gray-400 font-medium mt-0.5">+{extraEvents} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 pt-2">
            {['Meeting', 'Work', 'Personal', 'Reminder', 'Other'].map((type) => (
               <div key={type} className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <span className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${getDotColor(type)}`}></span>
                  {type}
               </div>
            ))}
          </div>

        </div>

        {/* Connect Calendar Banner */}
        <div className="mt-6 glass-panel rounded-2xl p-6 border border-glass-border flex justify-between items-center bg-gradient-to-r from-bg-dark to-panel-dark relative overflow-hidden">
          <div className="absolute left-0 top-0 w-32 h-full bg-brand-purple/10 blur-3xl rounded-full"></div>
          <div className="flex items-center gap-4 relative z-10">
             <div className="w-16 h-16 rounded-2xl bg-brand-purple/20 flex items-center justify-center border border-brand-purple/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <CalendarIcon size={32} className="text-brand-purple" />
             </div>
             <div>
               <h3 className="text-white font-medium text-lg">Stay on top of your schedule</h3>
               <p className="text-gray-400 text-sm">Connect your calendar to never miss an important event.</p>
             </div>
          </div>
          <button className="bg-brand-purple hover:bg-purple-600 transition-colors text-white px-6 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] relative z-10 flex items-center gap-2">
            <CalendarIcon size={18} /> Connect Calendar
          </button>
        </div>
      </div>

      {/* Custom Right Panel */}
      <div className="w-[320px] shrink-0 h-full overflow-y-auto no-scrollbar flex flex-col gap-6">
        
        {/* Today's Overview */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border flex flex-col gap-5">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <CalendarIcon size={18} className="text-brand-purple" /> Today's Overview
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <CalendarIcon size={20} />
              </div>
              <div>
                <div className="text-white font-semibold">{todayEventsCount}</div>
                <div className="text-gray-400 text-xs">Events Today</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <CheckSquare size={20} />
              </div>
              <div>
                <div className="text-white font-semibold">{pendingTasksCount}</div>
                <div className="text-gray-400 text-xs">Task Pending</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Bell size={20} />
              </div>
              <div>
                <div className="text-white font-semibold">0</div>
                <div className="text-gray-400 text-xs">Reminders</div>
              </div>
            </div>
          </div>
          <button className="w-full text-center text-brand-purple text-xs font-medium mt-2 hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
            View Full Calendar <ArrowRight size={14} />
          </button>
        </div>

        {/* Upcoming Events */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border flex flex-col gap-5">
          <h2 className="text-white font-semibold">Upcoming Events</h2>
          <div className="flex flex-col gap-4">
            {upcomingEvents.length > 0 ? upcomingEvents.map((evt, idx) => (
              <div key={idx} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${getDotColor(evt.event_type)}`}></div>
                  <div>
                    <div className="text-sm text-gray-200 font-medium group-hover:text-white transition-colors">{evt.title}</div>
                    <div className="text-xs text-gray-500">{format(parseISO(evt.date), 'MMM d')} • {evt.time || 'All Day'}</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
              </div>
            )) : (
              <div className="text-sm text-gray-500">No upcoming events</div>
            )}
          </div>
          <button className="w-full text-center text-brand-purple text-xs font-medium mt-2 hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
            View All Events <ArrowRight size={14} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border">
          <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple/20 group-hover:border-brand-purple/50 transition-all">
                <Plus size={20} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-200">New Event</span>
            </button>
            <button onClick={() => navigate('/tasks/new')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-all">
                <CheckSquare size={20} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-200">Add Task</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 group-hover:border-orange-500/50 transition-all">
                <Bell size={20} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-200">Add Reminder</span>
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 group-hover:border-green-500/50 transition-all">
                <CalendarIcon size={20} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-200">Go to Today</span>
            </button>
          </div>
        </div>

        {/* Your Productivity */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">Your Productivity</h2>
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg cursor-pointer hover:text-white">
              This Month <ChevronDown size={12} />
            </div>
          </div>
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="text-3xl font-bold text-white">87%</div>
              <div className="text-xs text-gray-400">Productivity Score</div>
            </div>
          </div>
          
          <div className="h-16 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#a855f7" 
                  strokeWidth={2} 
                  dot={false} 
                  filter="url(#glow)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-2">
             <div className="text-xs text-green-400 font-medium flex items-center gap-1">
               <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-green-400"></div>
               12%
             </div>
             <div className="text-xs text-gray-500">vs last month</div>
          </div>
        </div>

      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e2335] border border-glass-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <CalendarIcon size={20} className="text-brand-purple" />
              Add Event for {format(selectedDate, 'MMM do, yyyy')}
            </h3>
            <form onSubmit={handleAddEvent} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Event Title</label>
                <input 
                  type="text" required
                  value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-panel-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-purple transition-colors"
                  placeholder="e.g. Team Standup"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Event Type</label>
                  <select 
                    value={newEvent.event_type} onChange={e => setNewEvent({...newEvent, event_type: e.target.value})}
                    className="w-full bg-panel-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-purple appearance-none transition-colors"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Reminder">Reminder</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="w-1/3">
                  <label className="block text-sm text-gray-400 mb-1">Time</label>
                  <input 
                    type="text"
                    value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                    className="w-full bg-panel-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-purple transition-colors"
                    placeholder="10:00 AM"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description (Optional)</label>
                <textarea 
                  value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full bg-panel-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-purple h-24 resize-none transition-colors"
                  placeholder="Notes about this event..."
                />
              </div>
              <button type="submit" className="mt-2 w-full bg-brand-purple hover:bg-purple-600 text-white font-medium py-3 rounded-lg transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                Save Event
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CalendarPage;
