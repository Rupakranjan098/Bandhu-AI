import React from 'react';
import { Calendar, CheckSquare, Bell, ChevronRight, Edit3, MessageSquare, Brain, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OverviewItem = ({ icon: Icon, count, label, colorClass }) => (
  <div className="flex items-center gap-4 py-3 cursor-pointer group">
    <div className={`p-2 rounded-xl bg-panel-dark border border-glass-border ${colorClass}`}>
      <Icon size={18} />
    </div>
    <div className="flex-1">
      <div className="text-white font-medium">{count}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
    <ChevronRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
  </div>
);

const QuickActionButton = ({ icon: Icon, label, colorClass, onClick }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer group w-14">
    <div className="w-14 h-14 rounded-2xl bg-panel-dark border border-glass-border flex items-center justify-center shrink-0 group-hover:bg-white/5 transition-colors">
      <Icon size={24} className={colorClass} />
    </div>
    <span className="text-[10px] leading-tight text-center text-gray-400 group-hover:text-white transition-colors whitespace-normal break-words w-full">{label}</span>
  </div>
);

const RightPanel = () => {
  const navigate = useNavigate();
  const [pendingTasksCount, setPendingTasksCount] = React.useState(0);

  React.useEffect(() => {
    const fetchTaskCount = async () => {
      try {
        const response = await fetch('http://localhost:8001/tasks', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const tasks = await response.json();
          setPendingTasksCount(tasks.filter(t => !t.is_completed).length);
        }
      } catch (error) {
        console.error("Error fetching tasks count", error);
      }
    };
    fetchTaskCount();
    
    // Poll every 5 seconds to keep it updated when navigating
    const interval = setInterval(fetchTaskCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[320px] h-full py-6 px-4 flex flex-col gap-6 overflow-y-auto no-scrollbar">
      
      {/* Top icons (Notification, Settings) */}
      <div className="flex justify-end gap-3 px-2">
        <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-gray-300 hover:text-white relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-bg-dark"></span>
        </button>
        <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-gray-300 hover:text-white">
          <Settings size={18} />
        </button>
      </div>

      {/* Today's Overview */}
      <div className="glass-panel p-5 rounded-3xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-brand-purple/20 text-brand-purple">
            <Calendar size={16} />
          </div>
          <h3 className="text-sm font-medium text-white">Today's Overview</h3>
        </div>
        
        <div className="flex flex-col">
          <OverviewItem icon={CheckSquare} count={pendingTasksCount} label="Tasks pending" colorClass="text-brand-blue" />
          <div className="h-px w-full bg-glass-border my-1"></div>
          <OverviewItem icon={Calendar} count="2" label="Events scheduled" colorClass="text-green-400" />
          <div className="h-px w-full bg-glass-border my-1"></div>
          <OverviewItem icon={Bell} count="1" label="Reminder" colorClass="text-orange-400" />
        </div>

        <button className="w-full text-center text-brand-purple text-xs font-medium mt-4 hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
          View Calendar <ChevronRight size={14} />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="glass-panel p-5 rounded-3xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-brand-purple/20 text-brand-purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <h3 className="text-sm font-medium text-white">Quick Actions</h3>
        </div>
        
        <div className="flex justify-between items-center px-1">
          <QuickActionButton icon={CheckSquare} label="New Task" colorClass="text-cyan-400" onClick={() => navigate('/tasks/new')} />
          <QuickActionButton icon={Bell} label="Set Reminder" colorClass="text-brand-blue" />
          <QuickActionButton icon={Edit3} label="Add Note" colorClass="text-orange-400" />
          <QuickActionButton icon={MessageSquare} label="Start Chat" colorClass="text-brand-purple" />
        </div>
      </div>

      {/* Learning & Adapting */}
      <div className="glass-panel p-5 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-purple/20 text-brand-purple">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Learning & Adapting</h3>
            <p className="text-xs text-gray-400 mt-1">I'm getting to know you better<br/>every day.</p>
          </div>
        </div>
        
        {/* Progress Circle Placeholder */}
        <div className="relative w-12 h-12">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-glass-border stroke-current"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-brand-purple stroke-current"
              strokeDasharray="72, 100"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white">
            72%
          </div>
        </div>
      </div>

    </div>
  );
};

export default RightPanel;
