import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Plus, User, Package, Calendar, AlertCircle, CheckCircle, Eye, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GridBackground } from "@/components/ui/grid-background";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { supabase } from "@/integrations/supabase/client";

interface Beneficiario {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  endereco: string;
  telefone: string;
  numero_dependentes: number;
  limite_mensal_real: number;
  limite_usado_atual: number;
  status: string;
  created_at: string;
}

interface Produto {
  id: string;
  nome: string;
  categoria_id: string;
  quantidade_estoque: number;
  categoria?: {
    nome: string;
  };
  categorias_produtos?: {
    nome: string;
  };
}

interface Distribuicao {
  id: string;
  beneficiario_id: string;
  data_distribuicao: string;
  observacoes: string | null;
  valor_total: number | null;
  status: string | null;
  created_at: string;
  created_by_name: string | null;
  beneficiario?: {
    nome: string;
  };
  beneficiarios?: {
    nome: string;
  };
  itens_distribuicao?: Array<{
    id: string;
    produto_id: string;
    quantidade: number;
    produto?: {
      nome: string;
      categoria?: {
        nome: string;
      };
    };
    produtos?: {
      nome: string;
      categorias_produtos?: {
        nome: string;
      };
    };
  }>;
}

interface ItemDistribuicao {
  produto_id: string;
  produto_nome: string;
  categoria_nome: string;
  quantidade: number;
  quantidade_disponivel: number;
}

const Distribuicao = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Estados para dados do banco
  const [beneficiarios, setBeneficiarios] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [distribuicoes, setDistribuicoes] = useState<any[]>([]);
  
  // Estados do formulário
  const [selectedBeneficiario, setSelectedBeneficiario] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedProduto, setSelectedProduto] = useState("");
  const [quantidadeItem, setQuantidadeItem] = useState(0);
  const [itensDistribuicao, setItensDistribuicao] = useState<ItemDistribuicao[]>([]);
  
  // Estados para modal de detalhes
  const [selectedDistribuicao, setSelectedDistribuicao] = useState<Distribuicao | null>(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  
  // Estados para cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [distribuicaoParaCancelar, setDistribuicaoParaCancelar] = useState<Distribuicao | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  
  // Estados para estatísticas
  const [estatisticas, setEstatisticas] = useState({
    distribuicoesEsteMes: 0,
    itensDistribuidos: 0,
    beneficiariosAtendidos: 0,
    proximosAoLimite: 0
  });

  useEffect(() => {
    fetchBeneficiarios();
    fetchProdutos();
    fetchDistribuicoes();
  }, []);

  useEffect(() => {
    calcularEstatisticas();
  }, [distribuicoes]);

  const fetchBeneficiarios = async () => {
    try {
      const { data, error } = await supabase
        .from('beneficiarios')
        .select('*')
        .eq('status', 'Ativo')
        .order('nome');

      if (error) throw error;
      setBeneficiarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar beneficiários:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os beneficiários.",
        variant: "destructive",
      });
    }
  };

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          id,
          nome,
          categoria_id,
          quantidade_estoque,
          categorias_produtos!inner(nome)
        `)
        .gt('quantidade_estoque', 0)
        .order('nome');

      if (error) throw error;
      
      // Transformar os dados para manter compatibilidade
      const produtosFormatados = data?.map(produto => ({
        ...produto,
        categoria: produto.categorias_produtos ? { nome: produto.categorias_produtos.nome } : null
      })) || [];
      
      setProdutos(produtosFormatados);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    }
  };

  const fetchDistribuicoes = async () => {
    try {
      const { data, error } = await supabase
        .from('distribuicoes')
        .select(`
          *,
          beneficiarios!inner(nome),
          itens_distribuicao(
            id,
            produto_id,
            quantidade,
            produtos!inner(
              nome,
              categorias_produtos(nome)
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transformar os dados para manter compatibilidade
      const distribuicoesFormatadas = data?.map(dist => ({
        ...dist,
        beneficiario: dist.beneficiarios ? { nome: dist.beneficiarios.nome } : null,
        itens_distribuicao: dist.itens_distribuicao?.map(item => ({
          ...item,
          produto: item.produtos ? {
            nome: item.produtos.nome,
            categoria: item.produtos.categorias_produtos ? { nome: item.produtos.categorias_produtos.nome } : null
          } : null
        }))
      })) || [];
      
      setDistribuicoes(distribuicoesFormatadas);
    } catch (error) {
      console.error('Erro ao carregar distribuições:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar as distribuições.",
        variant: "destructive",
      });
    }
  };

  const calcularEstatisticas = () => {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    
    const distribuicoesEsteMes = distribuicoes.filter(d => 
      new Date(d.created_at) >= inicioMes
    ).length;

    const itensDistribuidos = distribuicoes.reduce((total, dist) => 
      total + (dist.itens_distribuicao?.reduce((subtotal, item) => 
        subtotal + item.quantidade, 0) || 0), 0
    );

    const beneficiariosAtendidosSet = new Set(
      distribuicoes
        .filter(d => new Date(d.created_at) >= inicioMes)
        .map(d => d.beneficiario_id)
    );

    // Calcular beneficiários próximos ao limite (80% do limite de 10 itens = 8 itens)
    const proximosAoLimite = beneficiarios.filter(b => 
      b.limite_usado_atual >= 8 && b.limite_usado_atual < 10
    ).length;

    setEstatisticas({
      distribuicoesEsteMes,
      itensDistribuidos,
      beneficiariosAtendidos: beneficiariosAtendidosSet.size,
      proximosAoLimite
    });
  };

  const produtosFiltrados = produtos.filter(p => 
    selectedCategoria ? p.categoria?.nome === selectedCategoria : true
  );

  const adicionarItem = () => {
    if (!selectedProduto || quantidadeItem <= 0) {
      toast({
        title: "❌ Erro",
        description: "Selecione um produto e informe uma quantidade válida.",
        variant: "destructive",
      });
      return;
    }

    const produto = produtos.find(p => p.id === selectedProduto);
    if (!produto) return;

    if (quantidadeItem > produto.quantidade_estoque) {
      toast({
        title: "❌ Erro",
        description: `Quantidade disponível: ${produto.quantidade_estoque}`,
        variant: "destructive",
      });
      return;
    }

    // Verificar se o produto já foi adicionado
    const itemExistente = itensDistribuicao.find(item => item.produto_id === selectedProduto);
    if (itemExistente) {
      toast({
        title: "❌ Erro",
        description: "Este produto já foi adicionado à distribuição.",
        variant: "destructive",
      });
      return;
    }

    const novoItem: ItemDistribuicao = {
      produto_id: produto.id,
      produto_nome: produto.nome,
      categoria_nome: produto.categoria?.nome || "Sem categoria",
      quantidade: quantidadeItem,
      quantidade_disponivel: produto.quantidade_estoque
    };

    setItensDistribuicao([...itensDistribuicao, novoItem]);
    
    // Limpar seleções
    setSelectedCategoria("");
    setSelectedProduto("");
    setQuantidadeItem(0);

    toast({
      title: "✅ Item adicionado!",
      description: `${quantidadeItem}x ${produto.nome} adicionado à distribuição.`,
    });
  };

  const removerItem = (index: number) => {
    const novosItens = itensDistribuicao.filter((_, i) => i !== index);
    setItensDistribuicao(novosItens);
    
    toast({
      title: "✅ Item removido!",
      description: "Item removido da distribuição.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBeneficiario) {
      toast({
        title: "❌ Erro",
        description: "Selecione um beneficiário.",
        variant: "destructive",
      });
      return;
    }

    if (itensDistribuicao.length === 0) {
      toast({
        title: "❌ Erro",
        description: "Adicione pelo menos um item à distribuição.",
        variant: "destructive",
      });
      return;
    }

    // Verificar limite de itens do beneficiário
    const beneficiario = beneficiarios.find(b => b.id === selectedBeneficiario);
    const totalItensDistribuicao = itensDistribuicao.reduce((total, item) => total + item.quantidade, 0);
    
    if (beneficiario && (beneficiario.limite_usado_atual + totalItensDistribuicao) > beneficiario.limite_mensal_real) {
      const itensDisponiveis = beneficiario.limite_mensal_real - beneficiario.limite_usado_atual;
      toast({
        title: "❌ Limite Excedido",
        description: `Este beneficiário só pode retirar mais ${itensDisponiveis} itens este mês. Limite: ${beneficiario.limite_mensal_real} itens/mês.`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const dataDistribuicao = formData.get('data-distribuicao') as string;
      const observacoes = formData.get('observacoes-dist') as string;

      if (!dataDistribuicao) {
        toast({
          title: "❌ Erro",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Criar a distribuição
      const { data: novaDistribuicao, error: errorDistribuicao } = await supabase
        .from('distribuicoes')
        .insert({
          beneficiario_id: selectedBeneficiario,
          data_distribuicao: dataDistribuicao,
          observacoes: observacoes || null,
          valor_total: null,
          status: 'Concluída',
          created_by: user?.id
        })
        .select()
        .single();

      if (errorDistribuicao) throw errorDistribuicao;

      // Atualizar limite usado do beneficiário
      const totalItensDistribuicao = itensDistribuicao.reduce((total, item) => total + item.quantidade, 0);
      const { error: errorLimite } = await supabase
        .from('beneficiarios')
        .update({
          limite_usado_atual: (beneficiario?.limite_usado_atual || 0) + totalItensDistribuicao
        })
        .eq('id', selectedBeneficiario);

      if (errorLimite) throw errorLimite;

      // Criar os itens da distribuição e atualizar estoque
      for (const item of itensDistribuicao) {
        // Inserir item da distribuição
        const { error: errorItem } = await supabase
          .from('itens_distribuicao')
          .insert({
            distribuicao_id: novaDistribuicao.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade
          });

        if (errorItem) throw errorItem;

        // Atualizar quantidade no estoque
        const { error: errorEstoque } = await supabase
          .from('produtos')
          .update({
            quantidade_estoque: item.quantidade_disponivel - item.quantidade
          })
          .eq('id', item.produto_id);

        if (errorEstoque) throw errorEstoque;

        // Registrar movimentação no estoque
        await supabase
          .from('movimentacoes_estoque')
          .insert({
            produto_id: item.produto_id,
            tipo_movimentacao: 'Saída',
            quantidade: item.quantidade,
            quantidade_anterior: item.quantidade_disponivel,
            quantidade_nova: item.quantidade_disponivel - item.quantidade,
            motivo: 'Distribuição para beneficiário',
            referencia_id: novaDistribuicao.id,
            referencia_tipo: 'distribuicao',
            created_by: user?.id
          });
      }

      toast({
        title: "✅ Distribuição registrada!",
        description: "A distribuição foi cadastrada com sucesso.",
      });

      // Limpar formulário e recarregar dados
      setSelectedBeneficiario("");
      setItensDistribuicao([]);
      setShowForm(false);
      
      fetchProdutos();
      fetchDistribuicoes();
      
    } catch (error) {
      console.error('Erro ao registrar distribuição:', error);
      toast({
        title: "❌ Erro no cadastro",
        description: "Não foi possível registrar a distribuição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLimiteColor = (limite: string) => {
    const percentage = parseInt(limite);
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const abrirDetalhes = (distribuicao: Distribuicao) => {
    setSelectedDistribuicao(distribuicao);
    setShowDetalhesModal(true);
  };

  const abrirCancelamento = (distribuicao: Distribuicao) => {
    setDistribuicaoParaCancelar(distribuicao);
    setShowCancelModal(true);
  };

  const cancelarDistribuicao = async () => {
    if (!distribuicaoParaCancelar) return;

    setIsCanceling(true);
    
    try {
      // 1. Reverter os itens para o estoque
      for (const item of distribuicaoParaCancelar.itens_distribuicao || []) {
        // Buscar a quantidade atual do produto no estoque
        const { data: produtoAtual, error: errorProduto } = await supabase
          .from('produtos')
          .select('quantidade_estoque')
          .eq('id', item.produto_id)
          .single();

        if (errorProduto) throw errorProduto;

        // Atualizar quantidade no estoque (adicionar de volta)
        const { error: errorEstoque } = await supabase
          .from('produtos')
          .update({
            quantidade_estoque: produtoAtual.quantidade_estoque + item.quantidade
          })
          .eq('id', item.produto_id);

        if (errorEstoque) throw errorEstoque;

        // Registrar movimentação no estoque
        await supabase
          .from('movimentacoes_estoque')
          .insert({
            produto_id: item.produto_id,
            tipo_movimentacao: 'Entrada',
            quantidade: item.quantidade,
            quantidade_anterior: produtoAtual.quantidade_estoque,
            quantidade_nova: produtoAtual.quantidade_estoque + item.quantidade,
            motivo: 'Cancelamento de distribuição',
            referencia_id: distribuicaoParaCancelar.id,
            referencia_tipo: 'cancelamento_distribuicao',
            created_by: user?.id
          });
      }

      // 2. Reverter limite usado do beneficiário
      const totalItens = distribuicaoParaCancelar.itens_distribuicao?.reduce(
        (total, item) => total + item.quantidade, 0
      ) || 0;

      const beneficiario = beneficiarios.find(b => b.id === distribuicaoParaCancelar.beneficiario_id);
      if (beneficiario) {
        const { error: errorLimite } = await supabase
          .from('beneficiarios')
          .update({
            limite_usado_atual: Math.max(0, beneficiario.limite_usado_atual - totalItens)
          })
          .eq('id', distribuicaoParaCancelar.beneficiario_id);

        if (errorLimite) throw errorLimite;
      }

      // 3. Deletar os itens da distribuição
      const { error: errorItens } = await supabase
        .from('itens_distribuicao')
        .delete()
        .eq('distribuicao_id', distribuicaoParaCancelar.id);

      if (errorItens) throw errorItens;

      // 4. Deletar a distribuição
      const { error: errorDistribuicao } = await supabase
        .from('distribuicoes')
        .delete()
        .eq('id', distribuicaoParaCancelar.id);

      if (errorDistribuicao) throw errorDistribuicao;

      toast({
        title: "✅ Distribuição cancelada!",
        description: "A distribuição foi cancelada e os itens retornaram ao estoque.",
      });

      // Recarregar dados
      fetchProdutos();
      fetchDistribuicoes();
      fetchBeneficiarios();
      
      // Fechar modal
      setShowCancelModal(false);
      setDistribuicaoParaCancelar(null);
      
    } catch (error) {
      console.error('Erro ao cancelar distribuição:', error);
      toast({
        title: "❌ Erro ao cancelar",
        description: "Não foi possível cancelar a distribuição.",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  const categorias = [...new Set(produtos.map(p => p.categoria?.nome).filter(Boolean))];

  return (
    <GridBackground className="flex-1 min-h-screen">
      <main className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Distribuição de Itens</h1>
            <p className="text-muted-foreground">Registre as retiradas dos beneficiários</p>
          </div>
        </div>

        {/* Estatísticas */}
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
                Distribuições Este Mês
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-20">
              <div className="text-2xl font-bold text-foreground">{estatisticas.distribuicoesEsteMes}</div>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
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
                Itens Distribuídos
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-20">
              <div className="text-2xl font-bold text-foreground">{estatisticas.itensDistribuidos}</div>
              <p className="text-xs text-muted-foreground mt-1">Total de itens</p>
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
                Beneficiários Atendidos
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-20">
              <div className="text-2xl font-bold text-foreground">{estatisticas.beneficiariosAtendidos}</div>
              <p className="text-xs text-muted-foreground mt-1">Pessoas atendidas</p>
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
                Próximos ao Limite
              </CardTitle>
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-20">
              <div className="text-2xl font-bold text-foreground">{estatisticas.proximosAoLimite}</div>
              <p className="text-xs text-muted-foreground mt-1">Precisam atenção</p>
            </CardContent>
          </Card>
        </div>

        {/* Beneficiários Próximos ao Limite */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Atenção - Beneficiários Próximos ao Limite
            </CardTitle>
            <CardDescription>
              Beneficiários que podem estar chegando ao limite mensal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {beneficiarios
                .filter(b => b.limite_usado_atual >= 8 && b.limite_usado_atual < 10)
                .map((beneficiario) => (
                  <div key={beneficiario.id} className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <p className="font-medium text-gray-900">{beneficiario.nome}</p>
                    <p className="text-sm text-gray-600">{beneficiario.numero_dependentes} dependentes</p>
                    <p className="text-sm font-medium text-orange-600">
                      {beneficiario.limite_usado_atual}/10 itens usados
                    </p>
                  </div>
                ))}
              {estatisticas.proximosAoLimite === 0 && (
                <p className="text-gray-600 col-span-full">Nenhum beneficiário próximo ao limite no momento.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botão Nova Distribuição */}
        <div className="mb-6">
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? "Cancelar" : "Nova Distribuição"}
          </Button>
        </div>

        {/* Formulário de Nova Distribuição */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Registrar Nova Distribuição
              </CardTitle>
              <CardDescription>
                Registre a retirada de itens por um beneficiário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beneficiario">Beneficiário *</Label>
                    <Select value={selectedBeneficiario} onValueChange={setSelectedBeneficiario}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o beneficiário" />
                      </SelectTrigger>
                      <SelectContent>
                        {beneficiarios.map((beneficiario) => {
                          const itensDisponiveis = beneficiario.limite_mensal_real - beneficiario.limite_usado_atual;
                          return (
                            <SelectItem key={beneficiario.id} value={beneficiario.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{beneficiario.nome}</span>
                                <div className="flex gap-2 text-xs ml-2">
                                  <span className="text-blue-600">
                                    {beneficiario.numero_dependentes} dep.
                                  </span>
                                  <span className={`${itensDisponiveis <= 2 ? 'text-red-600' : 'text-green-600'}`}>
                                    {itensDisponiveis} itens
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data-distribuicao">Data da Distribuição *</Label>
                    <Input 
                      id="data-distribuicao" 
                      name="data-distribuicao"
                      type="date" 
                      required 
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Itens a Distribuir *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="categoria-dist">Categoria</Label>
                      <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                        <SelectTrigger>
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria} value={categoria || ""}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-disponivel">Item Disponível</Label>
                      <Select value={selectedProduto} onValueChange={setSelectedProduto}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o item" />
                        </SelectTrigger>
                        <SelectContent>
                          {produtosFiltrados.length > 0 ? (
                            produtosFiltrados.map((produto) => (
                              <SelectItem key={produto.id} value={produto.id}>
                                {produto.nome} (Disponível: {produto.quantidade_estoque})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="sem-itens" disabled>
                              Nenhum item disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantidade-dist">Quantidade</Label>
                      <Input 
                        id="quantidade-dist" 
                        type="number" 
                        placeholder="0" 
                        min="1"
                        value={quantidadeItem === 0 ? "" : quantidadeItem}
                        onChange={(e) => {
                          const valor = e.target.value;
                          if (valor === "") {
                            setQuantidadeItem(0);
                          } else if (!isNaN(parseInt(valor)) && parseInt(valor) > 0) {
                            setQuantidadeItem(parseInt(valor));
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={adicionarItem}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lista de Itens Selecionados */}
                <div className="space-y-2">
                  <Label>Itens Selecionados</Label>
                  <div className="p-3 bg-blue-50 rounded-lg border">
                    {itensDistribuicao.length > 0 ? (
                      <div className="space-y-2">
                        {itensDistribuicao.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.categoria_nome}</Badge>
                              <span className="font-medium">{item.produto_nome}</span>
                              <span className="text-sm text-gray-600">
                                Qtd: {item.quantidade}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removerItem(index)}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                        <p className="text-xs text-blue-600 mt-2">
                          <strong>Total de itens:</strong> {itensDistribuicao.reduce((total, item) => total + item.quantidade, 0)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Nenhum item selecionado ainda</p>
                    )}
                  </div>
                </div>



                <div className="space-y-2">
                  <Label htmlFor="observacoes-dist">Observações</Label>
                  <Textarea 
                    id="observacoes-dist" 
                    name="observacoes-dist"
                    placeholder="Informações adicionais sobre a distribuição..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registrando..." : "Registrar Distribuição"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Distribuições Recentes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Distribuições Recentes</h2>
          
          {distribuicoes.map((distribuicao) => (
            <Card key={distribuicao.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{formatarData(distribuicao.data_distribuicao)}</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{distribuicao.beneficiario?.nome}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">Itens distribuídos:</p>
                          <div className="flex flex-wrap gap-1">
                            {distribuicao.itens_distribuicao?.map((item, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {item.quantidade}x {item.produto?.nome}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p><strong>Responsável:</strong> {distribuicao.created_by_name || 'Sistema'}</p>
                      {distribuicao.observacoes && (
                        <p className="italic mt-1">{distribuicao.observacoes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => abrirDetalhes(distribuicao)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => abrirCancelamento(distribuicao)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {distribuicoes.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma distribuição cadastrada
                </h3>
                <p className="text-gray-600">
                  Comece registrando a primeira distribuição de itens.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal de Detalhes da Distribuição */}
        <Dialog open={showDetalhesModal} onOpenChange={setShowDetalhesModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Detalhes da Distribuição
              </DialogTitle>
              <DialogDescription>
                Informações completas sobre a distribuição realizada
              </DialogDescription>
            </DialogHeader>
            
            {selectedDistribuicao && (
              <div className="space-y-6">
                {/* Informações Gerais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Data da Distribuição</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{formatarData(selectedDistribuicao.data_distribuicao)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {selectedDistribuicao.status || 'Concluída'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Informações do Beneficiário */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Beneficiário</Label>
                  <div className="p-4 bg-blue-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        {selectedDistribuicao.beneficiario?.nome || selectedDistribuicao.beneficiarios?.nome}
                      </span>
                    </div>
                    {(() => {
                      const beneficiario = beneficiarios.find(b => b.id === selectedDistribuicao.beneficiario_id);
                      if (beneficiario) {
                        return (
                          <div className="text-sm text-blue-700 space-y-1">
                            <p><strong>CPF:</strong> {beneficiario.cpf}</p>
                            <p><strong>Idade:</strong> {calcularIdade(beneficiario.data_nascimento)} anos</p>
                            <p><strong>Telefone:</strong> {beneficiario.telefone}</p>
                            <p><strong>Endereço:</strong> {beneficiario.endereco}</p>
                            <p><strong>Dependentes:</strong> {beneficiario.numero_dependentes}</p>
                            <p><strong>Limite Mensal:</strong> {beneficiario.limite_mensal_real} itens</p>
                            <p><strong>Limite Usado:</strong> {beneficiario.limite_usado_atual} itens</p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Itens Distribuídos */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Itens Distribuídos</Label>
                  <div className="space-y-2">
                    {selectedDistribuicao.itens_distribuicao?.map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.produto?.nome || item.produtos?.nome}
                              </p>
                              <p className="text-sm text-gray-600">
                                Categoria: {item.produto?.categoria?.nome || item.produtos?.categorias_produtos?.nome}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {item.quantidade} unidades
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Resumo dos Itens */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Total de Itens Distribuídos:</span>
                      <span className="text-lg font-bold text-green-900">
                        {selectedDistribuicao.itens_distribuicao?.reduce((total, item) => total + item.quantidade, 0) || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {selectedDistribuicao.observacoes && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Observações</Label>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800 italic">
                        {selectedDistribuicao.observacoes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Informações do Sistema */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Registrado em:</strong> {formatarDataHora(selectedDistribuicao.created_at)}</p>
                    </div>
                    <div>
                      <p><strong>Responsável:</strong> {selectedDistribuicao.created_by_name || 'Sistema'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
                     </DialogContent>
         </Dialog>

         {/* Modal de Confirmação de Cancelamento */}
         <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
           <DialogContent className="max-w-md">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-red-600">
                 <X className="h-5 w-5" />
                 Cancelar Distribuição
               </DialogTitle>
               <DialogDescription>
                 Esta ação não pode ser desfeita. Tem certeza que deseja cancelar esta distribuição?
               </DialogDescription>
             </DialogHeader>
             
             {distribuicaoParaCancelar && (
               <div className="space-y-4">
                 {/* Informações da Distribuição */}
                 <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <User className="h-4 w-4 text-red-600" />
                       <span className="font-medium text-red-900">
                         {distribuicaoParaCancelar.beneficiario?.nome || distribuicaoParaCancelar.beneficiarios?.nome}
                       </span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Calendar className="h-4 w-4 text-red-600" />
                       <span className="text-sm text-red-700">
                         {formatarData(distribuicaoParaCancelar.data_distribuicao)}
                       </span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Package className="h-4 w-4 text-red-600" />
                       <span className="text-sm text-red-700">
                         {distribuicaoParaCancelar.itens_distribuicao?.reduce((total, item) => total + item.quantidade, 0) || 0} itens
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* Itens que serão devolvidos */}
                 <div className="space-y-2">
                   <p className="text-sm font-medium text-gray-700">Itens que retornarão ao estoque:</p>
                   <div className="space-y-1">
                     {distribuicaoParaCancelar.itens_distribuicao?.map((item, index) => (
                       <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                         <span>{item.produto?.nome || item.produtos?.nome}</span>
                         <span className="font-medium">+{item.quantidade}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Aviso importante */}
                 <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                   <p className="text-sm text-yellow-800">
                     <strong>⚠️ Atenção:</strong> O limite usado do beneficiário será reduzido e os itens retornarão ao estoque.
                   </p>
                 </div>

                 {/* Botões de ação */}
                 <div className="flex gap-2 pt-4">
                   <Button 
                     variant="destructive" 
                     onClick={cancelarDistribuicao}
                     disabled={isCanceling}
                     className="flex-1"
                   >
                     {isCanceling ? "Cancelando..." : "Sim, Cancelar Distribuição"}
                   </Button>
                   <Button 
                     variant="outline" 
                     onClick={() => setShowCancelModal(false)}
                     disabled={isCanceling}
                     className="flex-1"
                   >
                     Não, Manter
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

export default Distribuicao;
