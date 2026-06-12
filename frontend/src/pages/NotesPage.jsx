import React, { useState, useEffect } from 'react';
import { 
  Search, FileText, Star, Clock, Archive, Plus, 
  MoreHorizontal, Lightbulb, Users, BookOpen, Code, 
  Bold, Italic, Underline, List as ListIcon, CheckSquare, 
  Code2, Link as LinkIcon, Wand2, MessageSquare, Send, 
  FileSearch, RefreshCw, CheckCircle, Languages, ListChecks,
  ChevronLeft, LayoutGrid
} from 'lucide-react';
import axios from 'axios';

// --- Reusable Components ---

const FilterButton = ({ icon: Icon, label, count, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
      active 
        ? 'bg-brand-purple/20 text-brand-purple' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={16} />
      <span>{label}</span>
    </div>
    {count !== undefined && <span className="text-xs">{count}</span>}
  </button>
);

const TagItem = ({ color, label, count }) => (
  <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors group">
    <div className="flex items-center gap-3">
      <span className={`w-2 h-2 rounded-full ${color}`}></span>
      <span>{label}</span>
    </div>
    {count !== undefined && <span className="text-xs group-hover:text-white/70">{count}</span>}
  </button>
);

const NoteCard = ({ note, isActive, onClick }) => {
  // Determine icon and color based on tags (mock logic)
  let Icon = FileText;
  let iconBg = "bg-brand-purple/20";
  let iconColor = "text-brand-purple";
  
  const tagsList = note.tags ? note.tags.split(',').map(t => t.trim()) : [];

  if (tagsList.includes('#Product') || tagsList.includes('#Ideas')) {
    Icon = Lightbulb; iconBg = "bg-orange-500/20"; iconColor = "text-orange-500";
  } else if (tagsList.includes('#Meeting')) {
    Icon = Users; iconBg = "bg-blue-500/20"; iconColor = "text-blue-500";
  } else if (tagsList.includes('#Personal')) {
    Icon = BookOpen; iconBg = "bg-pink-500/20"; iconColor = "text-pink-500";
  } else if (tagsList.includes('#Code')) {
    Icon = Code; iconBg = "bg-yellow-500/20"; iconColor = "text-yellow-500";
  } else if (tagsList.includes('#Research')) {
    Icon = FileText; iconBg = "bg-green-500/20"; iconColor = "text-green-500";
  }

  // Formatting date
  const dateObj = new Date(note.updated_at);
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
        isActive 
          ? 'bg-panel-dark border-brand-purple/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
          : 'bg-panel-dark border-glass-border hover:border-white/20'
      }`}
    >
      <div className="flex gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          <Icon size={20} />
        </div>
        <div className="overflow-hidden">
          <h4 className="text-white font-medium text-sm truncate">{note.title}</h4>
          <p className="text-gray-500 text-[10px]">{dateStr}</p>
        </div>
      </div>
      
      {tagsList.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tagsList.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-300 border border-white/10">
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed mb-4">
        {note.content || "Empty note..."}
      </p>

      <div className="flex justify-between items-center text-gray-500">
        <button className="hover:text-yellow-400 transition-colors">
          <Star size={14} className={note.is_favorite ? "fill-yellow-400 text-yellow-400" : ""} />
        </button>
        <button className="hover:text-white transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
};

const ToolbarButton = ({ icon: Icon, active, className="" }) => (
  <button className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${className}`}>
    <Icon size={16} />
  </button>
);

const AiActionButton = ({ icon: Icon, label, colorClass }) => (
  <button className="w-full bg-panel-dark border border-glass-border hover:bg-white/5 hover:border-white/20 transition-colors rounded-xl p-3 flex items-center gap-3 group">
    <div className={`p-1.5 rounded-lg border border-white/5 bg-black/20 ${colorClass}`}>
      <Icon size={16} />
    </div>
    <span className="text-xs text-gray-300 group-hover:text-white font-medium">{label}</span>
  </button>
);


// --- Main Page Component ---

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All Notes');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // For real-time editing
  const [editingNote, setEditingNote] = useState(null);
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saved', 'Saving...', 'Unsaved'

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:8001/notes', config);
      setNotes(res.data);
      if (res.data.length > 0) {
        setSelectedNoteId(res.data[0].id);
        setEditingNote(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching notes", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const newNoteData = {
        title: "Untitled Note",
        content: "",
        tags: ""
      };
      const res = await axios.post('http://localhost:8001/notes', newNoteData, config);
      setNotes([res.data, ...notes]);
      setSelectedNoteId(res.data.id);
      setEditingNote(res.data);
    } catch (err) {
      console.error("Error creating note", err);
    }
  };

  const saveNote = async (noteToSave) => {
    setSaveStatus('Saving...');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:8001/notes/${noteToSave.id}`, noteToSave, config);
      
      // Update notes list
      setNotes(notes.map(n => n.id === noteToSave.id ? noteToSave : n));
      setSaveStatus('Saved just now');
    } catch (err) {
      console.error("Error saving note", err);
      setSaveStatus('Error saving');
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!editingNote || !selectedNoteId) return;
    
    // Check if it's different from the source of truth
    const originalNote = notes.find(n => n.id === editingNote.id);
    if (!originalNote) return;
    
    if (originalNote.title === editingNote.title && 
        originalNote.content === editingNote.content) {
      return;
    }

    setSaveStatus('Unsaved');
    
    const timeoutId = setTimeout(() => {
      saveNote(editingNote);
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [editingNote, notes]);

  const createAiNote = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const newNoteData = {
        title: "AI Generated Note ✨",
        content: "Here are some AI-generated ideas for your project:\n1. Implement semantic search for notes.\n2. Add voice-to-text capabilities.\n3. Create automated weekly summaries.",
        tags: "#AI, #Ideas"
      };
      const res = await axios.post('http://localhost:8001/notes', newNoteData, config);
      setNotes([res.data, ...notes]);
      setSelectedNoteId(res.data.id);
      setEditingNote(res.data);
    } catch (err) {
      console.error("Error creating AI note", err);
    }
  };

  const createVoiceNote = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const newNoteData = {
        title: "Voice Transcription 🎤",
        content: "This is a transcription of your voice note recorded on " + new Date().toLocaleTimeString() + ".\n\nYou mentioned that you need to review the quarterly goals, set up the database migrations, and email the team about the upcoming release.",
        tags: "#Personal"
      };
      const res = await axios.post('http://localhost:8001/notes', newNoteData, config);
      setNotes([res.data, ...notes]);
      setSelectedNoteId(res.data.id);
      setEditingNote(res.data);
    } catch (err) {
      console.error("Error creating voice note", err);
    }
  };

  const fileInputRef = React.useRef(null);
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const newNoteData = {
          title: file.name,
          content: event.target.result,
          tags: "#Imported"
        };
        const res = await axios.post('http://localhost:8001/notes', newNoteData, config);
        setNotes([res.data, ...notes]);
        setSelectedNoteId(res.data.id);
        setEditingNote(res.data);
      } catch (err) {
        console.error("Error importing file", err);
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset
  };

  const handleNoteSelect = (note) => {
    setSelectedNoteId(note.id);
    setEditingNote(note);
    setSaveStatus('Saved');
  };

  // Filter notes
  let filteredNotes = notes;
  if (activeFilter === 'Favorites') filteredNotes = notes.filter(n => n.is_favorite);
  if (activeFilter === 'Archived') filteredNotes = notes.filter(n => n.is_archived);
  
  // Calculate word count
  const wordCount = editingNote?.content ? editingNote.content.split(/\s+/).filter(w => w.length > 0).length : 0;
  const charCount = editingNote?.content ? editingNote.content.length : 0;

  return (
    <div className="flex-1 h-full flex flex-col py-6 px-8 text-white overflow-hidden">
      
      {/* Header Area */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-4xl font-semibold mb-1">Notes</h1>
          <p className="text-gray-400 text-sm">Jot down your thoughts and ideas</p>
        </div>
        <div className="flex gap-3">
          <button onClick={createNote} className="px-5 py-2.5 bg-brand-purple hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <Plus size={16} /> New Note
          </button>
          <button onClick={createAiNote} className="px-5 py-2.5 bg-panel-dark hover:bg-white/10 border border-glass-border text-gray-300 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <Wand2 size={16} className="text-brand-purple" /> AI Note
          </button>
          <button onClick={createVoiceNote} className="px-5 py-2.5 bg-panel-dark hover:bg-white/10 border border-glass-border text-gray-300 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <FileText size={16} className="text-green-400" /> Voice Note
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-panel-dark hover:bg-white/10 border border-glass-border text-gray-300 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 relative">
            <Archive size={16} /> Import File
            <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" accept=".txt,.md,.json,.csv" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Column 1: Filters & Navigation */}
        <div className="w-[240px] flex flex-col gap-6 shrink-0 overflow-y-auto no-scrollbar">
          
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              className="w-full bg-panel-dark border border-glass-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] text-gray-500 border border-gray-600 rounded px-1.5 py-0.5">⌘K</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <FilterButton icon={FileText} label="All Notes" count={notes.length} active={activeFilter === 'All Notes'} onClick={() => setActiveFilter('All Notes')} />
            <FilterButton icon={Star} label="Favorites" count={notes.filter(n=>n.is_favorite).length} active={activeFilter === 'Favorites'} onClick={() => setActiveFilter('Favorites')} />
            <FilterButton icon={Clock} label="Recent" count="8" active={activeFilter === 'Recent'} onClick={() => setActiveFilter('Recent')} />
            <FilterButton icon={Archive} label="Archived" count={notes.filter(n=>n.is_archived).length} active={activeFilter === 'Archived'} onClick={() => setActiveFilter('Archived')} />
          </div>

          <div>
            <div className="flex justify-between items-center px-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider">TAGS</h3>
              <button className="text-gray-500 hover:text-white transition-colors"><Plus size={14} /></button>
            </div>
            <div className="flex flex-col gap-1">
              <TagItem color="bg-cyan-400" label="# Work" count="8" />
              <TagItem color="bg-brand-purple" label="# Personal" count="6" />
              <TagItem color="bg-orange-500" label="# Ideas" count="4" />
              <TagItem color="bg-yellow-500" label="# AI" count="5" />
              <TagItem color="bg-red-500" label="# Meeting" count="3" />
              <TagItem color="bg-pink-500" label="# Projects" count="6" />
            </div>
          </div>
        </div>

        {/* Column 2: Note Grid */}
        <div className="flex-[1.5] bg-bg-dark rounded-3xl border border-glass-border flex flex-col min-w-0">
          {/* Grid Header */}
          <div className="px-6 py-4 border-b border-glass-border flex justify-between items-center shrink-0">
            <h2 className="font-semibold text-white">{activeFilter}</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">
                Newest first <ChevronDown size={14} />
              </div>
              <div className="p-1.5 rounded-md bg-panel-dark border border-glass-border text-gray-400 cursor-pointer hover:text-white transition-colors">
                <LayoutGrid size={16} />
              </div>
            </div>
          </div>

          {/* Grid Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            <div className="grid grid-cols-2 gap-4">
              {filteredNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  isActive={selectedNoteId === note.id}
                  onClick={() => handleNoteSelect(note)}
                />
              ))}
              {filteredNotes.length === 0 && !isLoading && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  No notes found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Rich Editor */}
        <div className="flex-[2] bg-panel-dark rounded-3xl border border-glass-border flex flex-col min-w-0 relative">
          
          {editingNote ? (
            <>
              {/* Editor Header / Toolbar */}
              <div className="px-6 py-4 border-b border-glass-border flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <h3 className="font-semibold text-sm truncate max-w-[200px]">{editingNote.title}</h3>
                </div>
                
                <div className="flex items-center gap-4">
                  <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                    <Star size={16} className={editingNote.is_favorite ? "fill-yellow-400" : ""} />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="px-6 py-3 border-b border-glass-border flex justify-between items-center bg-black/10 shrink-0">
                <div className="flex items-center gap-1">
                  <ToolbarButton icon={Bold} />
                  <ToolbarButton icon={Italic} />
                  <ToolbarButton icon={Underline} />
                  <div className="w-px h-4 bg-glass-border mx-2"></div>
                  <ToolbarButton icon={ListIcon} />
                  <ToolbarButton icon={CheckSquare} />
                  <div className="w-px h-4 bg-glass-border mx-2"></div>
                  <ToolbarButton icon={Code2} />
                  <ToolbarButton icon={LinkIcon} />
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-brand-purple/20 text-brand-purple hover:bg-brand-purple hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5">
                  <Wand2 size={12} /> AI Improve
                </button>
              </div>

              {/* Editor Content Area */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-8 flex flex-col">
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                  className="bg-transparent text-3xl font-semibold text-white mb-6 outline-none placeholder-gray-600 w-full"
                  placeholder="Note Title"
                />
                
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                  className="bg-transparent text-gray-300 leading-relaxed outline-none resize-none flex-1 w-full min-h-[200px]"
                  placeholder="Start typing..."
                />

                {/* Status Footer */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-glass-border text-[10px] text-gray-500 shrink-0">
                  <span>{saveStatus}</span>
                  <div className="flex items-center gap-3">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{charCount} characters</span>
                  </div>
                </div>

                {/* AI Assistant Section */}
                <div className="mt-8 pt-8 border-t border-glass-border shrink-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Wand2 size={16} className="text-brand-purple" />
                    <h3 className="font-semibold text-sm">AI Assistant</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <AiActionButton icon={FileSearch} label="Summarize Note" colorClass="text-brand-purple" />
                    <AiActionButton icon={RefreshCw} label="Rewrite Content" colorClass="text-brand-blue" />
                    <AiActionButton icon={CheckCircle} label="Generate Action Items" colorClass="text-green-500" />
                    <AiActionButton icon={Languages} label="Translate Note" colorClass="text-orange-500" />
                    <AiActionButton icon={ListChecks} label="Convert to Task" colorClass="text-blue-400" />
                    <AiActionButton icon={Users} label="Generate Meeting Minutes" colorClass="text-purple-400" />
                  </div>

                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ask AI anything about this note..." 
                      className="w-full bg-panel-dark border border-glass-border rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition-colors shadow-inner"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-brand-purple text-white hover:bg-purple-600 transition-colors">
                      <Send size={14} />
                    </button>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a note or create a new one to start writing.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

// Quick helper for missing chevron down since it wasn't imported at top to avoid clutter
const ChevronDown = ({ size, className }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

export default NotesPage;
