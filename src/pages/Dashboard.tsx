
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Gift, TrendingUp, Calendar, AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GridBackground } from "@/components/ui/grid-background";

const Dashboard = () => {
  const navigate = useNavigate();
  
  const stats = [
    {
      title: "Beneficiários Ativos",
      value: "0",
      change: "+0 este mês",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Itens em Estoque",
      value: "0",
      change: "+0 esta semana",
      icon: Package,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Doações do Mês",
      value: "0",
      change: "0% vs mês anterior",
      icon: Gift,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Distribuições do Mês",
      value: "0",
      change: "0% vs mês anterior",
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  // Dados removidos - agora usando arrays vazios
  const recentActivities: any[] = [];
  const urgentActions: any[] = [];

  return (
    <GridBackground className="flex-1 min-h-screen">
      <main className="p-6">
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral das atividades da SANEM</p>
          </div>
        </div>

      {/* Cards de Estatísticas com Efeito Brilhante */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
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
              {recentActivities.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium mb-2">Nenhuma atividade recente</p>
                  <p className="text-sm text-muted-foreground/80">As atividades aparecerão aqui conforme forem sendo realizadas</p>
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
                <div key={index} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500 dark:border-orange-400">
                  <p className="text-sm text-foreground mb-2">{item.text}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-600/30 hover:bg-orange-100 dark:hover:bg-orange-900/30"
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
              {urgentActions.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium mb-2">Nenhuma ação urgente</p>
                  <p className="text-sm text-muted-foreground/80">Tudo sob controle por enquanto!</p>
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
              onClick={() => navigate('/cadastro-pessoas')}
            >
              <UserPlus className="h-6 w-6" />
              <span className="text-sm">Novo Beneficiário</span>
            </Button>
            <Button 
              className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
              onClick={() => navigate('/doacoes')}
            >
              <Gift className="h-6 w-6" />
              <span className="text-sm">Registrar Doação</span>
            </Button>
            <Button 
              className="h-20 flex-col gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
              onClick={() => navigate('/distribuicao')}
            >
              <Package className="h-6 w-6" />
              <span className="text-sm">Nova Distribuição</span>
            </Button>
            <Button 
              variant="outline"
              className="h-20 flex-col gap-2 border-border hover:bg-muted/50 text-foreground shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
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
