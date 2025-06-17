import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Filter, BarChart, TrendingUp, Users, Package } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GridBackground } from "@/components/ui/grid-background";

const Relatorios = () => {
  const { hasPermission } = useAuth();
  const [tipoRelatorio, setTipoRelatorio] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const relatoriosDisponiveis = [
    {
      id: "movimentacao-geral",
      titulo: "Movimentação Geral",
      descricao: "Visão completa de entradas e saídas do estoque",
      icon: BarChart,
      categoria: "Geral",
      permission: "view_reports"
    },
    {
      id: "beneficiarios-atendidos",
      titulo: "Beneficiários Atendidos",
      descricao: "Lista detalhada dos beneficiários e seus atendimentos",
      icon: Users,
      categoria: "Beneficiários",
      permission: "view_reports"
    },
    {
      id: "doacoes-recebidas",
      titulo: "Doações Recebidas",
      descricao: "Relatório de todas as doações por período",
      icon: Package,
      categoria: "Doações",
      permission: "view_reports"
    },
    {
      id: "distribuicoes-realizadas",
      titulo: "Distribuições Realizadas",
      descricao: "Histórico completo de distribuições de itens",
      icon: TrendingUp,
      categoria: "Distribuições",
      permission: "view_reports"
    },
    {
      id: "estoque-atual",
      titulo: "Situação do Estoque",
      descricao: "Status atual de todos os itens em estoque",
      icon: Package,
      categoria: "Estoque",
      permission: "view_reports"
    },
    {
      id: "limite-beneficiarios",
      titulo: "Limite dos Beneficiários",
      descricao: "Controle de limites mensais utilizados",
      icon: Users,
      categoria: "Beneficiários",
      permission: "view_reports"
    },
    {
      id: "auditoria-sistema",
      titulo: "Auditoria do Sistema",
      descricao: "Log completo de ações realizadas no sistema",
      icon: FileText,
      categoria: "Segurança",
      permission: "view_all_reports"
    },
    {
      id: "relatorio-usuarios",
      titulo: "Relatório de Usuários",
      descricao: "Atividades e acessos dos usuários do sistema",
      icon: Users,
      categoria: "Administração",
      permission: "view_all_reports"
    },
    {
      id: "performance-sistema",
      titulo: "Performance do Sistema",
      descricao: "Métricas de uso e performance da plataforma",
      icon: TrendingUp,
      categoria: "Técnico",
      permission: "view_all_reports"
    }
  ];

  // Dados zerados - serão atualizados quando houver dados reais no banco
  const dadosReais = {
    resumoMensal: {
      doacoes: 0,
      distribuicoes: 0,
      beneficiariosAtendidos: 0,
      itensMovimentados: 0
    },
    topBeneficiarios: [],
    categoriasMaisDoadas: []
  };

  const filteredRelatorios = relatoriosDisponiveis.filter(relatorio => 
    hasPermission(relatorio.permission)
  );

  const handleGerarRelatorio = () => {
    console.log("Gerando relatório:", { tipoRelatorio, dataInicio, dataFim });
    // Aqui seria implementada a lógica de geração do relatório
  };

  return (
    <GridBackground className="flex-1 min-h-screen">
      <main className="p-6">
        <div className="mb-6 flex items-center gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">Análises e dados da operação da SANEM</p>
            {hasPermission("view_all_reports") && (
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">• Acesso SuperAdmin - Todos os relatórios disponíveis</p>
            )}
          </div>
        </div>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{dadosReais.resumoMensal.doacoes}</p>
                <p className="text-sm text-muted-foreground">Doações Este Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{dadosReais.resumoMensal.distribuicoes}</p>
                <p className="text-sm text-muted-foreground">Distribuições</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{dadosReais.resumoMensal.beneficiariosAtendidos}</p>
                <p className="text-sm text-muted-foreground">Beneficiários</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-foreground">{dadosReais.resumoMensal.itensMovimentados}</p>
                <p className="text-sm text-muted-foreground">Itens Movimentados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gerador de Relatórios */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gerar Relatório Personalizado
              </CardTitle>
              <CardDescription>
                Configure os parâmetros para gerar seu relatório
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo-relatorio">Tipo de Relatório *</Label>
                  <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de relatório" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRelatorios.map((relatorio) => (
                        <SelectItem key={relatorio.id} value={relatorio.id}>
                          {relatorio.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Período predefinido" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hoje">Hoje</SelectItem>
                      <SelectItem value="semana">Esta Semana</SelectItem>
                      <SelectItem value="mes">Este Mês</SelectItem>
                      <SelectItem value="trimestre">Este Trimestre</SelectItem>
                      <SelectItem value="ano">Este Ano</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data-inicio">Data Início</Label>
                  <Input 
                    id="data-inicio" 
                    type="date" 
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-fim">Data Fim</Label>
                  <Input 
                    id="data-fim" 
                    type="date" 
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleGerarRelatorio}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!tipoRelatorio}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
                <Button variant="outline" disabled={!tipoRelatorio}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Relatórios Disponíveis */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
              <CardDescription>
                Escolha entre os relatórios pré-configurados para o seu nível de acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRelatorios.map((relatorio) => (
                  <div key={relatorio.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-start gap-3">
                      <relatorio.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{relatorio.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{relatorio.descricao}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {relatorio.categoria}
                          </Badge>
                          {relatorio.permission === "view_all_reports" && (
                            <Badge variant="destructive" className="text-xs">
                              SuperAdmin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análises Rápidas */}
        <div className="space-y-6">
          {/* Top Beneficiários */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Beneficiários</CardTitle>
              <CardDescription>Mais atendidos este mês</CardDescription>
            </CardHeader>
            <CardContent>
              {dadosReais.topBeneficiarios.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum atendimento registrado ainda
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Os dados aparecerão quando houver beneficiários atendidos
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dadosReais.topBeneficiarios.map((beneficiario, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium text-sm">{beneficiario.nome}</p>
                        <p className="text-xs text-muted-foreground">Última: {beneficiario.ultimaVisita}</p>
                      </div>
                      <Badge variant="secondary">
                        {beneficiario.retiradas} retiradas
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categorias Mais Doadas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorias Mais Doadas</CardTitle>
              <CardDescription>Distribuição por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              {dadosReais.categoriasMaisDoadas.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma doação registrada ainda
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Os dados aparecerão quando houver doações cadastradas
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dadosReais.categoriasMaisDoadas.map((categoria, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{categoria.categoria}</span>
                        <span className="text-muted-foreground">{categoria.porcentagem}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: categoria.porcentagem }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">{categoria.quantidade} itens</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Relatório do Dia
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Resumo Semanal
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
                {hasPermission("view_all_reports") && (
                  <Button variant="outline" size="sm" className="w-full justify-start border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                    <Filter className="h-4 w-4 mr-2" />
                    Relatórios Avançados
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </main>
    </GridBackground>
  );
};

export default Relatorios;
