
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Filter, TrendingDown, TrendingUp, AlertTriangle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GridBackground } from "@/components/ui/grid-background";

const Estoque = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");

  // Dados removidos - agora usando array vazio
  const estoqueItens: any[] = [];

  const filteredItens = estoqueItens.filter(item => {
    const matchesSearch = item.tipo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.categoria === categoryFilter;
    const matchesSize = sizeFilter === "all" || item.tamanho?.includes(sizeFilter);
    return matchesSearch && matchesCategory && matchesSize;
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

  const totalItens = estoqueItens.reduce((sum, item) => sum + (item.quantidade || 0), 0);
  const itensAbaixoMinimo = estoqueItens.filter(item => item.quantidade <= item.minimo).length;
  const itensCriticos = estoqueItens.filter(item => item.quantidade <= item.minimo * 0.5).length;

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
              Tipos Diferentes
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">{estoqueItens.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Categorias</p>
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
                <SelectItem value="Roupas">Roupas</SelectItem>
                <SelectItem value="Calçados">Calçados</SelectItem>
                <SelectItem value="Acessórios">Acessórios</SelectItem>
                <SelectItem value="Utensílios">Utensílios</SelectItem>
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
          <h2 className="text-xl font-semibold text-gray-900">
            Itens em Estoque ({filteredItens.length})
          </h2>
          <Button className="bg-green-600 hover:bg-green-700">
            Adicionar Item Manual
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredItens.map((item) => {
            const status = getQuantidadeStatus(item.quantidade, item.minimo);
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.tipo}
                        </h3>
                        <Badge variant="outline">
                          {item.categoria}
                        </Badge>
                        <Badge className={getCondicaoColor(item.condicao)}>
                          {item.condicao}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Tamanho</p>
                          <p>{item.tamanho}</p>
                        </div>
                        <div>
                          <p className="font-medium">Quantidade</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${status.color}`}>
                              {item.quantidade}
                            </span>
                            <div className={`px-2 py-1 rounded text-xs ${status.bg} ${status.color}`}>
                              {status.status}
                            </div>
                          </div>
                          <p className="text-xs">Mín: {item.minimo}</p>
                        </div>
                        <div>
                          <p className="font-medium">Última Entrada</p>
                          <p>{item.ultimaEntrada}</p>
                        </div>
                        <div>
                          <p className="font-medium">Última Saída</p>
                          <p>{item.ultimaSaida}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver Histórico
                      </Button>
                      <Button variant="outline" size="sm">
                        Ajustar Estoque
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
      </main>
    </GridBackground>
  );
};

export default Estoque;
