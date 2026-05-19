import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Chantiers from "./pages/Chantiers";
import ChantierDetail from "./pages/ChantierDetail";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Documents from "./pages/Documents";
import Notifications from "./pages/Notifications";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>;
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/chantiers" element={<PrivateRoute><Chantiers /></PrivateRoute>} />
        <Route path="/chantier/:id" element={<PrivateRoute><ChantierDetail /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/clients/:clientName" element={<PrivateRoute><ClientDetail /></PrivateRoute>} />
        <Route path="/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
