import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GridBackground } from "@/components/ui/grid-background";

const Perfil = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Se não há usuário logado, mostra estado de carregamento
  if (!user) {
    return (
      <main className="flex-1 p-6 bg-background">
        <div className="mb-6 flex items-center gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground">Carregando informações do usuário...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Carregando dados do perfil...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Mapear papel do usuário para exibição
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Super Administrador';
      case 'admin': return 'Administrador';
      case 'voluntario': return 'Voluntário';
      default: return 'Usuário';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsLoading(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setIsLoading(false);
      setIsChangingPassword(false);
    }, 1000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <GridBackground className="flex-1 min-h-screen">
      <main className="p-6">
        <div className="mb-6 flex items-center gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações</p>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card do Perfil Resumido */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-2">{getRoleDisplayName(user.role)}</p>
              <Separator className="my-4" />
              
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{user.email}</p>
                    <p className="text-muted-foreground">E-mail principal</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">-</p>
                    <p className="text-muted-foreground">Telefone de contato</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">-</p>
                    <p className="text-muted-foreground">Endereço residencial</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />
              
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between">
                  <p className="font-medium text-foreground">Tipo de Usuário</p>
                  <p className="text-muted-foreground">{getRoleDisplayName(user.role)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Perfil */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Seus dados cadastrais no sistema SANEM
                  </CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancelar" : "Editar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input 
                      id="nome" 
                      defaultValue={user.name}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email"
                      defaultValue={user.email}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input 
                      id="telefone"
                      placeholder="(00) 00000-0000"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="funcao">Tipo de Usuário</Label>
                    <Input 
                      id="funcao"
                      value={getRoleDisplayName(user.role)}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input 
                    id="endereco"
                    placeholder="Rua, número, bairro - cidade"
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Alteração de Senha */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Segurança
                  </CardTitle>
                  <CardDescription>
                    Altere sua senha de acesso
                  </CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  {isChangingPassword ? "Cancelar" : "Alterar Senha"}
                </Button>
              </div>
            </CardHeader>
            
            {isChangingPassword && (
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senha-atual">Senha Atual</Label>
                    <Input 
                      id="senha-atual" 
                      type="password"
                      placeholder="Digite sua senha atual"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nova-senha">Nova Senha</Label>
                    <Input 
                      id="nova-senha" 
                      type="password"
                      placeholder="Digite sua nova senha"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                    <Input 
                      id="confirmar-senha" 
                      type="password"
                      placeholder="Confirme sua nova senha"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Alterando..." : "Alterar Senha"}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setIsChangingPassword(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>

          {/* Informações do Sistema */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Sistema
              </CardTitle>
              <CardDescription>
                Detalhes da sua conta no sistema SANEM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ID do Usuário:</span>
                  <span className="text-sm text-muted-foreground font-mono">{user.id}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tipo de Usuário:</span>
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleDisplayName(user.role)}
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Permissões:</span>
                  <span className="text-sm text-muted-foreground">{user.permissions.length} permissões ativas</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.permissions.slice(0, 3).map((permission, index) => (
                    <div key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                      {permission.replace(/_/g, ' ')}
                    </div>
                  ))}
                  {user.permissions.length > 3 && (
                    <div className="inline-flex items-center px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                      +{user.permissions.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </main>
    </GridBackground>
  );
};

export default Perfil;
