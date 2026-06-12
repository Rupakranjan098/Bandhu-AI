import React, { useState } from 'react';
import { ArrowLeft, Calendar, Flag, Tag, Bell, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium',
    category: '',
    reminder: '',
    is_important: false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8001/tasks', {
        ...formData,
        is_important: formData.is_important ? 1 : 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/tasks'); // redirect back to tasks list
    } catch (error) {
      console.error('Error creating task', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col py-8 px-8 relative overflow-y-auto no-scrollbar">
      
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/tasks')}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-white mb-6 transition-all hover:bg-white/5"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-4xl font-semibold text-white">Create New Task</h1>
        <p className="text-gray-400 mt-2 text-sm">Add a new task to stay organized and productive</p>
      </div>

      {/* Form Container */}
      <div className="glass-panel rounded-3xl p-8 border border-glass-border w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300 flex items-center">
              Task Title <span className="text-red-400 ml-1">*</span>
            </label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Complete project proposal"
              className="w-full bg-panel-dark border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-blue transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea 
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more details about this task..."
              className="w-full bg-panel-dark border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-blue transition-colors resize-none"
            />
          </div>

          {/* Grid for 4 fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Due Date */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Due Date</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-500 group-focus-within:text-brand-blue" />
                </div>
                <input 
                  type="date" 
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full bg-panel-dark border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue transition-colors appearance-none"
                />
              </div>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Priority</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Flag size={18} className="text-gray-500 group-focus-within:text-brand-blue" />
                </div>
                <select 
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-panel-dark border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue transition-colors appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Category</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Tag size={18} className="text-gray-500 group-focus-within:text-brand-blue" />
                </div>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-panel-dark border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue transition-colors appearance-none"
                >
                  <option value="">Select category</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Shopping">Shopping</option>
                </select>
              </div>
            </div>

            {/* Reminder */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Reminder</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Bell size={18} className="text-gray-500 group-focus-within:text-brand-blue" />
                </div>
                <input 
                  type="text"
                  name="reminder"
                  placeholder="Add reminder (optional)"
                  value={formData.reminder}
                  onChange={handleChange}
                  className="w-full bg-panel-dark border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue transition-colors"
                />
              </div>
            </div>

          </div>

          {/* Mark as important */}
          <div className="flex items-center gap-3 mt-2">
            <input 
              type="checkbox" 
              name="is_important"
              id="is_important"
              checked={formData.is_important}
              onChange={handleChange}
              className="w-5 h-5 rounded border-glass-border bg-panel-dark checked:bg-brand-blue checked:border-brand-blue focus:ring-brand-blue focus:ring-offset-bg-dark transition-colors"
            />
            <label htmlFor="is_important" className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer">
              <Star size={16} className={formData.is_important ? "text-yellow-400 fill-yellow-400" : "text-gray-500"} />
              Mark as important
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button 
              type="button"
              onClick={() => navigate('/tasks')}
              className="px-6 py-3 rounded-xl border border-glass-border text-gray-300 hover:text-white hover:bg-white/5 transition-all font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading || !formData.title}
              className="px-6 py-3 rounded-xl bg-brand-blue text-white hover:bg-blue-500 transition-all font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default CreateTaskPage;
