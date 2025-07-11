import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Search, Filter, TrendingDown, TrendingUp, AlertTriangle, AlertCircle, Plus, History, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GridBackground } from "@/components/ui/grid-background";

interface Categoria {
  id: string;
  nome: string;
}

interface Produto {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  quantidade_estoque: number;
  quantidade_minima: number;
  valor_estimado: number | null;
  tamanho: string | null;
  condicao: string | null;
  cor?: string | null;
  created_at: string;
  updated_at: string | null;
  categoria?: {
    nome: string;
  };
  ultima_entrada?: string;
  ultima_saida?: string;
}

const Estoque = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedTamanho, setSelectedTamanho] = useState("");
  const [selectedCondicao, setSelectedCondicao] = useState("");
  
  // Estados para modais
  const [historicoModal, setHistoricoModal] = useState<{ open: boolean; produto: Produto | null }>({
    open: false,
    produto: null
  });
  const [ajusteModal, setAjusteModal] = useState<{ open: boolean; produto: Produto | null }>({
    open: false,
    produto: null
  });
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [ajusteQuantidade, setAjusteQuantidade] = useState("");
  const [ajusteMotivo, setAjusteMotivo] = useState("");
  const [tipoAjuste, setTipoAjuste] = useState<"entrada" | "saida">("entrada");
  const [processandoAjuste, setProcessandoAjuste] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const filteredItens = produtos.filter(produto => {
    const matchesSearch = produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || produto.categoria?.nome === categoryFilter;
    const matchesSize = sizeFilter === "all" || produto.tamanho === sizeFilter;
    const hasStock = produto.quantidade_estoque > 0; // Apenas produtos com estoque
    return matchesSearch && matchesCategory && matchesSize && hasStock;
  });

  const getQuantidadeStatus = (quantidade: number, minimo: number) => {
    if (quantidade <= minimo * 0.5) return { color: "text-red-600", bg: "bg-red-50", status: "Crítico" };
    if (quantidade <= minimo) return { color: "text-orange-600", bg: "bg-orange-50", status: "Baixo" };
    return { color: "text-green-600", bg: "bg-green-50", status: "Normal" };
  };

  const getCondicaoColor = (condicao: string) => {
    switch (condicao) {
      case "Ótimo":
        return "bg-green-100 text-green-800";
      case "Bom":
        return "bg-blue-100 text-blue-800";
      case "Regular":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Considerar apenas produtos com estoque para as estatísticas
  const produtosComEstoque = produtos.filter(produto => produto.quantidade_estoque > 0);
  const totalItens = produtosComEstoque.reduce((sum, produto) => sum + produto.quantidade_estoque, 0);
  const itensAbaixoMinimo = produtosComEstoque.filter(produto => produto.quantidade_estoque <= produto.quantidade_minima).length;
  const itensCriticos = produtosComEstoque.filter(produto => produto.quantidade_estoque <= produto.quantidade_minima * 0.5).length;

  // Carregar produtos do banco
  const fetchProdutos = async () => {
    setLoadingProdutos(true);
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categoria:categorias_produtos(nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "❌ Erro ao carregar",
        description: "Não foi possível carregar os produtos do estoque.",
        variant: "destructive",
      });
    } finally {
      setLoadingProdutos(false);
    }
  };

  // Carregar categorias
  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_produtos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
  }, []);

  const handleSubmitNovoItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      // Validar campos obrigatórios
      if (!selectedCategoria) {
        toast({
          title: "❌ Categoria obrigatória",
          description: "Por favor, selecione uma categoria para o produto.",
          variant: "destructive",
        });
        return;
      }
      
      const produtoData = {
        categoria_id: selectedCategoria,
        nome: formData.get('tipo') as string,
        descricao: formData.get('observacoes') as string || null,
        quantidade_estoque: parseInt(formData.get('quantidade') as string),
        quantidade_minima: parseInt(formData.get('minimo') as string),
        tamanho: selectedTamanho || null,
        condicao: selectedCondicao || null
      };

      const { error } = await supabase
        .from('produtos')
        .insert([produtoData]);

      if (error) throw error;

      toast({
        title: "✅ Item adicionado!",
        description: "O item foi adicionado ao estoque com sucesso.",
      });
      
      setIsModalOpen(false);
      setSelectedCategoria("");
      setSelectedTamanho("");
      setSelectedCondicao("");
      fetchProdutos(); // Recarregar lista
      
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "❌ Erro ao adicionar",
        description: "Não foi possível adicionar o item ao estoque.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para abrir modal de histórico
  const abrirHistorico = async (produto: Produto) => {
    setHistoricoModal({ open: true, produto });
    setLoadingHistorico(true);
    
    try {
      const { data, error } = await supabase
        .from('movimentacoes_estoque')
        .select('*')
        .eq('produto_id', produto.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovimentacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "❌ Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico do produto.",
        variant: "destructive",
      });
    } finally {
      setLoadingHistorico(false);
    }
  };

  // Função para fechar modal de histórico
  const fecharHistorico = () => {
    setHistoricoModal({ open: false, produto: null });
    setMovimentacoes([]);
  };

  // Função para abrir modal de ajuste
  const abrirAjuste = (produto: Produto) => {
    setAjusteModal({ open: true, produto });
    setAjusteQuantidade("");
    setAjusteMotivo("");
    setTipoAjuste("entrada");
  };

  // Função para fechar modal de ajuste
  const fecharAjuste = () => {
    setAjusteModal({ open: false, produto: null });
    setAjusteQuantidade("");
    setAjusteMotivo("");
    setTipoAjuste("entrada");
  };

  // Função para processar ajuste de estoque
  const processarAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ajusteModal.produto) return;
    
    setProcessandoAjuste(true);
    
    try {
      const quantidade = parseInt(ajusteQuantidade);
      if (isNaN(quantidade) || quantidade <= 0) {
        toast({
          title: "❌ Quantidade inválida",
          description: "Por favor, informe uma quantidade válida maior que zero.",
          variant: "destructive",
        });
        return;
      }

      const produto = ajusteModal.produto;
      const quantidadeAnterior = produto.quantidade_estoque;
      let quantidadeNova: number;

      if (tipoAjuste === "entrada") {
        quantidadeNova = quantidadeAnterior + quantidade;
      } else {
        quantidadeNova = quantidadeAnterior - quantidade;
        if (quantidadeNova < 0) {
          toast({
            title: "❌ Quantidade insuficiente",
            description: "Não é possível retirar mais itens do que existe no estoque.",
            variant: "destructive",
          });
          return;
        }
      }

      // Atualizar quantidade no produto
      const { error: updateError } = await supabase
        .from('produtos')
        .update({ quantidade_estoque: quantidadeNova })
        .eq('id', produto.id);

      if (updateError) throw updateError;

      // Registrar movimentação
      const { error: movError } = await supabase
        .from('movimentacoes_estoque')
        .insert([{
          produto_id: produto.id,
          tipo_movimentacao: tipoAjuste === "entrada" ? "Entrada" : "Saída",
          quantidade: quantidade,
          quantidade_anterior: quantidadeAnterior,
          quantidade_nova: quantidadeNova,
          motivo: ajusteMotivo || `Ajuste manual - ${tipoAjuste}`,
          referencia_tipo: 'ajuste_manual'
        }]);

      if (movError) throw movError;

      toast({
        title: "✅ Estoque ajustado!",
        description: `${tipoAjuste === "entrada" ? "Adicionados" : "Removidos"} ${quantidade} item(ns) do estoque.`,
      });

      fecharAjuste();
      fetchProdutos(); // Recarregar produtos

    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
      toast({
        title: "❌ Erro ao ajustar",
        description: "Não foi possível ajustar o estoque. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessandoAjuste(false);
    }
  };

  return (
    <GridBackground className="flex-1 min-h-screen">
      <main className="p-6">
        <div className="mb-6 flex items-center gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Estoque</h1>
            <p className="text-muted-foreground">Gerencie todos os itens disponíveis na SANEM</p>
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
              Total de Itens
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{totalItens}</div>
            <p className="text-xs text-muted-foreground mt-1">Em estoque</p>
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
              Produtos Disponíveis
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{produtosComEstoque.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Com estoque</p>
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
              Abaixo do Mínimo
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{itensAbaixoMinimo}</div>
            <p className="text-xs text-muted-foreground mt-1">Precisam reposição</p>
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
              Situação Crítica
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{itensCriticos}</div>
            <p className="text-xs text-muted-foreground mt-1">Itens zerados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.nome}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tamanhos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tamanhos</SelectItem>
                <SelectItem value="P">P</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="G">G</SelectItem>
                <SelectItem value="GG">GG</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens em Estoque */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Itens em Estoque ({filteredItens.length})
          </h2>
          {user?.role === 'superadmin' && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item Manual
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Adicionar Item ao Estoque</DialogTitle>
                <DialogDescription>
                  Cadastre um novo item manualmente no estoque da SANEM.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitNovoItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo do Item *</Label>
                    <Input id="tipo" name="tipo" placeholder="Ex: Camiseta, Calça, Sapato..." required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={selectedCategoria} onValueChange={setSelectedCategoria} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tamanho">Tamanho</Label>
                    <Select value={selectedTamanho} onValueChange={setSelectedTamanho}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PP">PP</SelectItem>
                        <SelectItem value="P">P</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="GG">GG</SelectItem>
                        <SelectItem value="XGG">XGG</SelectItem>
                        <SelectItem value="N/A">Não se aplica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input id="quantidade" name="quantidade" type="number" min="1" placeholder="0" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimo">Quantidade Mínima *</Label>
                    <Input id="minimo" name="minimo" type="number" min="0" placeholder="0" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condicao">Condição do Item</Label>
                  <Select value={selectedCondicao} onValueChange={setSelectedCondicao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a condição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ótimo">Ótimo</SelectItem>
                      <SelectItem value="Bom">Bom</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Usado">Usado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea 
                    id="observacoes" 
                    name="observacoes"
                    placeholder="Informações adicionais sobre o item (cor, marca, detalhes específicos...)"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adicionando..." : "Adicionar Item"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>

        <div className="grid gap-4">
          {loadingProdutos ? (
            <div className="text-center py-8">
              <Settings className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Carregando produtos...</p>
            </div>
          ) : (
            filteredItens.map((produto) => {
              const status = getQuantidadeStatus(produto.quantidade_estoque, produto.quantidade_minima);
              
              return (
                <Card key={produto.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {produto.nome}
                          </h3>
                          <Badge variant="outline">
                            {produto.categoria?.nome || 'Sem categoria'}
                          </Badge>
                          {produto.condicao && (
                            <Badge className={getCondicaoColor(produto.condicao)}>
                              {produto.condicao}
                            </Badge>
                          )}
                        </div>

                        {produto.descricao && (
                          <p className="text-sm text-gray-600 mb-3">{produto.descricao}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium">Tamanho</p>
                            <p>{produto.tamanho || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Quantidade</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${status.color}`}>
                                {produto.quantidade_estoque}
                              </span>
                              <div className={`px-2 py-1 rounded text-xs ${status.bg} ${status.color}`}>
                                {status.status}
                              </div>
                            </div>
                            <p className="text-xs">Mín: {produto.quantidade_minima}</p>
                          </div>
                          <div>
                            <p className="font-medium">Valor Estimado</p>
                            <p>{produto.valor_estimado ? `R$ ${produto.valor_estimado.toFixed(2)}` : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Última adição em</p>
                            <p>{new Date(produto.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => abrirHistorico(produto)}
                        >
                          <History className="h-4 w-4 mr-1" />
                          Ver Histórico
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => abrirAjuste(produto)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Ajustar Estoque
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {filteredItens.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum item encontrado
              </h3>
              <p className="text-gray-600">
                {searchTerm || categoryFilter || sizeFilter 
                  ? "Tente ajustar os filtros de busca." 
                  : "O estoque está vazio."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Histórico */}
      <Dialog open={historicoModal.open} onOpenChange={fecharHistorico}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Movimentações</DialogTitle>
            <DialogDescription>
              {historicoModal.produto && `Histórico completo do produto: ${historicoModal.produto.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          {loadingHistorico ? (
            <div className="text-center py-8">
              <Settings className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Carregando histórico...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {movimentacoes.length > 0 ? (
                <div className="space-y-3">
                  {movimentacoes.map((mov, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={mov.tipo_movimentacao === 'Entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {mov.tipo_movimentacao}
                          </Badge>
                          <span className="font-medium">
                            {mov.tipo_movimentacao === 'Entrada' ? '+' : '-'}{mov.quantidade} unidades
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{mov.motivo}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(mov.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {mov.quantidade_anterior} → {mov.quantidade_nova}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma movimentação encontrada
                  </h3>
                  <p className="text-gray-600">
                    Este produto ainda não possui histórico de movimentações.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Ajuste de Estoque */}
      <Dialog open={ajusteModal.open} onOpenChange={fecharAjuste}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajustar Estoque</DialogTitle>
            <DialogDescription>
              {ajusteModal.produto && `Ajustar quantidade do produto: ${ajusteModal.produto.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          {ajusteModal.produto && (
            <form onSubmit={processarAjuste} className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Situação Atual</h4>
                <p className="text-sm text-gray-600">
                  <strong>Produto:</strong> {ajusteModal.produto.nome}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Quantidade atual:</strong> {ajusteModal.produto.quantidade_estoque} unidades
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Quantidade mínima:</strong> {ajusteModal.produto.quantidade_minima} unidades
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Ajuste</Label>
                <Select value={tipoAjuste} onValueChange={(value: "entrada" | "saida") => setTipoAjuste(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada (Adicionar ao estoque)</SelectItem>
                    <SelectItem value="saida">Saída (Remover do estoque)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input 
                  id="quantidade"
                  type="number"
                  min="1"
                  value={ajusteQuantidade}
                  onChange={(e) => setAjusteQuantidade(e.target.value)}
                  placeholder="Ex: 10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo do Ajuste</Label>
                <Textarea 
                  id="motivo"
                  value={ajusteMotivo}
                  onChange={(e) => setAjusteMotivo(e.target.value)}
                  placeholder="Ex: Correção de inventário, doação não registrada, perda..."
                  rows={3}
                />
              </div>

              {tipoAjuste === "saida" && ajusteQuantidade && 
               parseInt(ajusteQuantidade) > ajusteModal.produto.quantidade_estoque && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    ⚠️ Atenção: Você está tentando remover mais itens do que existe no estoque.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={fecharAjuste}
                  disabled={processandoAjuste}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className={tipoAjuste === "entrada" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                  disabled={processandoAjuste}
                >
                  {processandoAjuste ? (
                    <>
                      <Settings className="h-4 w-4 mr-1 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      {tipoAjuste === "entrada" ? "Adicionar ao Estoque" : "Remover do Estoque"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      </main>
    </GridBackground>
  );
};

export default Estoque;
