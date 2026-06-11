import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8001/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Note: addTask logic moved to CreateTaskPage.jsx

  const toggleTask = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8001/tasks/${id}`);
      setTasks(tasks.map(t => t.id === id ? response.data : t));
    } catch (error) {
      console.error("Error toggling task", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:8001/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col py-10 px-8 relative overflow-hidden">
      <div className="w-full mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-semibold text-white mt-1">Tasks</h1>
          <p className="text-gray-400 mt-2 text-sm">Manage your to-do lists and reminders</p>
        </div>
        
        <button 
          onClick={() => window.location.href = '/tasks/new'} 
          className="bg-brand-blue hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Create Task
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center glass-panel rounded-3xl border border-glass-border p-8 h-full">
            <div className="w-20 h-20 rounded-full bg-brand-blue/20 flex items-center justify-center mb-6 border border-brand-blue/30">
              <CheckSquare size={32} className="text-brand-blue" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">All caught up!</h3>
            <p className="text-gray-400 max-w-sm">You don't have any pending tasks. Enjoy your day or add a new task to stay organized.</p>
            <button 
              onClick={() => window.location.href = '/tasks/new'}
              className="mt-8 px-6 py-3 bg-brand-blue hover:bg-blue-500 transition-colors rounded-xl text-white font-medium flex items-center gap-2"
            >
              Create New Task
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map(task => (
              <div key={task.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between group hover:border-brand-blue/50 transition-colors">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${task.is_completed ? 'bg-brand-blue border-brand-blue text-white' : 'border-gray-500 text-transparent hover:border-brand-blue'}`}
                  >
                    <CheckSquare size={14} />
                  </button>
                  <span className={`text-white text-sm ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </span>
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
