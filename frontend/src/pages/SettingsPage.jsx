import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="flex-1 h-full flex flex-col py-10 px-8 relative overflow-hidden">
      <div className="w-full mb-8">
        <h1 className="text-4xl font-semibold text-white mt-1">Settings</h1>
        <p className="text-gray-400 mt-2 text-sm">Configure your AI assistant preferences</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center glass-panel rounded-3xl border border-glass-border p-8">
        <div className="w-20 h-20 rounded-full bg-gray-500/20 flex items-center justify-center mb-6 border border-gray-500/30">
          <SettingsIcon size={32} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Preferences</h3>
        <p className="text-gray-400 max-w-sm">Settings and configuration options will appear here.</p>
      </div>
    </div>
  );
};

export default SettingsPage;
