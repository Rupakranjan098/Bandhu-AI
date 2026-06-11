import React from 'react';
import { FileText } from 'lucide-react';

const NotesPage = () => {
  return (
    <div className="flex-1 h-full flex flex-col py-10 px-8 relative overflow-hidden">
      <div className="w-full mb-8">
        <h1 className="text-4xl font-semibold text-white mt-1">Notes</h1>
        <p className="text-gray-400 mt-2 text-sm">Jot down your thoughts and ideas</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center glass-panel rounded-3xl border border-glass-border p-8">
        <div className="w-20 h-20 rounded-full bg-orange-400/20 flex items-center justify-center mb-6 border border-orange-400/30">
          <FileText size={32} className="text-orange-400" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No notes yet</h3>
        <p className="text-gray-400 max-w-sm">Capture ideas, create documents, and store important information here.</p>
        
        <button className="mt-8 px-6 py-3 bg-orange-500 hover:bg-orange-600 transition-colors rounded-xl text-white font-medium flex items-center gap-2">
          Create Note
        </button>
      </div>
    </div>
  );
};

export default NotesPage;
