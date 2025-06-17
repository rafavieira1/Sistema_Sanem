import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Users, Package, TrendingUp, Shield } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GridBackground } from "@/components/ui/grid-background";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema SANEM",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Acesso Negado",
          description: "Apenas o Super Administrador pode acessar o sistema",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GridBackground className="min-h-screen relative">
      {/* Header com toggle de tema */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-6xl shadow-xl border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            
            {/* Lado esquerdo - Branding e informações */}
            <div className="p-8 lg:p-12 flex flex-col justify-center items-center text-center space-y-8">
              {/* Logo e título principal */}
              <div className="flex flex-col items-center -space-y-10">
                <img 
                  src="/sanem_logo_transparent.png" 
                  alt="SANEM Logo" 
                  className="h-60 w-60 object-contain"
                />
                <p className="text-xl font-semibold text-neutral-600 dark:text-neutral-300">
                  Sistema de Gerenciamento de Doações
                </p>
              </div>

              {/* Recursos principais */}
              <div className="grid grid-cols-1 gap-6 w-full max-w-xs mx-auto">
                <div className="flex flex-col items-center gap-2 group">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                  <div className="text-center">
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">Beneficiários</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Gestão completa</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 group">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                  <div className="text-center">
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">Estoque</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Controle total</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 group">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                  <div className="text-center">
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">Relatórios</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Análises detalhadas</p>
                  </div>
                </div>
              </div>

              
            </div>

            {/* Lado direito - Formulário de Login */}
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 p-8 lg:p-12 flex flex-col justify-center items-center relative overflow-hidden">
              {/* Gradiente decorativo adicional */}
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/5 to-white/10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/10"></div>
              <div className="w-full max-w-sm mx-auto space-y-8 relative z-10">
                {/* Ícone e título */}
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white tracking-wide">
                    ACESSO AO SISTEMA
                  </h2>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-8">
                  {/* Campo Email */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email ID"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 pr-4 py-4 border-0 border-b-2 border-white/30 bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-white/70 focus:shadow-none text-white placeholder:text-blue-200 rounded-none transition-all duration-200"
                      style={{ boxShadow: 'none', outline: 'none' }}
                    />
                  </div>
                  
                  {/* Campo Senha */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-12 pr-4 py-4 border-0 border-b-2 border-white/30 bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-white/70 focus:shadow-none text-white placeholder:text-blue-200 rounded-none transition-all duration-200"
                      style={{ boxShadow: 'none', outline: 'none' }}
                    />
                  </div>
                  
                                     {/* Remember me e Forgot password */}
                   <div className="flex items-center justify-between text-sm">
                     <label className="flex items-center text-blue-100 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                       <div className="relative mr-3">
                         <div className={`w-4 h-4 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                           rememberMe 
                             ? 'bg-white border-white' 
                             : 'bg-transparent border-white/40'
                         }`}>
                           <svg className={`w-3 h-3 text-blue-600 transition-opacity duration-200 ${
                             rememberMe ? 'opacity-100' : 'opacity-0'
                           }`} fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                         </div>
                       </div>
                       <span className="group-hover:text-white transition-colors">Lembrar-me</span>
                     </label>
                     <button type="button" className="text-blue-200 hover:text-white transition-colors">
                       Forgot Password?
                     </button>
                   </div>
                   
                   <Button 
                     type="submit" 
                     className="w-full bg-white hover:bg-white dark:bg-white dark:hover:bg-white text-blue-700 font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                     disabled={isLoading || authLoading}
                   >
                     {isLoading ? "ENTRANDO..." : "LOGIN"}
                   </Button>
                </form>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </GridBackground>
  );
};

export default Index;
