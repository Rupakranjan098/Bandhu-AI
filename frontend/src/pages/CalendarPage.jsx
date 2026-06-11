import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const CalendarPage = () => {
  return (
    <div className="flex-1 h-full flex flex-col py-10 px-8 relative overflow-hidden">
      <div className="w-full mb-8">
        <h1 className="text-4xl font-semibold text-white mt-1">Calendar</h1>
        <p className="text-gray-400 mt-2 text-sm">Schedule events and view upcoming meetings</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center glass-panel rounded-3xl border border-glass-border p-8">
        <div className="w-20 h-20 rounded-full bg-green-400/20 flex items-center justify-center mb-6 border border-green-400/30">
          <CalendarIcon size={32} className="text-green-400" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Your schedule is clear</h3>
        <p className="text-gray-400 max-w-sm">You have no upcoming events. Enjoy the free time!</p>
      </div>
    </div>
  );
};

export default CalendarPage;
