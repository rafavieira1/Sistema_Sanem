

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Plus, User, Package, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { GridBackground } from "@/components/ui/grid-background";

const Distribuicao = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Dados removidos - agora usando arrays vazios
  const distribuicoes: any[] = [];
  const beneficiariosDisponiveis: any[] = [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Distribuição registrada!",
        description: "A retirada foi cadastrada com sucesso.",
      });
      setIsLoading(false);
      setShowForm(false);
    }, 1000);
  };

  const getLimiteColor = (limite: string) => {
    const percentage = parseInt(limite);
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 30) return "text-yellow-600";
    return "text-red-600";
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Share2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Este Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Itens Distribuídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Beneficiários Atendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Próximos ao Limite</p>
              </div>
            </div>
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
            {beneficiariosDisponiveis
              .filter(b => parseInt(b.limiteDisponivel || "100") <= 30)
              .map((beneficiario) => (
                <div key={beneficiario.id} className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <p className="font-medium text-gray-900">{beneficiario.nome}</p>
                  <p className="text-sm text-gray-600">{beneficiario.dependentes} dependentes</p>
                  <p className={`text-sm font-medium ${getLimiteColor(beneficiario.limiteDisponivel)}`}>
                    {beneficiario.limiteDisponivel} disponível
                  </p>
                </div>
              ))}
            {beneficiariosDisponiveis.filter(b => parseInt(b.limiteDisponivel || "100") <= 30).length === 0 && (
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o beneficiário" />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiariosDisponiveis.map((beneficiario) => (
                        <SelectItem key={beneficiario.id} value={beneficiario.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{beneficiario.nome}</span>
                            <span className={`text-xs ml-2 ${getLimiteColor(beneficiario.limiteDisponivel)}`}>
                              {beneficiario.limiteDisponivel} disponível
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-distribuicao">Data da Distribuição *</Label>
                  <Input id="data-distribuicao" type="date" required />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Itens a Distribuir *</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="categoria-dist">Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="roupas">Roupas</SelectItem>
                        <SelectItem value="calcados">Calçados</SelectItem>
                        <SelectItem value="acessorios">Acessórios</SelectItem>
                        <SelectItem value="utensilios">Utensílios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-disponivel">Item Disponível</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sem-itens">Nenhum item disponível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantidade-dist">Quantidade</Label>
                    <Input id="quantidade-dist" type="number" placeholder="0" min="1" />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="outline" size="sm" className="w-full">
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
                  <p className="text-sm text-gray-600">Nenhum item selecionado ainda</p>
                  <p className="text-xs text-blue-600 mt-1">
                    <strong>Limite utilizado:</strong> 0% (disponível: 100%)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel">Voluntário Responsável *</Label>
                <Input 
                  id="responsavel" 
                  placeholder="Nome do voluntário que fez a entrega"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes-dist">Observações</Label>
                <Textarea 
                  id="observacoes-dist" 
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
                      <span className="font-medium">{distribuicao.data}</span>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-blue-600 font-medium">
                      Limite usado: {distribuicao.limiteUsado}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{distribuicao.beneficiario}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Itens distribuídos:</p>
                        <div className="flex flex-wrap gap-1">
                          {distribuicao.itens?.map((item: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p><strong>Responsável:</strong> {distribuicao.responsavel}</p>
                    {distribuicao.observacoes && (
                      <p className="italic mt-1">{distribuicao.observacoes}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
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
      </main>
    </GridBackground>
  );
};

export default Distribuicao;
