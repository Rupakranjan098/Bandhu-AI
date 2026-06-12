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
const Dropdown = ({ value, options, onChange }) => (
  <div className="relative group/dropdown">
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-transparent border border-glass-border px-4 py-2 pr-10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors text-sm text-gray-200 outline-none focus:border-brand-purple"
    >
      {options.map(opt => (
        <option key={opt} value={opt} className="bg-panel-dark text-white">{opt}</option>
      ))}
    </select>
    <ChevronDown size={14} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover/dropdown:text-white transition-colors" />
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
  
  // Settings State (mirrors backend model)
  const [prefs, setPrefs] = useState({
    theme: 'Dark',
    language: 'English',
    ai_response_style: 'Balanced',
    auto_suggest: true,
    sound_effects: false,
    context_awareness: true,
    proactive_assistance: true,
    daily_summary: true,
    personalization: true,
    data_usage: false
  });
  // Update backend when preference changes
  const updatePreference = async (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs); // Optimistic UI update

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('http://localhost:8001/preferences', newPrefs, config);
    } catch (err) {
      console.error("Error updating preference", err);
    }
  };

  const handleToggle = (key) => {
    updatePreference(key, !prefs[key]);
  };
  
  const handleDropdown = (key, value) => {
    updatePreference(key, value);
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
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Column */}
        <div className="w-full max-w-4xl flex flex-col gap-6">
          
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
                    control={<Dropdown value={prefs.theme} options={['Dark', 'Light', 'System']} onChange={(v) => handleDropdown('theme', v)} />}
                  />
                  <SettingRow 
                    icon={Globe} 
                    title="Language" 
                    description="Select your preferred language"
                    control={<Dropdown value={prefs.language} options={['English', 'Spanish', 'French']} onChange={(v) => handleDropdown('language', v)} />}
                  />
                  <SettingRow 
                    icon={Zap} 
                    title="AI Response Style" 
                    description="Choose how AI responds to you"
                    control={<Dropdown value={prefs.ai_response_style} options={['Balanced', 'Creative', 'Precise']} onChange={(v) => handleDropdown('ai_response_style', v)} />}
                  />
                  <SettingRow 
                    icon={Lightbulb} 
                    title="Auto-Suggest" 
                    description="Show suggestions in conversations"
                    control={<Toggle active={prefs.auto_suggest} onChange={() => handleToggle('auto_suggest')} />}
                  />
                  <SettingRow 
                    icon={Volume2} 
                    title="Sound Effects" 
                    description="Play sounds for actions and alerts"
                    control={<Toggle active={prefs.sound_effects} onChange={() => handleToggle('sound_effects')} />}
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
                    control={<Toggle active={prefs.context_awareness} onChange={() => handleToggle('context_awareness')} />}
                  />
                  <SettingRow 
                    icon={Activity} 
                    title="Proactive Assistance" 
                    description="Allow AI to proactively suggest help"
                    control={<Toggle active={prefs.proactive_assistance} onChange={() => handleToggle('proactive_assistance')} />}
                  />
                  <SettingRow 
                    icon={ClipboardList} 
                    title="Daily Summary" 
                    description="Receive daily summary of your day"
                    control={<Toggle active={prefs.daily_summary} onChange={() => handleToggle('daily_summary')} />}
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
                    control={<Toggle active={prefs.personalization} onChange={() => handleToggle('personalization')} />}
                  />
                  <SettingRow 
                    icon={BarChart2} 
                    title="Data Usage" 
                    description="Help improve Bandhu AI with usage data"
                    control={<Toggle active={prefs.data_usage} onChange={() => handleToggle('data_usage')} />}
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

      </div>

    </div>
  );
};

export default SettingsPage;
