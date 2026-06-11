import React from 'react';
import { Home, MessageSquare, CheckSquare, Calendar, FileText, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
    end={to === '/'}
    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${
      isActive 
        ? 'bg-gradient-to-r from-brand-purple/20 to-transparent border-l-2 border-brand-purple text-white' 
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
    }`}
  >
    {({ isActive }) => (
      <>
        <Icon size={20} className={isActive ? 'text-brand-purple' : ''} />
        <span className="font-medium text-sm">{label}</span>
      </>
    )}
  </NavLink>
);

const Sidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Home', icon: Home, to: '/' },
    { label: 'Conversations', icon: MessageSquare, to: '/conversations' },
    { label: 'Tasks', icon: CheckSquare, to: '/tasks' },
    { label: 'Calendar', icon: Calendar, to: '/calendar' },
    { label: 'Notes', icon: FileText, to: '/notes' },
    { label: 'Settings', icon: Settings, to: '/settings' },
  ];

  return (
    <div className="w-[260px] h-full flex flex-col justify-between py-6 px-4">
      
      {/* Top section: Logo and Nav */}
      <div className="flex flex-col gap-8">
        
        {/* Logo */}
        <div className="flex items-center gap-3 px-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <div className="w-4 h-4 bg-bg-dark rounded-full flex items-center justify-center">
               <div className="w-2 h-2 bg-brand-purple rounded-full"></div>
            </div>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">Bandhu AI</h1>
            <p className="text-xs text-brand-blue/80 font-medium">Your Personal Assistant</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.label}
              icon={item.icon} 
              label={item.label} 
              to={item.to}
            />
          ))}
        </div>

      </div>

      {/* Bottom section: User Profile */}
      <div className="flex flex-col gap-4">
        <div className="glass-panel p-4 rounded-3xl flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer border border-glass-border">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white font-bold shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.5)]">
            {user?.email ? user.email.substring(0, 2).toUpperCase() : 'TU'}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-sm font-medium text-white truncate flex items-center justify-between">
              {user?.email ? user.email.split('@')[0] : 'Test User'}
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_5px_#4ade80] animate-pulse"></div>
            </div>
            <div className="text-xs text-gray-400 truncate">{user?.email || 'test@example.com'}</div>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all py-2 text-sm font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
