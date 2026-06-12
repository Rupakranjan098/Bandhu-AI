import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import axios from 'axios';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({ title: '', event_type: 'Meeting', description: '' });

  useEffect(() => {
    fetchEvents();
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
      setNewEvent({ title: '', event_type: 'Meeting', description: '' });
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

  const getEventColor = (type) => {
    switch(type) {
      case 'Meeting': return 'bg-cyan-500 text-cyan-100 border-cyan-400/50';
      case 'Occasion': return 'bg-purple-500 text-purple-100 border-purple-400/50';
      case 'Special Day': return 'bg-yellow-500 text-yellow-100 border-yellow-400/50';
      default: return 'bg-brand-blue text-white border-brand-blue/50';
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col py-8 px-8 relative overflow-hidden">
      <div className="w-full mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-semibold text-white mt-1">Calendar</h1>
          <p className="text-gray-400 mt-2 text-sm">Schedule your occasions, meetings, and special days</p>
        </div>
        <button 
          onClick={() => { setSelectedDate(new Date()); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-brand-purple hover:bg-purple-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          <Plus size={18} />
          <span>New Event</span>
        </button>
      </div>
      
      <div className="flex-1 flex flex-col glass-panel rounded-3xl border border-glass-border p-6 overflow-hidden">
        
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6 px-4">
          <h2 className="text-2xl font-medium text-white">{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="grid grid-cols-7 gap-4 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1 gap-3 overflow-y-auto no-scrollbar pb-2">
            {days.map((day, idx) => {
              const dayEvents = events.filter(e => e.date === format(day, 'yyyy-MM-dd'));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={idx} 
                  onClick={() => { setSelectedDate(day); setIsModalOpen(true); }}
                  className={`min-h-[100px] p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col
                    ${isCurrentMonth ? 'bg-panel-dark/50 border-white/5 hover:border-brand-purple/50 hover:bg-white/5' : 'bg-transparent border-transparent opacity-30 hover:opacity-100'}
                    ${isToday ? 'border-brand-blue shadow-[0_0_15px_rgba(59,130,246,0.15)]' : ''}
                  `}
                >
                  <div className={`text-sm font-medium mb-2 ${isToday ? 'text-brand-blue flex items-center justify-between' : 'text-gray-300'}`}>
                    {format(day, 'd')}
                    {isToday && <span className="w-2 h-2 rounded-full bg-brand-blue"></span>}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto no-scrollbar">
                    {dayEvents.map(evt => (
                      <div key={evt.id} className={`text-xs px-2 py-1 rounded-md border flex justify-between items-center group/evt ${getEventColor(evt.event_type)}`}>
                        <span className="truncate">{evt.title}</span>
                        <button onClick={(e) => handleDeleteEvent(evt.id, e)} className="opacity-0 group-hover/evt:opacity-100 hover:text-red-300 transition-opacity">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e2335] border border-glass-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
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
                  className="w-full bg-panel-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-purple"
                  placeholder="e.g. Team Standup"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Event Type</label>
                <select 
                  value={newEvent.event_type} onChange={e => setNewEvent({...newEvent, event_type: e.target.value})}
                  className="w-full bg-panel-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-purple appearance-none"
                >
                  <option value="Meeting">Meeting 🔵</option>
                  <option value="Occasion">Occasion 🟣</option>
                  <option value="Special Day">Special Day 🟡</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description (Optional)</label>
                <textarea 
                  value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full bg-panel-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-purple h-24 resize-none"
                  placeholder="Notes about this event..."
                />
              </div>
              <button type="submit" className="mt-2 w-full bg-brand-purple hover:bg-purple-600 text-white font-medium py-3 rounded-lg transition-colors">
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
