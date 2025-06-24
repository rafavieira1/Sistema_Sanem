import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Gift, TrendingUp, Calendar, AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GridBackground } from "@/components/ui/grid-background";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  beneficiariosAtivos: number;
  novosEsteMs: number;
  itensEstoque: number;
  itensAdicionadosEstaSemana: number;
  doacoesEsteMes: number;
  crescimentoDoacoes: number;
  distribuicoesEsteMes: number;
  crescimentoDistribuicoes: number;
}

interface RecentActivity {
  id: string;
  type: 'donation' | 'distribution' | 'beneficiary';
  action: string;
  person: string;
  time: string;
  created_at: string;
}

interface UrgentAction {
  id: string;
  type: 'low_stock' | 'limit_reached' | 'pending_donation';
  text: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    beneficiariosAtivos: 0,
    novosEsteMs: 0,
    itensEstoque: 0,
    itensAdicionadosEstaSemana: 0,
    doacoesEsteMes: 0,
    crescimentoDoacoes: 0,
    distribuicoesEsteMes: 0,
    crescimentoDistribuicoes: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [urgentActions, setUrgentActions] = useState<UrgentAction[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentActivities(),
        fetchUrgentActions()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "❌ Erro ao carregar dashboard",
        description: "Não foi possível carregar algumas informações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Beneficiários ativos
    const { count: beneficiariosAtivos } = await supabase
      .from('beneficiarios')
      .select('*', { count: 'exact' })
      .eq('status', 'Ativo');

    // Novos beneficiários este mês
    const { count: novosEsteMs } = await supabase
      .from('beneficiarios')
      .select('*', { count: 'exact' })
      .gte('created_at', firstDayOfMonth.toISOString());

    // Itens em estoque (soma de todas as quantidades)
    const { data: produtosEstoque } = await supabase
      .from('produtos')
      .select('quantidade_estoque');
    
    const itensEstoque = produtosEstoque?.reduce((sum, produto) => sum + (produto.quantidade_estoque || 0), 0) || 0;

    // Itens adicionados esta semana (movimentações de entrada)
    const { data: movimentacoesEntrada } = await supabase
      .from('movimentacoes_estoque')
      .select('quantidade')
      .eq('tipo_movimentacao', 'Entrada')
      .gte('created_at', oneWeekAgo.toISOString());

    const itensAdicionadosEstaSemana = movimentacoesEntrada?.reduce((sum, mov) => sum + (mov.quantidade || 0), 0) || 0;

    // Doações este mês
    const { count: doacoesEsteMes } = await supabase
      .from('doacoes')
      .select('*', { count: 'exact' })
      .eq('status', 'Processada')
      .gte('created_at', firstDayOfMonth.toISOString());

    // Doações mês passado para calcular crescimento
    const { count: doacoesMesPassado } = await supabase
      .from('doacoes')
      .select('*', { count: 'exact' })
      .eq('status', 'Processada')
      .gte('created_at', firstDayOfLastMonth.toISOString())
      .lte('created_at', lastDayOfLastMonth.toISOString());

    const crescimentoDoacoes = doacoesMesPassado ? 
      Math.round(((doacoesEsteMes || 0) - doacoesMesPassado) / doacoesMesPassado * 100) : 0;

    // Distribuições este mês
    const { count: distribuicoesEsteMes } = await supabase
      .from('distribuicoes')
      .select('*', { count: 'exact' })
      .gte('created_at', firstDayOfMonth.toISOString());

    // Distribuições mês passado para calcular crescimento
    const { count: distribuicoesMesPassado } = await supabase
      .from('distribuicoes')
      .select('*', { count: 'exact' })
      .gte('created_at', firstDayOfLastMonth.toISOString())
      .lte('created_at', lastDayOfLastMonth.toISOString());

    const crescimentoDistribuicoes = distribuicoesMesPassado ? 
      Math.round(((distribuicoesEsteMes || 0) - distribuicoesMesPassado) / distribuicoesMesPassado * 100) : 0;

    setStats({
      beneficiariosAtivos: beneficiariosAtivos || 0,
      novosEsteMs: novosEsteMs || 0,
      itensEstoque,
      itensAdicionadosEstaSemana,
      doacoesEsteMes: doacoesEsteMes || 0,
      crescimentoDoacoes,
      distribuicoesEsteMes: distribuicoesEsteMes || 0,
      crescimentoDistribuicoes,
    });
  };

  const fetchRecentActivities = async () => {
    const activities: RecentActivity[] = [];

    // Últimas 5 doações
    const { data: doacoes } = await supabase
      .from('doacoes')
      .select(`
        id,
        created_at,
        doadores!inner(nome)
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    doacoes?.forEach(doacao => {
      activities.push({
        id: `doacao-${doacao.id}`,
        type: 'donation',
        action: 'Nova doação registrada',
        person: doacao.doadores.nome,
        time: formatTimeAgo(doacao.created_at),
        created_at: doacao.created_at
      });
    });

    // Últimas 5 distribuições
    const { data: distribuicoes } = await supabase
      .from('distribuicoes')
      .select(`
        id,
        created_at,
        beneficiarios!inner(nome)
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    distribuicoes?.forEach(distribuicao => {
      activities.push({
        id: `distribuicao-${distribuicao.id}`,
        type: 'distribution',
        action: 'Nova distribuição realizada',
        person: distribuicao.beneficiarios.nome,
        time: formatTimeAgo(distribuicao.created_at),
        created_at: distribuicao.created_at
      });
    });

    // Últimos 2 beneficiários cadastrados
    const { data: beneficiarios } = await supabase
      .from('beneficiarios')
      .select('id, nome, created_at')
      .order('created_at', { ascending: false })
      .limit(2);

    beneficiarios?.forEach(beneficiario => {
      activities.push({
        id: `beneficiario-${beneficiario.id}`,
        type: 'beneficiary',
        action: 'Novo beneficiário cadastrado',
        person: beneficiario.nome,
        time: formatTimeAgo(beneficiario.created_at),
        created_at: beneficiario.created_at
      });
    });

    // Ordenar por data mais recente
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setRecentActivities(activities.slice(0, 6));
  };

  const fetchUrgentActions = async () => {
    const actions: UrgentAction[] = [];

    // Produtos com estoque baixo (menos de 5 unidades)
    const { data: produtosBaixoEstoque } = await supabase
      .from('produtos')
      .select('nome, quantidade_estoque')
      .lt('quantidade_estoque', 5)
      .gt('quantidade_estoque', 0);

    if (produtosBaixoEstoque && produtosBaixoEstoque.length > 0) {
      actions.push({
        id: 'low-stock',
        type: 'low_stock',
        text: `${produtosBaixoEstoque.length} produto(s) com estoque baixo`,
        action: 'Verificar estoque',
        priority: 'high'
      });
    }

    // Produtos sem estoque
    const { count: produtosSemEstoque } = await supabase
      .from('produtos')
      .select('*', { count: 'exact' })
      .eq('quantidade_estoque', 0);

    if (produtosSemEstoque && produtosSemEstoque > 0) {
      actions.push({
        id: 'no-stock',
        type: 'low_stock',
        text: `${produtosSemEstoque} produto(s) sem estoque`,
        action: 'Verificar estoque',
        priority: 'high'
      });
    }

    // Beneficiários próximos ao limite (80% do limite de 10 itens = 8 itens)
    const { count: beneficiariosProximosLimite } = await supabase
      .from('beneficiarios')
      .select('*', { count: 'exact' })
      .gte('limite_usado_atual', 8)
      .lt('limite_usado_atual', 10)
      .eq('status', 'Ativo');

    if (beneficiariosProximosLimite && beneficiariosProximosLimite > 0) {
      actions.push({
        id: 'limit-reached',
        type: 'limit_reached',
        text: `${beneficiariosProximosLimite} beneficiário(s) próximo(s) ao limite`,
        action: 'Ver beneficiários',
        priority: 'medium'
      });
    }

    // Doações pendentes de processamento
    const { count: doacoesPendentes } = await supabase
      .from('doacoes')
      .select('*', { count: 'exact' })
      .eq('status', 'Pendente');

    if (doacoesPendentes && doacoesPendentes > 0) {
      actions.push({
        id: 'pending-donations',
        type: 'pending_donation',
        text: `${doacoesPendentes} doação(ões) pendente(s) de processamento`,
        action: 'Processar doações',
        priority: 'medium'
      });
    }

    setUrgentActions(actions);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const getChangeText = (value: number, type: 'percentage' | 'absolute' = 'percentage') => {
    if (type === 'percentage') {
      if (value > 0) return `+${value}% vs mês anterior`;
      if (value < 0) return `${value}% vs mês anterior`;
      return "Mesmo que mês anterior";
    }
    
    if (value > 0) return `+${value} esta semana`;
    return "Nenhum esta semana";
  };

  const dashboardStats = [
    {
      title: "Beneficiários Ativos",
      value: isLoading ? "..." : stats.beneficiariosAtivos.toString(),
      change: isLoading ? "..." : `+${stats.novosEsteMs} este mês`,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Itens em Estoque",
      value: isLoading ? "..." : stats.itensEstoque.toString(),
      change: isLoading ? "..." : getChangeText(stats.itensAdicionadosEstaSemana, 'absolute'),
      icon: Package,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Doações do Mês",
      value: isLoading ? "..." : stats.doacoesEsteMes.toString(),
      change: isLoading ? "..." : getChangeText(stats.crescimentoDoacoes),
      icon: Gift,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Distribuições do Mês",
      value: isLoading ? "..." : stats.distribuicoesEsteMes.toString(),
      change: isLoading ? "..." : getChangeText(stats.crescimentoDistribuicoes),
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <GridBackground className="flex-1 min-h-screen">
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral das atividades da SANEM</p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchDashboardData}
            disabled={isLoading}
          >
            {isLoading ? "Atualizando..." : "Atualizar Dados"}
          </Button>
        </div>

        {/* Cards de Estatísticas com Efeito Brilhante */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="relative hover:shadow-lg transition-all duration-300 hover:shadow-primary/20 overflow-hidden">
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
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-20">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Atividades Recentes */}
          <Card className="lg:col-span-2 relative overflow-hidden">
            <GlowingEffect 
              disabled={false}
              proximity={80}
              spread={25}
              blur={1}
              movementDuration={2}
              borderWidth={1}
              className="z-10"
            />
            <CardHeader className="relative z-20">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>
                Últimas movimentações no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-20">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'donation' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                      activity.type === 'distribution' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                      {activity.type === 'donation' ? <Gift className="h-4 w-4" /> :
                       activity.type === 'distribution' ? <Package className="h-4 w-4" /> :
                       <Users className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.person}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
                {recentActivities.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium mb-2">Nenhuma atividade recente</p>
                    <p className="text-sm text-muted-foreground/80">As atividades aparecerão aqui conforme forem sendo realizadas</p>
                  </div>
                )}
                {isLoading && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Carregando atividades...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ações Urgentes */}
          <Card className="relative overflow-hidden">
            <GlowingEffect 
              disabled={false}
              proximity={80}
              spread={25}
              blur={1}
              movementDuration={2}
              borderWidth={1}
              className="z-10"
            />
            <CardHeader className="relative z-20">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertCircle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                Ações Urgentes
              </CardTitle>
              <CardDescription>
                Itens que precisam de atenção
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-20">
              <div className="space-y-4">
                {urgentActions.map((item, index) => (
                  <div key={item.id} className={`p-3 rounded-lg border-l-4 ${
                    item.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400' :
                    'bg-orange-50 dark:bg-orange-900/20 border-orange-500 dark:border-orange-400'
                  }`}>
                    <p className="text-sm text-foreground mb-2">{item.text}</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className={`${
                        item.priority === 'high' ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-600/30 hover:bg-red-100 dark:hover:bg-red-900/30' :
                        'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-600/30 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                      }`}
                      onClick={() => {
                        if (item.action.includes('estoque')) navigate('/estoque');
                        else if (item.action.includes('doações')) navigate('/doacoes');
                        else navigate('/beneficiarios');
                      }}
                    >
                      {item.action}
                    </Button>
                  </div>
                ))}
                {urgentActions.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium mb-2">Nenhuma ação urgente</p>
                    <p className="text-sm text-muted-foreground/80">Tudo sob controle por enquanto!</p>
                  </div>
                )}
                {isLoading && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Verificando alertas...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="mt-6 relative overflow-hidden">
          <GlowingEffect 
            disabled={false}
            proximity={120}
            spread={35}
            blur={2}
            movementDuration={1.8}
            borderWidth={2}
            className="z-10"
          />
          <CardHeader className="relative z-20">
            <CardTitle className="text-foreground">Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
                onClick={() => navigate('/cadastro')}
              >
                <UserPlus className="h-6 w-6" />
                <span className="text-sm">Novo Beneficiário</span>
              </Button>
              <Button 
                className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
                onClick={() => navigate('/doacoes')}
              >
                <Gift className="h-6 w-6" />
                <span className="text-sm">Registrar Doação</span>
              </Button>
              <Button 
                className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
                onClick={() => navigate('/distribuicao')}
              >
                <Package className="h-6 w-6" />
                <span className="text-sm">Nova Distribuição</span>
              </Button>
              <Button 
                className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
                onClick={() => navigate('/relatorios')}
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Ver Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </GridBackground>
  );
};

export default Dashboard;
