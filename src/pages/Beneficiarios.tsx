import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Edit, Users, Phone, MapPin, Calendar, UserPlus, Baby, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GridBackground } from "@/components/ui/grid-background";
import { ROUTES } from "@/constants";

const Beneficiarios = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Dados removidos - nenhum beneficiário cadastrado ainda
  const beneficiarios: any[] = [];

  const filteredBeneficiarios = beneficiarios.filter(beneficiario =>
    beneficiario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiario.cpf.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800";
      case "Limite Atingido":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLimiteColor = (limite: string) => {
    const percentage = parseInt(limite);
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const handleNovoBeneficiario = () => {
    navigate(`${ROUTES.CADASTRO}?tab=beneficiario`);
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
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">0% vs mês anterior</p>
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
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">+0 novos cadastros</p>
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
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">Média de 0 por família</p>
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
              Limite Atingido
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-20">
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">Precisam aguardar</p>
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
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNovoBeneficiario}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Beneficiário
            </Button>
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
                        <strong>{beneficiario.dependentes}</strong> dependentes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span>Última retirada: <strong>{beneficiario.ultimaRetirada}</strong></span>
                    <span>Limite disponível: 
                      <strong className={getLimiteColor(beneficiario.limiteDisponivel)}>
                        {" " + beneficiario.limiteDisponivel}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
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
      </main>
    </GridBackground>
  );
};

export default Beneficiarios;
