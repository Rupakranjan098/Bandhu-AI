import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import CenterContent from './components/CenterContent';
import ConversationsPage from './pages/ConversationsPage';
import TasksPage from './pages/TasksPage';
import CreateTaskPage from './pages/CreateTaskPage';
import CalendarPage from './pages/CalendarPage';
import NotesPage from './pages/NotesPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CenterContent />} />
            <Route path="conversations" element={<ConversationsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/new" element={<CreateTaskPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
