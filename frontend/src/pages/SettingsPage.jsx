import React, { useState, useEffect } from 'react';
import { 
  Settings, User, Bell, Lock, Palette, Globe, Zap, Lightbulb, 
  Volume2, Brain, Activity, ClipboardList, Eye, BarChart2, 
  Trash2, Calendar as CalendarIcon, CheckSquare, ChevronRight, 
  PenTool, MessageSquare, ChevronDown 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isToday } from 'date-fns';

// Reusable Toggle Component
const Toggle = ({ active, onChange }) => (
  <div 
    onClick={onChange}
    className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${active ? 'bg-brand-purple' : 'bg-gray-600'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
  </div>
);

// Reusable Dropdown Component
const Dropdown = ({ value, options }) => (
  <div className="relative">
    <div className="flex items-center gap-2 bg-transparent border border-glass-border px-4 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
      <span className="text-sm text-gray-200">{value}</span>
      <ChevronDown size={14} className="text-gray-400" />
    </div>
  </div>
);

// Reusable Setting Row Component
const SettingRow = ({ icon: Icon, title, description, control }) => (
  <div className="flex items-center justify-between py-4 border-b border-glass-border last:border-0 group hover:bg-white/[0.02] px-4 -mx-4 rounded-xl transition-colors">
    <div className="flex items-start gap-4">
      <div className="mt-1 text-brand-purple">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="pl-4">
      {control}
    </div>
  </div>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Preferences');
  
  // Data State
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  
  // Settings State
  const [toggles, setToggles] = useState({
    autoSuggest: true,
    soundEffects: false,
    contextAwareness: true,
    proactiveAssistance: true,
    dailySummary: true,
    personalization: true,
    dataUsage: false
  });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'Preferences', icon: Settings },
    { id: 'Account', icon: User },
    { id: 'Notifications', icon: Bell },
    { id: 'Privacy & Security', icon: Lock }
  ];

  // Fetch Live Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [tasksRes, eventsRes] = await Promise.all([
          axios.get('http://localhost:8001/tasks', config),
          axios.get('http://localhost:8001/events', config)
        ]);
        setTasks(tasksRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error("Error fetching data for settings sidebar", err);
      }
    };
    fetchData();
  }, []);

  // Calculate Metrics
  const pendingTasks = tasks.filter(t => t.is_completed === 0);
  const completedTasks = tasks.filter(t => t.is_completed === 1);
  const todayEvents = events.filter(e => isToday(new Date(e.date)));
  const productivityScore = tasks.length === 0 ? 100 : Math.round((completedTasks.length / tasks.length) * 100);

  return (
    <div className="flex-1 h-full flex flex-col py-8 px-8 overflow-y-auto no-scrollbar relative text-white">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-semibold mb-1">Settings</h1>
          <p className="text-gray-400 text-sm">Configure your AI assistant preferences</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
            <Bell size={18} />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>
          <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Column */}
        <div className="flex-[3] flex flex-col gap-6 max-w-4xl">
          
          {/* Tabs */}
          <div className="glass-panel p-2 rounded-2xl border border-glass-border flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-white/10 text-brand-purple shadow-sm' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {tab.id}
                </button>
              );
            })}
          </div>

          {activeTab === 'Preferences' && (
            <div className="flex flex-col gap-6">
              
              {/* General Preferences Section */}
              <div className="glass-panel p-6 rounded-3xl border border-glass-border">
                <h3 className="text-lg font-medium mb-1">General Preferences</h3>
                <p className="text-xs text-gray-400 mb-6">Customize how Bandhu AI works for you.</p>
                
                <div className="flex flex-col">
                  <SettingRow 
                    icon={Palette} 
                    title="Theme" 
                    description="Choose your preferred appearance"
                    control={<Dropdown value="Dark" options={['Dark', 'Light', 'System']} />}
                  />
                  <SettingRow 
                    icon={Globe} 
                    title="Language" 
                    description="Select your preferred language"
                    control={<Dropdown value="English" options={['English', 'Spanish', 'French']} />}
                  />
                  <SettingRow 
                    icon={Zap} 
                    title="AI Response Style" 
                    description="Choose how AI responds to you"
                    control={<Dropdown value="Balanced" options={['Balanced', 'Creative', 'Precise']} />}
                  />
                  <SettingRow 
                    icon={Lightbulb} 
                    title="Auto-Suggest" 
                    description="Show suggestions in conversations"
                    control={<Toggle active={toggles.autoSuggest} onChange={() => handleToggle('autoSuggest')} />}
                  />
                  <SettingRow 
                    icon={Volume2} 
                    title="Sound Effects" 
                    description="Play sounds for actions and alerts"
                    control={<Toggle active={toggles.soundEffects} onChange={() => handleToggle('soundEffects')} />}
                  />
                </div>
              </div>

              {/* Assistant Behavior Section */}
              <div className="glass-panel p-6 rounded-3xl border border-glass-border">
                <h3 className="text-lg font-medium mb-1">Assistant Behavior</h3>
                <p className="text-xs text-gray-400 mb-6">Control how Bandhu AI assists you.</p>
                
                <div className="flex flex-col">
                  <SettingRow 
                    icon={Brain} 
                    title="Context Awareness" 
                    description="Allow AI to remember your context"
                    control={<Toggle active={toggles.contextAwareness} onChange={() => handleToggle('contextAwareness')} />}
                  />
                  <SettingRow 
                    icon={Activity} 
                    title="Proactive Assistance" 
                    description="Allow AI to proactively suggest help"
                    control={<Toggle active={toggles.proactiveAssistance} onChange={() => handleToggle('proactiveAssistance')} />}
                  />
                  <SettingRow 
                    icon={ClipboardList} 
                    title="Daily Summary" 
                    description="Receive daily summary of your day"
                    control={<Toggle active={toggles.dailySummary} onChange={() => handleToggle('dailySummary')} />}
                  />
                </div>
              </div>

              {/* Data & Personalization Section */}
              <div className="glass-panel p-6 rounded-3xl border border-glass-border">
                <h3 className="text-lg font-medium mb-1">Data & Personalization</h3>
                <p className="text-xs text-gray-400 mb-6">Manage your data and personalization settings.</p>
                
                <div className="flex flex-col">
                  <SettingRow 
                    icon={User} 
                    title="Personalization" 
                    description="Allow AI to personalize your experience"
                    control={<Toggle active={toggles.personalization} onChange={() => handleToggle('personalization')} />}
                  />
                  <SettingRow 
                    icon={BarChart2} 
                    title="Data Usage" 
                    description="Help improve Bandhu AI with usage data"
                    control={<Toggle active={toggles.dataUsage} onChange={() => handleToggle('dataUsage')} />}
                  />
                  <SettingRow 
                    icon={Trash2} 
                    title="Clear Conversation History" 
                    description="Delete all your past conversations"
                    control={
                      <button className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 text-xs hover:bg-red-500/10 transition-colors">
                        Clear History
                      </button>
                    }
                  />
                </div>
              </div>

            </div>
          )}

          {activeTab !== 'Preferences' && (
            <div className="glass-panel p-12 rounded-3xl border border-glass-border flex flex-col items-center justify-center text-center opacity-70">
              <Settings size={48} className="text-gray-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">{activeTab} settings coming soon</h3>
              <p className="text-sm text-gray-400 max-w-sm">This section is currently under development.</p>
            </div>
          )}

        </div>

        {/* Right Sidebar (Dynamic Data) */}
        <div className="flex-[1] flex flex-col gap-6 max-w-[320px]">
          
          {/* Today's Overview */}
          <div className="glass-panel p-5 rounded-3xl border border-glass-border">
            <h3 className="font-medium text-sm mb-4 flex items-center gap-2"><CalendarIcon size={16} className="text-brand-purple"/> Today's Overview</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/20 text-brand-blue flex items-center justify-center"><CheckSquare size={14}/></div>
                  <div>
                    <p className="text-sm font-semibold">{pendingTasks.length}</p>
                    <p className="text-[10px] text-gray-400">Tasks pending</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <div className="h-[1px] w-full bg-white/5"></div>
              <div className="flex justify-between items-center group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center"><CalendarIcon size={14}/></div>
                  <div>
                    <p className="text-sm font-semibold">{todayEvents.length}</p>
                    <p className="text-[10px] text-gray-400">Events scheduled</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <div className="h-[1px] w-full bg-white/5"></div>
              <div className="flex justify-between items-center group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center"><Bell size={14}/></div>
                  <div>
                    <p className="text-sm font-semibold">0</p>
                    <p className="text-[10px] text-gray-400">Reminders</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
              </div>
            </div>
            <button onClick={() => navigate('/calendar')} className="mt-6 w-full text-xs text-brand-purple hover:underline flex items-center justify-center gap-1">
              View Calendar <ChevronRight size={12} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="glass-panel p-5 rounded-3xl border border-glass-border">
            <h3 className="font-medium text-sm mb-4 flex items-center gap-2"><Zap size={16} className="text-brand-purple"/> Quick Actions</h3>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => navigate('/tasks/new')} className="flex flex-col items-center gap-2 text-gray-400 hover:text-brand-blue group">
                <div className="w-12 h-12 rounded-full border border-white/10 group-hover:border-brand-blue/50 flex items-center justify-center transition-colors">
                  <CheckSquare size={16} />
                </div>
                <span className="text-[10px] text-center">New Task</span>
              </button>
              <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-orange-400 group">
                <div className="w-12 h-12 rounded-full border border-white/10 group-hover:border-orange-400/50 flex items-center justify-center transition-colors">
                  <Bell size={16} />
                </div>
                <span className="text-[10px] text-center">Set Reminder</span>
              </button>
              <button onClick={() => navigate('/notes')} className="flex flex-col items-center gap-2 text-gray-400 hover:text-green-400 group">
                <div className="w-12 h-12 rounded-full border border-white/10 group-hover:border-green-400/50 flex items-center justify-center transition-colors">
                  <PenTool size={16} />
                </div>
                <span className="text-[10px] text-center">Add Note</span>
              </button>
              <button onClick={() => navigate('/')} className="flex flex-col items-center gap-2 text-gray-400 hover:text-brand-purple group">
                <div className="w-12 h-12 rounded-full border border-white/10 group-hover:border-brand-purple/50 flex items-center justify-center transition-colors">
                  <MessageSquare size={16} />
                </div>
                <span className="text-[10px] text-center">Start Chat</span>
              </button>
            </div>
          </div>

          {/* Learning & Adapting */}
          <div className="glass-panel p-5 rounded-3xl border border-glass-border flex items-center justify-between bg-gradient-to-br from-panel-dark to-brand-purple/10">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-purple/20 text-brand-purple flex items-center justify-center shrink-0">
                <Brain size={16} />
              </div>
              <div>
                <h3 className="font-medium text-xs mb-1">Learning & Adapting</h3>
                <p className="text-[10px] text-gray-400 leading-tight">I'm getting to know you better every day.</p>
                <button className="text-[10px] text-brand-purple mt-2 hover:underline">View Insights &gt;</button>
              </div>
            </div>
            {/* Dynamic Circular Progress */}
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-brand-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" strokeDasharray={`${productivityScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{productivityScore}%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
