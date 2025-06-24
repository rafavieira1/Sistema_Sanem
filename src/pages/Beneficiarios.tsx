import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Search, Plus, Eye, Edit, Users, Phone, MapPin, Calendar, UserPlus, Baby, AlertTriangle, User, Mail, Home, Save, X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GridBackground } from "@/components/ui/grid-background";
import { ROUTES } from "@/constants";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Tipo para beneficiários baseado na estrutura do banco
interface Beneficiario {
  id: string;
  nome: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  status: string | null;
  data_nascimento: string | null;
  created_at: string | null;
  numero_dependentes: number | null;
}

const Beneficiarios = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAtivos: 0,
    novosMes: 0,
    totalDependentes: 0,
    limiteAtingido: 0
  });
  
  // Estados para os dialogs
  const [selectedBeneficiario, setSelectedBeneficiario] = useState<Beneficiario | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Beneficiario>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Estados para exclusão
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [beneficiarioToDelete, setBeneficiarioToDelete] = useState<Beneficiario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para dependentes
  const [dependentes, setDependentes] = useState<Array<{
    id: string;
    nome: string;
    data_nascimento: string | null;
    parentesco: string | null;
    created_at: string | null;
  }>>([]);
  const [isLoadingDependentes, setIsLoadingDependentes] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Carregar beneficiários do banco
  useEffect(() => {
    fetchBeneficiarios();
  }, []);

  // Função para sincronizar contadores de dependentes
  const syncDependentesCount = async () => {
    try {
      // Buscar todos os beneficiários
      const { data: beneficiarios, error: benefError } = await supabase
        .from('beneficiarios')
        .select('id');

      if (benefError) throw benefError;

      // Para cada beneficiário, contar os dependentes e atualizar
      for (const beneficiario of beneficiarios || []) {
        const { count, error: countError } = await supabase
          .from('dependentes')
          .select('*', { count: 'exact' })
          .eq('beneficiario_id', beneficiario.id);

        if (countError) throw countError;

        // Atualizar o contador no beneficiário
        await supabase
          .from('beneficiarios')
          .update({ numero_dependentes: count || 0 })
          .eq('id', beneficiario.id);
      }
    } catch (error) {
      console.error('Erro ao sincronizar contadores:', error);
    }
  };

  const fetchBeneficiarios = async () => {
    try {
      setIsLoading(true);
      
      // Primeiro, sincronizar os contadores
      await syncDependentesCount();
      
      const { data, error } = await supabase
        .from('beneficiarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setBeneficiarios(data || []);
      
      // Calcular estatísticas
      const ativos = data?.filter(b => b.status === 'Ativo').length || 0;
      
      // Beneficiários criados este mês
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const novosMes = data?.filter(b => 
        b.created_at && new Date(b.created_at) >= firstDayOfMonth
      ).length || 0;

      // Total de dependentes (soma de todas as dependências)
      const totalDependentes = data?.reduce((sum, b) => sum + (b.numero_dependentes || 0), 0) || 0;

      setStats({
        totalAtivos: ativos,
        novosMes,
        totalDependentes,
        limiteAtingido: 0 // Implementar lógica de limite posteriormente
      });

    } catch (error) {
      console.error('Erro ao carregar beneficiários:', error);
      toast({
        title: "❌ Erro ao carregar dados",
        description: "Não foi possível carregar a lista de beneficiários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBeneficiarios = beneficiarios.filter(beneficiario =>
    beneficiario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiario.cpf.includes(searchTerm)
  );

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Inativo":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Limite Atingido":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getLimiteColor = (limite: string) => {
    const percentage = parseInt(limite);
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const formatarData = (data: string | null) => {
    if (!data) return "Não informado";
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const calcularIdade = (dataNascimento: string | null) => {
    if (!dataNascimento) return "N/A";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    return (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) ? idade - 1 : idade;
  };

  const handleNovoBeneficiario = () => {
    navigate(`${ROUTES.CADASTRO}?tab=beneficiario`);
  };

  const handleVerDetalhes = async (beneficiario: Beneficiario) => {
    setSelectedBeneficiario(beneficiario);
    setIsDetailsOpen(true);
    await loadDependentes(beneficiario.id);
  };

  const loadDependentes = async (beneficiarioId: string) => {
    try {
      setIsLoadingDependentes(true);
      const { data, error } = await supabase
        .from('dependentes')
        .select('*')
        .eq('beneficiario_id', beneficiarioId)
        .order('nome');

      if (error) {
        throw error;
      }

      setDependentes(data || []);
    } catch (error) {
      console.error('Erro ao carregar dependentes:', error);
      toast({
        title: "❌ Erro ao carregar dependentes",
        description: "Não foi possível carregar a lista de dependentes.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDependentes(false);
    }
  };

  const handleEditar = async (beneficiario: Beneficiario) => {
    setSelectedBeneficiario(beneficiario);
    setEditForm(beneficiario);
    setIsEditOpen(true);
    await loadDependentes(beneficiario.id);
  };

  const handleSaveEdit = async () => {
    if (!selectedBeneficiario) return;

    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('beneficiarios')
        .update({
          nome: editForm.nome,
          cpf: editForm.cpf,
          telefone: editForm.telefone,
          email: editForm.email,
          endereco: editForm.endereco,
          status: editForm.status,
          data_nascimento: editForm.data_nascimento,
          numero_dependentes: editForm.numero_dependentes
        })
        .eq('id', selectedBeneficiario.id);

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Sucesso!",
        description: "Beneficiário atualizado com sucesso.",
        variant: "default",
      });

      setIsEditOpen(false);
      setSelectedBeneficiario(null);
      setEditForm({});
      fetchBeneficiarios(); // Recarregar lista
      
      // Recarregar dependentes e atualizar contador
      if (selectedBeneficiario) {
        await loadDependentes(selectedBeneficiario.id);
        await syncDependentesCount();
        await fetchBeneficiarios(); // Atualizar lista completa
      }
      
    } catch (error) {
      console.error('Erro ao atualizar beneficiário:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao atualizar beneficiário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExcluir = (beneficiario: Beneficiario) => {
    setBeneficiarioToDelete(beneficiario);
    setIsDeleteOpen(true);
  };

  const confirmarExclusao = async () => {
    if (!beneficiarioToDelete) return;

    setIsDeleting(true);
    
    try {
      // Verificar se o beneficiário tem distribuições
      const { data: distribuicoes, error: distError } = await supabase
        .from('distribuicoes')
        .select('id')
        .eq('beneficiario_id', beneficiarioToDelete.id)
        .limit(1);

      if (distError) throw distError;

      if (distribuicoes && distribuicoes.length > 0) {
        toast({
          title: "❌ Não é possível excluir",
          description: "Este beneficiário possui distribuições registradas. Para manter a integridade dos dados, não é possível excluí-lo.",
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }

      // Primeiro, excluir todos os dependentes do beneficiário
      const { error: dependentesError } = await supabase
        .from('dependentes')
        .delete()
        .eq('beneficiario_id', beneficiarioToDelete.id);

      if (dependentesError) throw dependentesError;

      // Depois, excluir o beneficiário
      const { error: beneficiarioError } = await supabase
        .from('beneficiarios')
        .delete()
        .eq('id', beneficiarioToDelete.id);

      if (beneficiarioError) throw beneficiarioError;

      toast({
        title: "✅ Beneficiário excluído!",
        description: `${beneficiarioToDelete.nome} foi removido do sistema.`,
      });

      // Recarregar a lista
      await fetchBeneficiarios();
      
      // Fechar modal
      setIsDeleteOpen(false);
      setBeneficiarioToDelete(null);
      
    } catch (error) {
      console.error('Erro ao excluir beneficiário:', error);
      toast({
        title: "❌ Erro ao excluir",
        description: "Não foi possível excluir o beneficiário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoverDependente = async (dependenteId: string, dependenteNome: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o dependente "${dependenteNome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('dependentes')
        .delete()
        .eq('id', dependenteId);

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Dependente removido!",
        description: `${dependenteNome} foi removido com sucesso.`,
      });

      // Recarregar dependentes e atualizar contador
      if (selectedBeneficiario) {
        await loadDependentes(selectedBeneficiario.id);
        await syncDependentesCount();
        await fetchBeneficiarios(); // Atualizar lista completa
      }
      
    } catch (error) {
      console.error('Erro ao remover dependente:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao remover dependente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <GridBackground className="flex-1 min-h-screen">
      <main className="p-6">
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Beneficiários</h1>
            <p className="text-muted-foreground">Gestão completa dos beneficiários cadastrados</p>
          </div>
        </div>

      {/* Cards de Estatísticas com Efeito Brilhante */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative hover:shadow-lg transition-all duration-300 hover:shadow-primary/20 overflow-hidden">
          <GlowingEffect 
            disabled={false}
            proximity={100}
            spread={30}
            blur={2}
            movementDuration={1.5}
            borderWidth={2}
            className="z-10"
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-20">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ativos
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.totalAtivos}</div>
            <p className="text-xs text-muted-foreground mt-1">Beneficiários ativos</p>
          </CardContent>
        </Card>

        <Card className="relative hover:shadow-lg transition-all duration-300 hover:shadow-primary/20 overflow-hidden">
          <GlowingEffect 
            disabled={false}
            proximity={100}
            spread={30}
            blur={2}
            movementDuration={1.5}
            borderWidth={2}
            className="z-10"
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-20">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Novos este mês
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <UserPlus className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.novosMes}</div>
            <p className="text-xs text-muted-foreground mt-1">+{stats.novosMes} novos este mês</p>
          </CardContent>
        </Card>

        <Card className="relative hover:shadow-lg transition-all duration-300 hover:shadow-primary/20 overflow-hidden">
          <GlowingEffect 
            disabled={false}
            proximity={100}
            spread={30}
            blur={2}
            movementDuration={1.5}
            borderWidth={2}
            className="z-10"
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-20">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Dependentes
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Baby className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.totalDependentes}</div>
            <p className="text-xs text-muted-foreground mt-1">Total cadastrados</p>
          </CardContent>
        </Card>

        <Card className="relative hover:shadow-lg transition-all duration-300 hover:shadow-primary/20 overflow-hidden">
          <GlowingEffect 
            disabled={false}
            proximity={100}
            spread={30}
            blur={2}
            movementDuration={1.5}
            borderWidth={2}
            className="z-10"
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-20">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Beneficiários
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{isLoading ? "..." : beneficiarios.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total no sistema</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={fetchBeneficiarios}
                disabled={isLoading}
              >
                {isLoading ? "Sincronizando..." : "Atualizar Dados"}
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNovoBeneficiario}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Beneficiário
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Beneficiários */}
      <div className="grid gap-4">
        {filteredBeneficiarios.map((beneficiario) => (
          <Card key={beneficiario.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {beneficiario.nome}
                    </h3>
                    <Badge className={getStatusColor(beneficiario.status)}>
                      {beneficiario.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium">CPF: {beneficiario.cpf}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-4 w-4" />
                        <span>{beneficiario.telefone}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{beneficiario.endereco}</span>
                      </div>
                      <p className="mt-1">
                        <strong>{beneficiario.numero_dependentes}</strong> dependentes
                      </p>
                    </div>
                  </div>

                                      <div className="flex items-center gap-4 mt-3 text-sm">
                      <span>Cadastrado em: <strong>{formatarData(beneficiario.created_at)}</strong></span>
                      {beneficiario.data_nascimento && (
                        <span>Idade: <strong>{calcularIdade(beneficiario.data_nascimento)} anos</strong></span>
                      )}
                    </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVerDetalhes(beneficiario)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditar(beneficiario)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleExcluir(beneficiario)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBeneficiarios.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum beneficiário encontrado
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Tente ajustar os filtros de busca." : "Comece cadastrando o primeiro beneficiário."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Beneficiário</DialogTitle>
            <DialogDescription>
              Informações completas do beneficiário selecionado
            </DialogDescription>
          </DialogHeader>
          
          {selectedBeneficiario && (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">Nome Completo</Label>
                  </div>
                  <p className="text-sm">{selectedBeneficiario.nome}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium">CPF</Label>
                  <p className="text-sm">{selectedBeneficiario.cpf}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">Telefone</Label>
                  </div>
                  <p className="text-sm">{selectedBeneficiario.telefone || "Não informado"}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">Email</Label>
                  </div>
                  <p className="text-sm">{selectedBeneficiario.email || "Não informado"}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">Endereço</Label>
                  </div>
                  <p className="text-sm">{selectedBeneficiario.endereco || "Não informado"}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">Data de Nascimento</Label>
                  </div>
                  <p className="text-sm">
                    {selectedBeneficiario.data_nascimento 
                      ? `${formatarData(selectedBeneficiario.data_nascimento)} (${calcularIdade(selectedBeneficiario.data_nascimento)} anos)`
                      : "Não informado"
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedBeneficiario.status)}>
                    {selectedBeneficiario.status || "N/A"}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">Número de Dependentes</Label>
                  </div>
                  <p className="text-sm">{selectedBeneficiario.numero_dependentes || 0}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-medium">Data de Cadastro</Label>
                <p className="text-sm">{formatarData(selectedBeneficiario.created_at)}</p>
              </div>

              {/* Seção de Dependentes */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium text-base">Dependentes Cadastrados</Label>
                </div>
                
                {isLoadingDependentes ? (
                  <p className="text-sm text-muted-foreground">Carregando dependentes...</p>
                ) : dependentes.length > 0 ? (
                  <div className="grid gap-3">
                    {dependentes.map((dependente) => (
                      <div key={dependente.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{dependente.nome}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Parentesco: {dependente.parentesco || "Não informado"}</span>
                              {dependente.data_nascimento && (
                                <span>Idade: {calcularIdade(dependente.data_nascimento)} anos</span>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {dependente.parentesco || "N/A"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Cadastrado em: {formatarData(dependente.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum dependente cadastrado</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dependentes podem ser cadastrados na aba "Cadastro de Pessoas"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDetailsOpen(false);
              setDependentes([]);
              setSelectedBeneficiario(null);
            }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Beneficiário</DialogTitle>
            <DialogDescription>
              Altere as informações do beneficiário
            </DialogDescription>
          </DialogHeader>
          
          {selectedBeneficiario && (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome">Nome Completo</Label>
                  <Input
                    id="edit-nome"
                    value={editForm.nome || ""}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-cpf">CPF</Label>
                  <Input
                    id="edit-cpf"
                    value={editForm.cpf || ""}
                    onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-telefone">Telefone</Label>
                  <Input
                    id="edit-telefone"
                    value={editForm.telefone || ""}
                    onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-endereco">Endereço</Label>
                  <Input
                    id="edit-endereco"
                    value={editForm.endereco || ""}
                    onChange={(e) => setEditForm({ ...editForm, endereco: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-data-nascimento">Data de Nascimento</Label>
                  <Input
                    id="edit-data-nascimento"
                    type="date"
                    value={editForm.data_nascimento ? editForm.data_nascimento.split('T')[0] : ""}
                    onChange={(e) => setEditForm({ ...editForm, data_nascimento: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    value={editForm.status || ""}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecione um status</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Limite Atingido">Limite Atingido</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-dependentes">Número de Dependentes</Label>
                  <Input
                    id="edit-dependentes"
                    type="number"
                    min="0"
                    value={editForm.numero_dependentes || 0}
                    onChange={(e) => setEditForm({ ...editForm, numero_dependentes: parseInt(e.target.value) || 0 })}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este valor é calculado automaticamente baseado nos dependentes cadastrados
                  </p>
                </div>
              </div>

              {/* Seção de Gerenciamento de Dependentes */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium text-base">Gerenciar Dependentes</Label>
                </div>
                
                {isLoadingDependentes ? (
                  <p className="text-sm text-muted-foreground">Carregando dependentes...</p>
                ) : dependentes.length > 0 ? (
                  <div className="grid gap-3">
                    {dependentes.map((dependente) => (
                      <div key={dependente.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{dependente.nome}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Parentesco: {dependente.parentesco || "Não informado"}</span>
                              {dependente.data_nascimento && (
                                <span>Idade: {calcularIdade(dependente.data_nascimento)} anos</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Cadastrado em: {formatarData(dependente.created_at)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoverDependente(dependente.id, dependente.nome)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum dependente cadastrado</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dependentes podem ser cadastrados na aba "Cadastro de Pessoas"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditOpen(false);
                setDependentes([]);
                setSelectedBeneficiario(null);
                setEditForm({});
              }}
              disabled={isUpdating}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={isUpdating}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Excluir Beneficiário
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Tem certeza que deseja excluir este beneficiário?
            </DialogDescription>
          </DialogHeader>
          
          {beneficiarioToDelete && (
            <div className="space-y-4">
              {/* Informações do Beneficiário */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-900">
                      {beneficiarioToDelete.nome}
                    </span>
                  </div>
                  <div className="text-sm text-red-700 space-y-1">
                    <p><strong>CPF:</strong> {beneficiarioToDelete.cpf}</p>
                    <p><strong>Status:</strong> {beneficiarioToDelete.status}</p>
                    <p><strong>Dependentes:</strong> {beneficiarioToDelete.numero_dependentes || 0}</p>
                    <p><strong>Cadastrado em:</strong> {formatarData(beneficiarioToDelete.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Aviso sobre dependentes */}
              {(beneficiarioToDelete.numero_dependentes || 0) > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Atenção: Dependentes serão excluídos
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Este beneficiário possui {beneficiarioToDelete.numero_dependentes} dependente(s) que também serão removidos do sistema.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Aviso importante */}
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      ⚠️ Esta ação é irreversível
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Todos os dados do beneficiário e seus dependentes serão permanentemente removidos. 
                      Beneficiários com distribuições registradas não podem ser excluídos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="destructive" 
                  onClick={confirmarExclusao}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDeleteOpen(false);
                    setBeneficiarioToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </main>
    </GridBackground>
  );
};

export default Beneficiarios;
