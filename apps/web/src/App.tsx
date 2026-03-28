import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth.store';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import TaskList from './pages/tasks/TaskList';
import ProjectList from './pages/projects/ProjectList';
import TeamManagement from './pages/team/TeamManagement';
import Settings from './pages/settings/Settings';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

const queryClient = new QueryClient();

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedLayout>
                <TaskList />
              </ProtectedLayout>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedLayout>
                <ProjectList />
              </ProtectedLayout>
            }
          />

          <Route
            path="/team"
            element={
              <ProtectedLayout>
                <TeamManagement />
              </ProtectedLayout>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            }
          />
          
          <Route
            path="*"
            element={
              <ProtectedLayout>
                <div className="flex items-center justify-center h-[calc(100vh-120px)]">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Coming Soon</h2>
                    <p className="text-slate-500">This feature is part of the next phase of development.</p>
                  </div>
                </div>
              </ProtectedLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
