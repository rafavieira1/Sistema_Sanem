import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Edit, Trash2, Shield, Users, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GridBackground } from "@/components/ui/grid-background";

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ativo" | "inativo";
  created_at: string;
  last_login?: string;
}

const GestaoUsuarios = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "voluntario" as UserRole,
    password: ""
  });

  // Verificar se o usuário pode criar/editar usuários (superadmin ou admin)
  const canManageUsers = user?.role === 'superadmin' || user?.role === 'admin';
  
  // Verificar se o usuário pode excluir usuários (apenas superadmin)
  const canDeleteUsers = user?.role === 'superadmin';

  useEffect(() => {
    if (hasPermission("manage_users")) {
      fetchUsuarios();
    }
  }, [hasPermission]);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários",
          variant: "destructive",
        });
        return;
      }

      // Converter os dados para o tipo Usuario correto
      const usuariosFormatados: Usuario[] = (data || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        status: user.status as "ativo" | "inativo",
        created_at: user.created_at,
        last_login: user.last_login || undefined
      }));

      setUsuarios(usuariosFormatados);
    } catch (error) {
      console.error("Erro na consulta:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPermission("manage_users")) {
    return (
      <GridBackground className="flex-1 min-h-screen">
        <main className="p-6">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          </div>
        </main>
      </GridBackground>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canManageUsers) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para gerenciar usuários",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingUser) {
        // Atualizar usuário
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          updated_at: new Date().toISOString()
        };

        if (formData.password) {
          updateData.password_hash = formData.password;
        }

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingUser.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Usuário atualizado",
          description: `${formData.name} foi atualizado com sucesso.`,
        });
      } else {
        // Criar novo usuário
        const { error } = await supabase
          .from('users')
          .insert({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            password_hash: formData.password,
            status: 'ativo'
          });

        if (error) {
          throw error;
        }

        toast({
          title: "Usuário criado",
          description: `${formData.name} foi adicionado ao sistema.`,
        });
      }
      
      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "voluntario", password: "" });
      fetchUsuarios();
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o usuário",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (usuario: Usuario) => {
    if (!canManageUsers) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para editar usuários",
        variant: "destructive",
      });
      return;
    }

    setEditingUser(usuario);
    setFormData({
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      password: ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!canDeleteUsers) {
      toast({
        title: "Acesso Negado",
        description: "Apenas superadministradores podem excluir usuários",
        variant: "destructive",
      });
      return;
    }

    if (usuario.role === 'superadmin') {
      toast({
        title: "Operação não permitida",
        description: "Não é possível excluir o superadministrador",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', usuario.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Usuário removido",
        description: `${usuario.name} foi removido do sistema.`,
        variant: "destructive",
      });
      
      fetchUsuarios();
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const variants = {
      superadmin: "destructive",
      admin: "default", 
      voluntario: "secondary"
    };
    
    const labels = {
      superadmin: "Super Admin",
      admin: "Administrador",
      voluntario: "Voluntário"
    };
    
    return (
      <Badge variant={variants[role] as any}>
        {labels[role]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-6 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </main>
    );
  }

  return (
    <GridBackground className="flex-1 min-h-screen">
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
              <p className="text-muted-foreground">Administrar usuários e permissões do sistema</p>
            </div>
          </div>

        {canManageUsers && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Editar Usuário" : "Novo Usuário"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? "Altere os dados do usuário" : "Preencha os dados para criar um novo usuário"}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@sanem.org"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Nível de Acesso *</Label>
                  <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível de acesso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voluntario">Voluntário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      {user?.role === 'superadmin' && (
                        <SelectItem value="superadmin">Super Administrador</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {editingUser ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Digite a senha"
                    required={!editingUser}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingUser ? "Atualizar" : "Criar Usuário"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{usuarios.filter(u => u.status === 'ativo').length}</p>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{usuarios.filter(u => u.role === 'admin' || u.role === 'superadmin').length}</p>
                <p className="text-sm text-gray-600">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{usuarios.filter(u => u.role === 'voluntario').length}</p>
                <p className="text-sm text-gray-600">Voluntários</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Gerencie todos os usuários do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.name}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{getRoleBadge(usuario.role)}</TableCell>
                  <TableCell>
                    <Badge variant={usuario.status === 'ativo' ? 'default' : 'secondary'}>
                      {usuario.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {usuario.last_login ? new Date(usuario.last_login).toLocaleDateString('pt-BR') : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {canManageUsers && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(usuario)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteUsers && usuario.role !== 'superadmin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(usuario)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </main>
    </GridBackground>
  );
};

export default GestaoUsuarios;
