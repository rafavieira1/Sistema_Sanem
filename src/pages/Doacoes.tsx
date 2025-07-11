import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gift, Plus, Calendar, Package, User, CheckCircle, Clock, TrendingUp, X, Eye, Settings, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GridBackground } from "@/components/ui/grid-background";
import { supabase } from "@/integrations/supabase/client";

interface Doador {
  id: string;
  nome: string;
  cpf_cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  tipo: string | null;
  created_at: string | null;
}

interface Doacao {
  id: string;
  doador_id: string | null;
  data_doacao: string;
  tipo_doacao: string | null;
  valor_total: number | null;
  observacoes: string | null;
  status: string | null;
  created_at: string | null;
  created_by: string | null;
  created_by_name: string | null;
  updated_at: string | null;
  doador?: {
    nome: string;
  };
  itens_doacao?: Array<{
    id: string;
    quantidade: number;
    observacoes: string | null;
    valor_unitario: number | null;
  }>;
}

const Doacoes = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [doadores, setDoadores] = useState<Doador[]>([]);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [selectedDoador, setSelectedDoador] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  
  // Estados para gerenciar itens da doação
  const [itensDoacao, setItensDoacao] = useState<Array<{
    categoria: string;
    descricao: string;
    quantidade: number;
    observacoes?: string;
    valorMonetario?: string;
  }>>([]);
  const [itemDescricao, setItemDescricao] = useState("");
  const [itemQuantidade, setItemQuantidade] = useState<number>(0);
  const [itemValorMonetario, setItemValorMonetario] = useState("");
  
  // Estados para modais
  const [detalhesModal, setDetalhesModal] = useState<{ open: boolean; doacao: Doacao | null }>({
    open: false,
    doacao: null
  });
  const [processandoDoacao, setProcessandoDoacao] = useState<string | null>(null);
  const [cancelandoDoacao, setCancelandoDoacao] = useState<string | null>(null);

  // Função para formatar valor monetário
  const formatarValorMonetario = (valor: string) => {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // Se não há números, retorna vazio
    if (!apenasNumeros) return '';
    
    // Converte para centavos
    const valorEmCentavos = parseInt(apenasNumeros, 10);
    
    // Converte para reais
    const valorEmReais = valorEmCentavos / 100;
    
    // Formata como moeda brasileira
    return valorEmReais.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleValorMonetarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const valorFormatado = formatarValorMonetario(valor);
    setItemValorMonetario(valorFormatado);
  };

  // Carregar doadores e doações
  useEffect(() => {
    fetchDoadores();
    fetchDoacoes();
  }, []);

  // Limpar valor monetário quando categoria muda
  useEffect(() => {
    if (selectedCategoria !== "dinheiro") {
      setItemValorMonetario("");
    }
  }, [selectedCategoria]);

  const fetchDoadores = async () => {
    try {
      const { data, error } = await supabase
        .from('doadores')
        .select('*')
        .order('nome');

      if (error) {
        throw error;
      }

      setDoadores(data || []);
    } catch (error) {
      console.error('Erro ao carregar doadores:', error);
      toast({
        title: "❌ Erro ao carregar doadores",
        description: "Não foi possível carregar a lista de doadores.",
        variant: "destructive",
      });
    }
  };

  const fetchDoacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('doacoes')
        .select(`
          *,
          doador:doadores(nome),
          itens_doacao(
            id,
            quantidade,
            observacoes,
            valor_unitario
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDoacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar doações:', error);
      toast({
        title: "❌ Erro ao carregar doações",
        description: "Não foi possível carregar a lista de doações.",
        variant: "destructive",
      });
    }
  };

  const adicionarItem = () => {
    if (!selectedCategoria) {
      toast({
        title: "❌ Erro",
        description: "Selecione uma categoria para adicionar o item.",
        variant: "destructive",
      });
      return;
    }

    // Para categorias que não são dinheiro, descrição é obrigatória
    if (selectedCategoria !== "dinheiro" && !itemDescricao) {
      toast({
        title: "❌ Erro",
        description: "Preencha a descrição para adicionar o item.",
        variant: "destructive",
      });
      return;
    }

    // Validação específica para dinheiro
    if (selectedCategoria === "dinheiro") {
      if (!itemValorMonetario || parseFloat(itemValorMonetario.replace(/[^\d,.-]/g, '').replace(',', '.')) <= 0) {
        toast({
          title: "❌ Erro",
          description: "Para doações em dinheiro, informe um valor válido maior que zero.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (itemQuantidade <= 0) {
        toast({
          title: "❌ Erro",
          description: "Informe uma quantidade válida para o item.",
          variant: "destructive",
        });
        return;
      }
    }

    // Para dinheiro, usar descrição padrão se não informada
    const descricaoFinal = selectedCategoria === "dinheiro" && !itemDescricao 
      ? "Doação em dinheiro" 
      : itemDescricao;

    const novoItem = {
      categoria: selectedCategoria,
      descricao: descricaoFinal,
      quantidade: selectedCategoria === "dinheiro" ? 1 : itemQuantidade,
      valorMonetario: selectedCategoria === "dinheiro" ? itemValorMonetario : undefined,
    };

    setItensDoacao([...itensDoacao, novoItem]);
    
    // Limpar campos do item
    setSelectedCategoria("");
    setItemDescricao("");
    setItemQuantidade(0);
    setItemValorMonetario("");

    const descricaoItem = selectedCategoria === "dinheiro" 
      ? `${itemValorMonetario} - ${descricaoFinal}` 
      : `${itemQuantidade}x ${descricaoFinal}`;

    toast({
      title: "✅ Item adicionado!",
      description: `${descricaoItem} (${selectedCategoria}) adicionado à doação.`,
    });
  };

  const removerItem = (index: number) => {
    const novosItens = itensDoacao.filter((_, i) => i !== index);
    setItensDoacao(novosItens);
    
    toast({
      title: "✅ Item removido!",
      description: "Item removido da doação.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoador) {
      toast({
        title: "❌ Erro no cadastro",
        description: "Por favor, selecione um doador.",
        variant: "destructive",
      });
      return;
    }

    if (itensDoacao.length === 0) {
      toast({
        title: "❌ Erro no cadastro",
        description: "Adicione pelo menos um item à doação.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      // Validar data da doação
      const dataDoacao = formData.get('data-doacao') as string;
      if (!dataDoacao) {
        toast({
          title: "❌ Erro no cadastro",
          description: "A data da doação é obrigatória.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Verificar se há doação em dinheiro
      const temDinheiroValidacao = itensDoacao.some(item => item.categoria === "dinheiro");
      
      // Determinar tipo de doação baseado nos itens
      const temProdutos = itensDoacao.some(item => item.categoria !== "dinheiro");
      let tipoDoacao = 'Produtos';
      if (temDinheiroValidacao && temProdutos) {
        tipoDoacao = 'Mista';
      } else if (temDinheiroValidacao && !temProdutos) {
        tipoDoacao = 'Dinheiro';
      }
      
      // Calcular valor total baseado nos itens de dinheiro
      let valorTotal = null;
      if (temDinheiroValidacao) {
        valorTotal = itensDoacao
          .filter(item => item.categoria === "dinheiro")
          .reduce((total, item) => {
            const valor = item.valorMonetario?.replace(/[^\d,.-]/g, '').replace(',', '.') || '0';
            return total + parseFloat(valor);
          }, 0);
      }
      
      // Criar doação principal
      const doacaoData = {
        doador_id: selectedDoador,
        data_doacao: dataDoacao,
        tipo_doacao: tipoDoacao,
        valor_total: valorTotal,
        observacoes: formData.get('observacoes') as string || null,
        status: 'Pendente',
        created_by: user?.id
      };

      const { data: doacaoInserida, error: doacaoError } = await supabase
        .from('doacoes')
        .insert([doacaoData])
        .select()
        .single();

      if (doacaoError) {
        throw doacaoError;
      }

      // Inserir itens da doação na tabela itens_doacao
      const itensParaInserir = itensDoacao.map(item => ({
        doacao_id: doacaoInserida.id,
        produto_id: null, // Permitir null já que o campo é nullable
        quantidade: item.quantidade,
        observacoes: `${item.categoria}: ${item.descricao}`,
        valor_unitario: null // Pode ser implementado posteriormente
      }));

      const { error: itensError } = await supabase
        .from('itens_doacao')
        .insert(itensParaInserir);

      if (itensError) {
        throw itensError;
      }

      toast({
        title: "✅ Doação registrada!",
        description: `Doação com ${itensDoacao.length} item(ns) cadastrada com sucesso.`,
      });

      // Limpar formulário e estados
      (e.target as HTMLFormElement).reset();
      setSelectedDoador("");
      setSelectedCategoria("");
      setItensDoacao([]);
      setItemDescricao("");
      setItemQuantidade(1);
      setShowForm(false);
      
      // Recarregar doações
      fetchDoacoes();
      
    } catch (error) {
      console.error('Erro ao registrar doação:', error);
      toast({
        title: "❌ Erro no cadastro",
        description: "Ocorreu um erro ao registrar a doação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processada":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const abrirDetalhes = (doacao: Doacao) => {
    setDetalhesModal({ open: true, doacao });
  };

  const fecharDetalhes = () => {
    setDetalhesModal({ open: false, doacao: null });
  };

  const processarDoacao = async (doacaoId: string) => {
    setProcessandoDoacao(doacaoId);
    
    try {
      // 1. Buscar detalhes da doação e seus itens
      const { data: doacao, error: doacaoError } = await supabase
        .from('doacoes')
        .select(`
          *,
          itens_doacao(*)
        `)
        .eq('id', doacaoId)
        .single();

      if (doacaoError) throw doacaoError;

      // 2. Para cada item que não é dinheiro, adicionar ao estoque
      const itensParaEstoque = doacao.itens_doacao.filter(item => 
        !item.observacoes?.toLowerCase().includes('dinheiro')
      );

      for (const item of itensParaEstoque) {
        // Extrair categoria e descrição das observações
        const observacoes = item.observacoes || '';
        const [categoria, descricao] = observacoes.split(': ');
        
        // Verificar se já existe um produto similar no estoque
        const { data: produtoExistente, error: buscaError } = await supabase
          .from('produtos')
          .select('*')
          .eq('nome', descricao)
          .eq('categoria_id', (await getCategoriaId(categoria)))
          .maybeSingle();

        if (buscaError && buscaError.code !== 'PGRST116') throw buscaError;

        if (produtoExistente) {
          // Atualizar quantidade do produto existente
          const { error: updateError } = await supabase
            .from('produtos')
            .update({ 
              quantidade_estoque: produtoExistente.quantidade_estoque + item.quantidade 
            })
            .eq('id', produtoExistente.id);

          if (updateError) throw updateError;

          // Registrar movimentação de estoque
          await registrarMovimentacaoEstoque(
            produtoExistente.id,
            'Entrada',
            item.quantidade,
            produtoExistente.quantidade_estoque,
            produtoExistente.quantidade_estoque + item.quantidade,
            'Doação processada',
            doacaoId,
            'doacao'
          );
        } else {
          // Criar novo produto no estoque
          const { data: novoProduto, error: createError } = await supabase
            .from('produtos')
            .insert([{
              categoria_id: await getCategoriaId(categoria),
              nome: descricao,
              descricao: `Produto recebido via doação`,
              quantidade_estoque: item.quantidade,
              quantidade_minima: 5, // Valor padrão
              valor_estimado: null
            }])
            .select()
            .single();

          if (createError) throw createError;

          // Registrar movimentação de estoque
          await registrarMovimentacaoEstoque(
            novoProduto.id,
            'Entrada',
            item.quantidade,
            0,
            item.quantidade,
            'Doação processada - novo produto',
            doacaoId,
            'doacao'
          );
        }
      }

      // 3. Atualizar status da doação para "Processada"
      const { error: updateDoacaoError } = await supabase
        .from('doacoes')
        .update({ status: 'Processada' })
        .eq('id', doacaoId);

      if (updateDoacaoError) throw updateDoacaoError;

      toast({
        title: "✅ Doação processada!",
        description: `Doação processada com sucesso. ${itensParaEstoque.length} item(ns) adicionado(s) ao estoque.`,
      });

      // Recarregar doações
      fetchDoacoes();

    } catch (error) {
      console.error('Erro ao processar doação:', error);
      toast({
        title: "❌ Erro ao processar",
        description: "Ocorreu um erro ao processar a doação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessandoDoacao(null);
    }
  };

  // Função auxiliar para obter ID da categoria
  const getCategoriaId = async (nomeCategoria: string): Promise<string> => {
    const mapeamento: { [key: string]: string } = {
      'roupas': 'Roupas',
      'calcados': 'Calçados',
      'acessorios': 'Acessórios',
      'utensilios': 'Utensílios',
      'alimentos': 'Alimentos',
      'outros': 'Outros'
    };

    const nomeFormatado = mapeamento[nomeCategoria.toLowerCase()] || 'Outros';

    const { data: categoria, error } = await supabase
      .from('categorias_produtos')
      .select('id')
      .eq('nome', nomeFormatado)
      .single();

    if (error) {
      // Se não encontrar, criar a categoria
      const { data: novaCategoria, error: createError } = await supabase
        .from('categorias_produtos')
        .insert([{ nome: nomeFormatado }])
        .select('id')
        .single();

      if (createError) throw createError;
      return novaCategoria.id;
    }

    return categoria.id;
  };

  // Função auxiliar para registrar movimentação de estoque
  const registrarMovimentacaoEstoque = async (
    produtoId: string,
    tipo: string,
    quantidade: number,
    quantidadeAnterior: number,
    quantidadeNova: number,
    motivo: string,
    referenciaId: string,
    referenciaTipo: string
  ) => {
    const { error } = await supabase
      .from('movimentacoes_estoque')
      .insert([{
        produto_id: produtoId,
        tipo_movimentacao: tipo,
        quantidade,
        quantidade_anterior: quantidadeAnterior,
        quantidade_nova: quantidadeNova,
        motivo,
        referencia_id: referenciaId,
        referencia_tipo: referenciaTipo,
        created_by: user?.id
      }]);

    if (error) throw error;
  };

  const cancelarDoacao = async (doacaoId: string) => {
    setCancelandoDoacao(doacaoId);
    
    try {
      // 1. Buscar detalhes da doação e seus itens
      const { data: doacao, error: doacaoError } = await supabase
        .from('doacoes')
        .select(`
          *,
          itens_doacao(*)
        `)
        .eq('id', doacaoId)
        .single();

      if (doacaoError) throw doacaoError;

      // 2. Se a doação foi processada, reverter itens do estoque
      if (doacao.status === 'Processada') {
        const itensParaReverter = doacao.itens_doacao.filter(item => 
          !item.observacoes?.toLowerCase().includes('dinheiro')
        );

        for (const item of itensParaReverter) {
          // Extrair categoria e descrição das observações
          const observacoes = item.observacoes || '';
          const [categoria, descricao] = observacoes.split(': ');
          
          // Buscar produto no estoque
          const { data: produto, error: buscaError } = await supabase
            .from('produtos')
            .select('*')
            .eq('nome', descricao)
            .eq('categoria_id', (await getCategoriaId(categoria)))
            .single();

          if (buscaError) {
            console.warn(`Produto não encontrado no estoque: ${descricao}`);
            continue;
          }

          // Verificar se há quantidade suficiente para remover
          const novaQuantidade = produto.quantidade_estoque - item.quantidade;
          
          if (novaQuantidade < 0) {
            toast({
              title: "⚠️ Atenção",
              description: `Não há quantidade suficiente de "${descricao}" no estoque para cancelar completamente a doação.`,
              variant: "destructive",
            });
            continue;
          }

          // Atualizar quantidade do produto (remover do estoque)
          const { error: updateError } = await supabase
            .from('produtos')
            .update({ 
              quantidade_estoque: novaQuantidade
            })
            .eq('id', produto.id);

          if (updateError) throw updateError;

          // Registrar movimentação de estoque (saída)
          await registrarMovimentacaoEstoque(
            produto.id,
            'Saída',
            item.quantidade,
            produto.quantidade_estoque,
            novaQuantidade,
            'Doação cancelada',
            doacaoId,
            'cancelamento_doacao'
          );
        }
      }

      // 3. Excluir itens da doação
      const { error: deleteItensError } = await supabase
        .from('itens_doacao')
        .delete()
        .eq('doacao_id', doacaoId);

      if (deleteItensError) throw deleteItensError;

      // 4. Excluir a doação
      const { error: deleteDoacaoError } = await supabase
        .from('doacoes')
        .delete()
        .eq('id', doacaoId);

      if (deleteDoacaoError) throw deleteDoacaoError;

      toast({
        title: "✅ Doação cancelada!",
        description: doacao.status === 'Processada' 
          ? "Doação cancelada e itens removidos do estoque."
          : "Doação cancelada com sucesso.",
      });

      // Recarregar doações
      fetchDoacoes();

    } catch (error) {
      console.error('Erro ao cancelar doação:', error);
      toast({
        title: "❌ Erro ao cancelar",
        description: "Ocorreu um erro ao cancelar a doação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCancelandoDoacao(null);
    }
  };

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);

    // Doações deste mês
    const doacoesEsteMes = doacoes.filter(doacao => {
      // Garantir que a data seja interpretada corretamente (formato YYYY-MM-DD)
      const dataDoacao = new Date(doacao.data_doacao + 'T00:00:00');
      return dataDoacao >= inicioMes && dataDoacao <= fimMes;
    });

    // Valor total arrecadado este mês (apenas doações processadas)
    const doacoesProcessadasMes = doacoesEsteMes.filter(doacao => doacao.status === 'Processada');
    const valorTotalMes = doacoesProcessadasMes.reduce((total, doacao) => total + (doacao.valor_total || 0), 0);
    
    // Total de dinheiro recebido (histórico completo) - apenas doações de dinheiro processadas
    const totalDinheiroRecebido = doacoes
      .filter(doacao => doacao.status === 'Processada' && doacao.tipo_doacao === 'Dinheiro')
      .reduce((total, doacao) => total + (doacao.valor_total || 0), 0);
    
    // Dinheiro recebido este mês - apenas doações de dinheiro processadas
    const dinheiroRecebidoMes = doacoesEsteMes
      .filter(doacao => doacao.status === 'Processada' && doacao.tipo_doacao === 'Dinheiro')
      .reduce((total, doacao) => total + (doacao.valor_total || 0), 0);
    


    // Total de itens recebidos este mês (excluindo doações de dinheiro)
    const itensRecebidosMes = doacoesEsteMes
      .filter(doacao => doacao.status === 'Processada' && doacao.tipo_doacao !== 'Dinheiro')
      .reduce((total, doacao) => {
        const totalItens = doacao.itens_doacao?.reduce((sum, item) => sum + item.quantidade, 0) || 0;
        return total + totalItens;
      }, 0);

    // Total histórico de itens recebidos (excluindo doações de dinheiro)
    const totalItensRecebidos = doacoes
      .filter(doacao => doacao.status === 'Processada' && doacao.tipo_doacao !== 'Dinheiro')
      .reduce((total, doacao) => {
        const totalItens = doacao.itens_doacao?.reduce((sum, item) => sum + item.quantidade, 0) || 0;
        return total + totalItens;
      }, 0);



    // Doações pendentes (geral, não só deste mês)
    const pendentesMes = doacoes.filter(doacao => doacao.status === 'Pendente').length;
    
    // Total geral de doações processadas (todas as datas)
    const totalProcessadas = doacoes.filter(doacao => doacao.status === 'Processada').length;

    // Calcular crescimento vs mês anterior
    const mesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);
    
    const doacoesMesAnterior = doacoes.filter(doacao => {
      const dataDoacao = new Date(doacao.data_doacao + 'T00:00:00');
      return dataDoacao >= mesAnterior && dataDoacao <= fimMesAnterior;
    });

    const valorMesAnterior = doacoesMesAnterior
      .filter(doacao => doacao.status === 'Processada')
      .reduce((total, doacao) => total + (doacao.valor_total || 0), 0);

    const crescimento = valorMesAnterior > 0 
      ? ((valorTotalMes - valorMesAnterior) / valorMesAnterior * 100).toFixed(1)
      : '0';

    return {
      valorTotalMes,
      itensRecebidosMes,
      pendentesMes,
      totalProcessadas,
      crescimento: parseFloat(crescimento),
      totalDinheiroRecebido,
      dinheiroRecebidoMes,
      totalItensRecebidos
    };
  };

  const estatisticas = calcularEstatisticas();

  return (
    <GridBackground className="flex-1 min-h-screen">
      <main className="p-6">
        <div className="mb-6 flex items-center gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Doações</h1>
            <p className="text-muted-foreground">Registre e acompanhe as doações recebidas</p>
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
              Total Dinheiro
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">
              R$ {estatisticas.totalDinheiroRecebido.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              R$ {estatisticas.dinheiroRecebidoMes.toFixed(2)} este mês
            </p>
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
              Total Itens
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{estatisticas.totalItensRecebidos}</div>
            <p className="text-xs text-muted-foreground mt-1">{estatisticas.itensRecebidosMes} este mês</p>
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
              Pendentes
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{estatisticas.pendentesMes}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando</p>
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
              Total Processadas
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{estatisticas.totalProcessadas}</div>
            <p className="text-xs text-muted-foreground mt-1">Histórico completo</p>
          </CardContent>
        </Card>
      </div>

      {/* Botão Nova Doação */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancelar" : "Nova Doação"}
        </Button>
      </div>

      {/* Formulário de Nova Doação */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Registrar Nova Doação
            </CardTitle>
            <CardDescription>
              Cadastre uma nova doação recebida na SANEM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doador">Doador *</Label>
                  <Select value={selectedDoador} onValueChange={setSelectedDoador}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o doador" />
                    </SelectTrigger>
                    <SelectContent>
                      {doadores.map((doador) => (
                        <SelectItem key={doador.id} value={doador.id}>
                          {doador.nome}
                        </SelectItem>
                      ))}
                      {doadores.length === 0 && (
                        <SelectItem value="" disabled>
                          Nenhum doador cadastrado
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-doacao">Data da Doação *</Label>
                  <Input id="data-doacao" name="data-doacao" type="date" required />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Adicionar Itens à Doação *</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="roupas">Roupas</SelectItem>
                        <SelectItem value="calcados">Calçados</SelectItem>
                        <SelectItem value="acessorios">Acessórios</SelectItem>
                        <SelectItem value="utensilios">Utensílios</SelectItem>
                        <SelectItem value="alimentos">Alimentos</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">
                      Descrição {selectedCategoria !== "dinheiro" ? "*" : "(opcional)"}
                    </Label>
                    <Input 
                      id="descricao" 
                      value={itemDescricao}
                      onChange={(e) => setItemDescricao(e.target.value)}
                      placeholder={
                        selectedCategoria === "dinheiro" 
                          ? "Ex: Doação mensal (opcional)" 
                          : "Ex: Camiseta azul tamanho M"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={selectedCategoria === "dinheiro" ? "quantia" : "quantidade"}>
                      {selectedCategoria === "dinheiro" ? "Quantia" : "Quantidade"}
                    </Label>
                    {selectedCategoria === "dinheiro" ? (
                      <Input 
                        id="quantia" 
                        type="text"
                        value={itemValorMonetario}
                        onChange={handleValorMonetarioChange}
                        placeholder="R$ 0,00" 
                      />
                    ) : (
                      <Input 
                        id="quantidade" 
                        type="number" 
                        min="1"
                        value={itemQuantidade === 0 ? "" : itemQuantidade}
                        onChange={(e) => {
                          const valor = e.target.value;
                          // Permite campo vazio ou números válidos
                          if (valor === "") {
                            setItemQuantidade(0);
                          } else if (!isNaN(parseInt(valor)) && parseInt(valor) > 0) {
                            setItemQuantidade(parseInt(valor));
                          }
                        }}
                        placeholder="Digite a quantidade" 
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button 
                      type="button" 
                      onClick={adicionarItem}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Lista de itens adicionados */}
                {itensDoacao.length > 0 && (
                  <div className="space-y-2">
                    <Label>Itens da Doação ({itensDoacao.length})</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {itensDoacao.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium">
                              {item.categoria === "dinheiro" 
                                ? `${item.valorMonetario} - ${item.descricao}`
                                : `${item.quantidade}x ${item.descricao}`
                              }
                            </span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {item.categoria}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removerItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>



              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea 
                  id="observacoes" 
                  name="observacoes"
                  placeholder="Informações adicionais sobre a doação..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Registrando..." : "Registrar Doação"}
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

      {/* Lista de Doações */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Doações Recentes</h2>
        
        {doacoes.map((doacao) => (
          <Card key={doacao.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{doacao.data_doacao}</span>
                    </div>
                    <Badge className={getStatusColor(doacao.status || '')}>
                      {doacao.status || 'Pendente'}
                    </Badge>
                    <span className="text-sm text-green-600 font-medium">
                      R$ {doacao.valor_total ? doacao.valor_total.toFixed(2) : '0,00'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{doacao.doador?.nome}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Itens doados:</p>
                        {doacao.itens_doacao && doacao.itens_doacao.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {doacao.itens_doacao.map((item, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {item.quantidade}x {item.observacoes}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {doacao.tipo_doacao || 'Não especificado'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {doacao.observacoes && (
                    <p className="text-sm text-gray-600 italic">
                      {doacao.observacoes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => abrirDetalhes(doacao)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                  {doacao.status === "Pendente" && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => processarDoacao(doacao.id)}
                      disabled={processandoDoacao === doacao.id}
                    >
                      {processandoDoacao === doacao.id ? (
                        <>
                          <Settings className="h-4 w-4 mr-1 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Processar
                        </>
                      )}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => cancelarDoacao(doacao.id)}
                    disabled={cancelandoDoacao === doacao.id || processandoDoacao === doacao.id}
                  >
                    {cancelandoDoacao === doacao.id ? (
                      <>
                        <Settings className="h-4 w-4 mr-1 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancelar Doação
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {doacoes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma doação cadastrada
              </h3>
              <p className="text-gray-600">
                Comece registrando a primeira doação recebida.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Detalhes da Doação */}
      <Dialog open={detalhesModal.open} onOpenChange={fecharDetalhes}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Doação</DialogTitle>
            <DialogDescription>
              Informações completas sobre a doação recebida
            </DialogDescription>
          </DialogHeader>
          
          {detalhesModal.doacao && (
            <div className="space-y-6">
              {/* Informações Gerais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Data da Doação</Label>
                  <p className="text-sm">{detalhesModal.doacao.data_doacao}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(detalhesModal.doacao.status || 'Pendente')}>
                    {detalhesModal.doacao.status || 'Pendente'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Tipo de Doação</Label>
                  <p className="text-sm">{detalhesModal.doacao.tipo_doacao || 'Não especificado'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Valor Total</Label>
                  <p className="text-sm font-medium text-green-600">
                    R$ {detalhesModal.doacao.valor_total ? detalhesModal.doacao.valor_total.toFixed(2) : '0,00'}
                  </p>
                </div>
              </div>

              {/* Informações do Doador */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Informações do Doador</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Nome</Label>
                    <p className="text-sm">{detalhesModal.doacao.doador?.nome || 'Não informado'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Registrado por</Label>
                    <p className="text-sm">{detalhesModal.doacao.created_by_name || 'Sistema'}</p>
                  </div>
                </div>
              </div>

              {/* Itens da Doação */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Itens Doados</h3>
                {detalhesModal.doacao.itens_doacao && detalhesModal.doacao.itens_doacao.length > 0 ? (
                  <div className="space-y-3">
                    {detalhesModal.doacao.itens_doacao.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {item.quantidade}x {item.observacoes}
                            </span>
                            {item.valor_unitario && (
                              <span className="text-sm text-green-600">
                                (R$ {item.valor_unitario.toFixed(2)} cada)
                              </span>
                            )}
                          </div>
                        </div>
                        {item.valor_unitario && (
                          <div className="text-right">
                            <span className="font-medium text-green-600">
                              R$ {(item.quantidade * item.valor_unitario).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum item específico registrado</p>
                )}
              </div>

              {/* Observações */}
              {detalhesModal.doacao.observacoes && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Observações</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {detalhesModal.doacao.observacoes}
                  </p>
                </div>
              )}

              {/* Ações */}
              <div className="border-t pt-4 flex gap-2">
                <Button variant="outline" onClick={fecharDetalhes}>
                  Fechar
                </Button>
                {detalhesModal.doacao.status === "Pendente" && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      processarDoacao(detalhesModal.doacao!.id);
                      fecharDetalhes();
                    }}
                    disabled={processandoDoacao === detalhesModal.doacao.id}
                  >
                    {processandoDoacao === detalhesModal.doacao.id ? (
                      <>
                        <Settings className="h-4 w-4 mr-1 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Processar Doação
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    cancelarDoacao(detalhesModal.doacao!.id);
                    fecharDetalhes();
                  }}
                  disabled={cancelandoDoacao === detalhesModal.doacao.id || processandoDoacao === detalhesModal.doacao.id}
                >
                  {cancelandoDoacao === detalhesModal.doacao.id ? (
                    <>
                      <Settings className="h-4 w-4 mr-1 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Cancelar Doação
                    </>
                  )}
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

export default Doacoes;
