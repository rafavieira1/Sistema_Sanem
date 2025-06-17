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
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Lado esquerdo - Branding e informações */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Logo e título principal */}
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
                  SANEM
                </h1>
              </div>
              
              <div className="space-y-2">
                <p className="text-xl font-medium text-neutral-600 dark:text-neutral-300">
                  Sistema de Gerenciamento de Doações
                </p>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto lg:mx-0">
                  Plataforma completa para gestão de doações e apoio a pessoas em vulnerabilidade social
                </p>
              </div>
            </div>

            {/* Recursos principais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="group p-4 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-all duration-200">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">Beneficiários</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Gestão completa</p>
                  </div>
                </div>
              </div>

              <div className="group p-4 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-all duration-200">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">Estoque</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Controle total</p>
                  </div>
                </div>
              </div>

              <div className="group p-4 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-all duration-200">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">Relatórios</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Análises detalhadas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Aviso de acesso restrito */}
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">
                    Acesso Restrito
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    Sistema destinado apenas a administradores autorizados. Entre em contato com a administração para obter acesso.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário de Login */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md shadow-xl border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  Acesso ao Sistema
                </CardTitle>
                <CardDescription className="text-neutral-500 dark:text-neutral-400">
                  Digite suas credenciais para continuar
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-medium py-2.5 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading || authLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GridBackground>
  );
};

export default Index;
