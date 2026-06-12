import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, User, Bell, Lock, Camera, Globe, Clock, Monitor, 
  Sparkles, Key, Download, Trash2, HelpCircle, ExternalLink, 
  ChevronDown, ChevronRight, PenTool, Activity, Brain
} from 'lucide-react';
import axios from 'axios';

// Reusable Dropdown Component
const Dropdown = ({ value, options, onChange }) => (
  <div className="relative group/dropdown">
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-transparent border border-glass-border px-4 py-2 pr-10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors text-sm text-gray-200 outline-none focus:border-brand-purple"
    >
      {options.map(opt => (
        <option key={opt.value || opt} value={opt.value || opt} className="bg-panel-dark text-white">
          {opt.label || opt}
        </option>
      ))}
    </select>
    <ChevronDown size={14} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover/dropdown:text-white transition-colors" />
  </div>
);

// Reusable Toggle Component
const Toggle = ({ active, onChange }) => (
  <div 
    onClick={onChange}
    className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${active ? 'bg-brand-purple' : 'bg-white/10'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
  </div>
);

// Reusable Setting Row Component
const SettingRow = ({ icon: Icon, title, description, control, isActive }) => (
  <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] px-4 -mx-4 rounded-xl transition-colors">
    <div className="flex items-start gap-4">
      <div className={`mt-1 transition-colors ${isActive ? 'text-brand-purple' : 'text-gray-400 group-hover:text-brand-purple'}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="pl-4">
      {control}
    </div>
  </div>
);

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Account');
  const [prefs, setPrefs] = useState({
    theme: 'Dark',
    language: 'English',
    ai_response_style: 'Balanced',
    timezone: '(GMT+5:30) Asia/Kolkata', // mock default
    auto_suggest: true,
    sound_effects: false,
    context_awareness: true,
    proactive_assistance: true,
    daily_summary: true,
    personalization: true,
    data_usage: false,
    two_factor_auth: false,
    login_alerts: true,
    share_analytics: false,
    allow_ai_training: false,
  });

  const [showSessions, setShowSessions] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(true);
  const [user, setUser] = useState({ full_name: '', email: '', created_at: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://localhost:8001/auth/me', config);
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user", err);
      }
    };
    fetchUser();
    const fetchPrefs = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://localhost:8001/preferences', config);
        setPrefs(response.data);
      } catch (err) {
        console.error("Error fetching preferences", err);
      }
    };
    fetchPrefs();
  }, []);

  const updatePreference = async (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs); 
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('http://localhost:8001/preferences', newPrefs, config);
    } catch (err) {
      console.error("Error updating preference", err);
    }
  };

  const handleDropdown = (key, value) => {
    updatePreference(key, value);
  };

  const handleToggle = (key) => {
    updatePreference(key, !prefs[key]);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put('http://localhost:8001/auth/me', { full_name: editName }, config);
      setUser(response.data);
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      const response = await axios.post('http://localhost:8001/auth/me/avatar', formData, config);
      setUser(response.data);
    } catch (err) {
      console.error("Error uploading avatar", err);
    }
  };

  const tabs = [
    { id: 'Preferences', icon: Settings },
    { id: 'Account', icon: User },
    { id: 'Notifications', icon: Bell },
    { id: 'Privacy & Security', icon: Lock }
  ];

  return (
    <div className="flex-1 h-full flex py-8 px-8 gap-6 overflow-hidden">
      
      {/* Main Settings Area */}
      <div className="flex-[2.5] flex flex-col min-w-0 h-full overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-semibold text-white mt-1">Settings</h1>
          <p className="text-gray-400 mt-2 text-sm">Configure your AI assistant preferences</p>
        </div>

        {/* Tab Bar */}
        <div className="glass-panel p-2 rounded-2xl border border-glass-border flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                  isActive 
                    ? 'bg-white/10 text-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-brand-purple/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={16} />
                {tab.id}
              </button>
            );
          })}
        </div>

        {activeTab === 'Account' && (
          <div className="flex flex-col gap-6">
            
            {/* Account Information */}
            <div className="glass-panel p-6 rounded-3xl border border-glass-border relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">Account Information</h2>
                  <p className="text-xs text-gray-500">Manage your personal information and account details.</p>
                </div>
                <button 
                  onClick={() => { setEditName(user.full_name || ''); setIsEditingProfile(true); }}
                  className="px-4 py-2 border border-brand-purple/50 text-brand-purple hover:bg-brand-purple/10 transition-colors text-sm font-medium rounded-xl flex items-center gap-2"
                >
                  <PenTool size={14} />
                  Edit Profile
                </button>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center gap-8">
                {/* Avatar with glow */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <div className="w-24 h-24 rounded-full bg-brand-purple flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-transform duration-300 group-hover:scale-105 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'TE'
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-panel-dark border border-white/10 rounded-full flex items-center justify-center text-gray-400 group-hover:text-brand-purple transition-colors">
                    <Camera size={14} />
                  </div>
                </div>
                
                {/* Info Grid */}
                <div className="flex-1 grid grid-cols-2 gap-y-6">
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-sm font-medium text-white">{user.full_name || 'test'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Member Since</p>
                    <p className="text-sm font-medium text-white">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'May 24, 2025'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-sm font-medium text-white">{user.email || 'test@example.com'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Account Status</p>
                    <div className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                      Active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Preferences */}
            <div className="glass-panel p-6 rounded-3xl border border-glass-border">
              <h2 className="text-lg font-semibold text-white mb-1">Account Preferences</h2>
              <p className="text-xs text-gray-500 mb-6">Customize your account settings and preferences.</p>
              
              <div className="flex flex-col bg-[#131620]/50 p-2 rounded-2xl border border-white/5">
                <SettingRow 
                  icon={Globe} 
                  title="Language" 
                  description="Choose your preferred language"
                  control={<Dropdown value={prefs.language} options={['English', 'Spanish', 'French']} onChange={(v) => handleDropdown('language', v)} />}
                />
                <SettingRow 
                  icon={Clock} 
                  title="Time Zone" 
                  description="Set your local time zone"
                  control={<Dropdown value={prefs.timezone || '(GMT+5:30) Asia/Kolkata'} options={['(GMT+5:30) Asia/Kolkata', '(GMT) London', '(EST) New York']} onChange={(v) => handleDropdown('timezone', v)} />}
                />
                <SettingRow 
                  icon={Monitor} 
                  title="Theme" 
                  description="Choose your preferred theme"
                  control={<Dropdown value={prefs.theme} options={['Dark', 'Light', 'System']} onChange={(v) => handleDropdown('theme', v)} />}
                />
                <SettingRow 
                  icon={Sparkles} 
                  title="AI Response Style" 
                  description="Set how Bandhu AI responds to you"
                  control={<Dropdown value={prefs.ai_response_style} options={['Balanced', 'Creative', 'Precise']} onChange={(v) => handleDropdown('ai_response_style', v)} />}
                />
              </div>
            </div>

            {/* Connected Accounts */}
            <div className="glass-panel p-6 rounded-3xl border border-glass-border mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">Connected Accounts</h2>
                  <p className="text-xs text-gray-500">Manage your connected third-party accounts.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-brand-purple/50 rounded-lg text-brand-purple text-sm font-medium hover:bg-brand-purple/10 transition-colors">
                  Manage Connections
                </button>
              </div>

              <div className="bg-[#131620]/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <span className="font-bold text-lg text-blue-500">G</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white mb-0.5">Google</div>
                    <div className={`text-xs font-medium ${isGoogleConnected ? 'text-green-500' : 'text-gray-500'}`}>
                      {isGoogleConnected ? 'Connected' : 'Not Connected'}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (isGoogleConnected) {
                      if(window.confirm('Are you sure you want to disconnect your Google account?')) {
                        setIsGoogleConnected(false);
                      }
                    } else {
                      setIsGoogleConnected(true);
                    }
                  }}
                  className={`px-4 py-2 border transition-colors text-xs font-medium rounded-lg ${
                    isGoogleConnected 
                    ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                    : 'border-brand-purple/50 text-brand-purple hover:bg-brand-purple/10'
                  }`}
                >
                  {isGoogleConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Preferences' && (
          <div className="flex flex-col gap-6">
            
            {/* General Preferences Section */}
            <div className="glass-panel p-6 rounded-3xl border border-glass-border">
              <h2 className="text-lg font-semibold text-white mb-1">General Preferences</h2>
              <p className="text-xs text-gray-500 mb-6">Customize how Bandhu AI works for you.</p>
              
              <div className="flex flex-col bg-[#131620]/50 p-2 rounded-2xl border border-white/5">
                <SettingRow 
                  icon={Monitor} 
                  title="Theme" 
                  description="Choose your preferred appearance"
                  control={<Dropdown value={prefs.theme} options={['Dark', 'Dark Night', 'Light', 'System']} onChange={(v) => handleDropdown('theme', v)} />}
                />
                <SettingRow 
                  icon={Globe} 
                  title="Language" 
                  description="Select your preferred language"
                  control={<Dropdown value={prefs.language} options={['English', 'Spanish', 'French']} onChange={(v) => handleDropdown('language', v)} />}
                />
                <SettingRow 
                  icon={Sparkles} 
                  title="AI Response Style" 
                  description="Choose how AI responds to you"
                  control={<Dropdown value={prefs.ai_response_style} options={['Balanced', 'Creative', 'Precise']} onChange={(v) => handleDropdown('ai_response_style', v)} />}
                />
                <SettingRow 
                  icon={Bell} 
                  title="Auto-Suggest" 
                  description="Show suggestions in conversations"
                  control={<Toggle active={prefs.auto_suggest} onChange={() => handleToggle('auto_suggest')} />}
                  isActive={prefs.auto_suggest}
                />
                <SettingRow 
                  icon={Bell} 
                  title="Sound Effects" 
                  description="Play sounds for actions and alerts"
                  control={<Toggle active={prefs.sound_effects} onChange={() => handleToggle('sound_effects')} />}
                  isActive={prefs.sound_effects}
                />
              </div>
            </div>

            {/* Assistant Behavior Section */}
            <div className="glass-panel p-6 rounded-3xl border border-glass-border">
              <h2 className="text-lg font-semibold text-white mb-1">Assistant Behavior</h2>
              <p className="text-xs text-gray-500 mb-6">Control how Bandhu AI assists you.</p>
              
              <div className="flex flex-col bg-[#131620]/50 p-2 rounded-2xl border border-white/5">
                <SettingRow 
                  icon={Sparkles} 
                  title="Context Awareness" 
                  description="Allow AI to remember your context"
                  control={<Toggle active={prefs.context_awareness} onChange={() => handleToggle('context_awareness')} />}
                  isActive={prefs.context_awareness}
                />
                <SettingRow 
                  icon={Settings} 
                  title="Proactive Assistance" 
                  description="Allow AI to proactively suggest help"
                  control={<Toggle active={prefs.proactive_assistance} onChange={() => handleToggle('proactive_assistance')} />}
                  isActive={prefs.proactive_assistance}
                />
                <SettingRow 
                  icon={Bell} 
                  title="Daily Summary" 
                  description="Receive daily summary of your day"
                  control={<Toggle active={prefs.daily_summary} onChange={() => handleToggle('daily_summary')} />}
                  isActive={prefs.daily_summary}
                />
              </div>
            </div>

            {/* Data & Personalization Section */}
            <div className="glass-panel p-6 rounded-3xl border border-glass-border mb-8">
              <h2 className="text-lg font-semibold text-white mb-1">Data & Personalization</h2>
              <p className="text-xs text-gray-500 mb-6">Manage your data and personalization settings.</p>
              
              <div className="flex flex-col bg-[#131620]/50 p-2 rounded-2xl border border-white/5">
                <SettingRow 
                  icon={User} 
                  title="Personalization" 
                  description="Allow AI to personalize your experience"
                  control={<Toggle active={prefs.personalization} onChange={() => handleToggle('personalization')} />}
                  isActive={prefs.personalization}
                />
                <SettingRow 
                  icon={Settings} 
                  title="Data Usage" 
                  description="Help improve Bandhu AI with usage data"
                  control={<Toggle active={prefs.data_usage} onChange={() => handleToggle('data_usage')} />}
                  isActive={prefs.data_usage}
                />
                <SettingRow 
                  icon={Trash2} 
                  title="Clear Conversation History" 
                  description="Delete all your past conversations"
                  control={
                    <button className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-medium rounded-lg">
                      Clear History
                    </button>
                  }
                />
              </div>
            </div>

          </div>
        )}

        {activeTab === 'Privacy & Security' && (
          <div className="flex flex-col gap-6">
            
            {/* Security Settings Section */}
            <div className="glass-panel p-6 rounded-3xl border border-glass-border">
              <h2 className="text-lg font-semibold text-white mb-1">Security Settings</h2>
              <p className="text-xs text-gray-500 mb-6">Manage your account security and authentication methods.</p>
              
              <div className="flex flex-col bg-[#131620]/50 p-2 rounded-2xl border border-white/5">
                <SettingRow 
                  icon={Lock} 
                  title="Two-Factor Authentication" 
                  description="Add an extra layer of security to your account"
                  control={<Toggle active={prefs.two_factor_auth} onChange={() => handleToggle('two_factor_auth')} />}
                  isActive={prefs.two_factor_auth}
                />
                <SettingRow 
                  icon={Bell} 
                  title="Login Alerts" 
                  description="Get notified of logins from new devices"
                  control={<Toggle active={prefs.login_alerts} onChange={() => handleToggle('login_alerts')} />}
                  isActive={prefs.login_alerts}
                />
              </div>
            </div>

            {/* Data Privacy Section */}
            <div className="glass-panel p-6 rounded-3xl border border-glass-border">
              <h2 className="text-lg font-semibold text-white mb-1">Data Privacy</h2>
              <p className="text-xs text-gray-500 mb-6">Control how your data is used and shared.</p>
              
              <div className="flex flex-col bg-[#131620]/50 p-2 rounded-2xl border border-white/5">
                <SettingRow 
                  icon={Activity} 
                  title="Share Analytics" 
                  description="Share anonymous usage data to help us improve"
                  control={<Toggle active={prefs.share_analytics} onChange={() => handleToggle('share_analytics')} />}
                  isActive={prefs.share_analytics}
                />
                <SettingRow 
                  icon={Brain} 
                  title="AI Training" 
                  description="Allow your data to be used to train our AI models"
                  control={<Toggle active={prefs.allow_ai_training} onChange={() => handleToggle('allow_ai_training')} />}
                  isActive={prefs.allow_ai_training}
                />
              </div>
            </div>

            {/* Session Management Section */}
            <div className="glass-panel p-6 rounded-3xl border border-glass-border mb-8">
              <h2 className="text-lg font-semibold text-white mb-1">Session Management</h2>
              <p className="text-xs text-gray-500 mb-6">Manage your active sessions across devices.</p>
              
              <div className="flex flex-col bg-[#131620]/50 p-2 rounded-2xl border border-white/5">
                <SettingRow 
                  icon={User} 
                  title="Active Sessions" 
                  description={`You are currently logged in on ${showSessions ? 'these' : '2'} devices`}
                  isActive={showSessions}
                  control={
                    <button 
                      onClick={() => setShowSessions(!showSessions)}
                      className="px-4 py-2 border border-brand-purple/50 text-brand-purple hover:bg-brand-purple/10 transition-colors text-xs font-medium rounded-lg"
                    >
                      {showSessions ? 'Hide Sessions' : 'View Sessions'}
                    </button>
                  }
                />
                
                {showSessions && (
                  <div className="px-4 pb-4 animate-fade-in flex flex-col gap-3 mt-2">
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Monitor size={16} className="text-green-400" />
                        <div>
                          <p className="text-sm text-white font-medium">MacBook Pro (Mac OS)</p>
                          <p className="text-xs text-gray-400">Chrome • San Francisco, CA • Current Session</p>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></div>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Monitor size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-white font-medium">iPhone 14 Pro (iOS)</p>
                          <p className="text-xs text-gray-400">Safari • San Francisco, CA • Active 2h ago</p>
                        </div>
                      </div>
                      <button className="text-xs text-red-400 hover:text-red-300 font-medium">Revoke</button>
                    </div>
                  </div>
                )}

                <SettingRow 
                  icon={Lock} 
                  title="Log out of all devices" 
                  description="Log out of all devices except this one"
                  control={
                    <button 
                      onClick={() => {
                        if(window.confirm('Are you sure you want to log out of all other devices?')) {
                          alert('Successfully logged out of all other devices.');
                        }
                      }}
                      className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-medium rounded-lg"
                    >
                      Log Out All
                    </button>
                  }
                />
              </div>
            </div>

          </div>
        )}

        {activeTab !== 'Account' && activeTab !== 'Preferences' && activeTab !== 'Privacy & Security' && (
          <div className="glass-panel p-12 rounded-3xl border border-glass-border flex flex-col items-center justify-center text-center opacity-70 mt-10">
            <Settings size={48} className="text-gray-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">{activeTab} settings</h3>
            <p className="text-sm text-gray-400 max-w-sm">This section is coming soon.</p>
          </div>
        )}

        {isEditingProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl border border-glass-border w-full max-w-sm">
              <h2 className="text-lg font-semibold text-white mb-4">Edit Profile</h2>
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-400 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple focus:bg-white/10 transition-all"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 px-4 py-2.5 border border-white/10 text-white hover:bg-white/5 transition-colors rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="flex-1 px-4 py-2.5 bg-brand-purple text-white hover:bg-purple-500 transition-colors rounded-xl text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Custom Settings Right Panel */}
      <div className="w-[320px] shrink-0 h-full overflow-y-auto no-scrollbar flex flex-col gap-6">
        
        {/* Account Summary */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border flex flex-col gap-6">
          <h2 className="text-white font-semibold mb-2">Account Summary</h2>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-purple flex items-center justify-center text-xl font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              TE
            </div>
            <div>
              <div className="text-white font-semibold">test</div>
              <div className="text-xs text-gray-400">test@example.com</div>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Plan</span>
            <span className="text-white font-medium">Free Plan</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white font-medium">Messages Used</span>
              <span className="text-gray-400 text-[10px]">12 / 100 per day</span>
              <span className="text-white font-medium">12%</span>
            </div>
            <div className="w-full h-2 bg-[#131620] rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-brand-blue rounded-full w-[12%] shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            </div>
          </div>

          <button className="w-full bg-brand-purple hover:bg-purple-600 transition-colors text-white py-3 rounded-xl font-medium shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2">
            <Sparkles size={16} /> Upgrade Plan
          </button>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border flex flex-col gap-5">
          <h2 className="text-white font-semibold">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="text-yellow-500">
                  <Key size={18} />
                </div>
                <div>
                  <div className="text-sm font-medium text-white mb-0.5">Change Password</div>
                  <div className="text-xs text-gray-500">Update your password</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="text-cyan-400">
                  <Download size={18} />
                </div>
                <div>
                  <div className="text-sm font-medium text-white mb-0.5">Download My Data</div>
                  <div className="text-xs text-gray-500">Export your data</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="text-red-400">
                  <Trash2 size={18} />
                </div>
                <div>
                  <div className="text-sm font-medium text-red-400 mb-0.5">Delete Account</div>
                  <div className="text-xs text-gray-500">Permanently delete account</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
            </div>

          </div>
        </div>

        {/* Need Help? */}
        <div className="glass-panel p-6 rounded-3xl border border-glass-border flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-brand-blue/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="flex items-center gap-2 text-white font-semibold relative z-10">
            <div className="w-6 h-6 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue">
              <HelpCircle size={14} />
            </div>
            Need Help?
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed relative z-10">
            If you need assistance, check our help center or contact support.
          </p>
          <button className="w-full mt-2 py-2.5 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl text-xs font-medium text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2 relative z-10">
            Visit Help Center <ExternalLink size={12} />
          </button>
        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
