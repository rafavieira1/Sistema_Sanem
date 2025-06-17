import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Beneficiarios from "./pages/Beneficiarios";
import Cadastro from "./pages/Cadastro";
import Doacoes from "./pages/Doacoes";
import Estoque from "./pages/Estoque";
import Distribuicao from "./pages/Distribuicao";
import Relatorios from "./pages/Relatorios";
import Perfil from "./pages/Perfil";
import GestaoUsuarios from "./pages/GestaoUsuarios";
import NotFound from "./pages/NotFound";
import { AppSidebar } from "./components/AppSidebar";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cadastro" element={<Index />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requiredPermission="view_dashboard">
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <Dashboard />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/beneficiarios" 
                element={
                  <ProtectedRoute requiredPermission="manage_beneficiaries">
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <Beneficiarios />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cadastro-pessoas" 
                element={
                  <ProtectedRoute requiredPermission="manage_beneficiaries">
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <Cadastro />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doacoes" 
                element={
                  <ProtectedRoute requiredPermission="manage_donations">
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <Doacoes />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/estoque" 
                element={
                  <ProtectedRoute requiredPermission="manage_stock">
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <Estoque />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/distribuicao" 
                element={
                  <ProtectedRoute requiredPermission="manage_distributions">
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <Distribuicao />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/relatorios" 
                element={
                  <ProtectedRoute requiredPermission="view_reports">
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <Relatorios />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gestao-usuarios" 
                element={
                  <ProtectedRoute requiredPermission="manage_users">
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <GestaoUsuarios />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/perfil" 
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <Perfil />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
