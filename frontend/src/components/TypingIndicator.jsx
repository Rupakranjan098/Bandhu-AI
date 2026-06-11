import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex w-full justify-start mb-6">
      <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center mr-3 mt-1 shrink-0 border border-brand-purple/30">
        <div className="w-2 h-2 bg-brand-purple rounded-full animate-pulse"></div>
      </div>
      
      <div className="bg-panel-dark border border-glass-border px-4 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-md">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
