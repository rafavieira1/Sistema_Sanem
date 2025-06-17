import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Heart, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GridBackground } from "@/components/ui/grid-background";

const Cadastro = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("beneficiario");

  // Verificar se usuário é super admin
  const isSuperAdmin = user?.role === "superadmin";

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["beneficiario", "dependente", "doador", "voluntario"].includes(tabFromUrl)) {
      // Se não é super admin e está tentando acessar aba de voluntário, redireciona para beneficiário
      if (tabFromUrl === "voluntario" && !isSuperAdmin) {
        setActiveTab("beneficiario");
      } else {
        setActiveTab(tabFromUrl);
      }
    }
  }, [searchParams, isSuperAdmin]);

  const handleSubmit = async (e: React.FormEvent, tipo: string) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Cadastro realizado!",
        description: `${tipo} cadastrado(a) com sucesso.`,
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <GridBackground className="flex-1 min-h-screen">
      <main className="p-6">
        <div className="mb-6 flex items-center gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cadastro de Pessoas</h1>
            <p className="text-muted-foreground">Gerencie doadores, voluntários, beneficiários e dependentes</p>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="beneficiario" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Beneficiário
          </TabsTrigger>
          <TabsTrigger value="dependente" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Dependente
          </TabsTrigger>
          <TabsTrigger value="doador" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Doador
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="voluntario" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Voluntário
            </TabsTrigger>
          )}
        </TabsList>

        {/* Cadastro de Beneficiário */}
        <TabsContent value="beneficiario">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cadastro de Beneficiário
              </CardTitle>
              <CardDescription>
                Dados pessoais e informações de contato do beneficiário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleSubmit(e, "Beneficiário")} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input id="nome" placeholder="Digite o nome completo" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input id="cpf" placeholder="000.000.000-00" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input id="rg" placeholder="00.000.000-0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nascimento">Data de Nascimento</Label>
                    <Input id="nascimento" type="date" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input id="telefone" placeholder="(11) 99999-9999" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="email@exemplo.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo *</Label>
                  <Input id="endereco" placeholder="Rua, número, bairro, cidade - CEP" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado-civil">Estado Civil</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                        <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renda">Renda Familiar</Label>
                    <Input id="renda" placeholder="R$ 0,00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pessoas-casa">Pessoas na Casa</Label>
                    <Input id="pessoas-casa" type="number" placeholder="0" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea 
                    id="observacoes" 
                    placeholder="Informações adicionais sobre a situação do beneficiário"
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar Beneficiário"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cadastro de Dependente */}
        <TabsContent value="dependente">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Cadastro de Dependente
              </CardTitle>
              <CardDescription>
                Vincule dependentes aos beneficiários cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleSubmit(e, "Dependente")} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="beneficiario-responsavel">Beneficiário Responsável *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o beneficiário responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maria">Maria Silva Santos</SelectItem>
                      <SelectItem value="joao">João Carlos Oliveira</SelectItem>
                      <SelectItem value="ana">Ana Paula Costa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome-dependente">Nome Completo *</Label>
                    <Input id="nome-dependente" placeholder="Digite o nome completo" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nascimento-dependente">Data de Nascimento *</Label>
                    <Input id="nascimento-dependente" type="date" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentesco">Parentesco *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o parentesco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="filho">Filho(a)</SelectItem>
                        <SelectItem value="neto">Neto(a)</SelectItem>
                        <SelectItem value="sobrinho">Sobrinho(a)</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf-dependente">CPF</Label>
                    <Input id="cpf-dependente" placeholder="000.000.000-00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes-dependente">Observações</Label>
                  <Textarea 
                    id="observacoes-dependente" 
                    placeholder="Informações adicionais sobre o dependente"
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar Dependente"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cadastro de Doador */}
        <TabsContent value="doador">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Cadastro de Doador
              </CardTitle>
              <CardDescription>
                Informações dos doadores que contribuem com a SANEM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleSubmit(e, "Doador")} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome-doador">Nome Completo *</Label>
                    <Input id="nome-doador" placeholder="Digite o nome completo" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo-doador">Tipo de Doador</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pessoa-fisica">Pessoa Física</SelectItem>
                        <SelectItem value="pessoa-juridica">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documento-doador">CPF/CNPJ</Label>
                    <Input id="documento-doador" placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone-doador">Telefone</Label>
                    <Input id="telefone-doador" placeholder="(11) 99999-9999" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-doador">E-mail</Label>
                    <Input id="email-doador" type="email" placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequencia">Frequência de Doação</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eventual">Eventual</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco-doador">Endereço</Label>
                  <Input id="endereco-doador" placeholder="Rua, número, bairro, cidade - CEP" />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar Doador"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cadastro de Voluntário - Apenas para Super Admins */}
        {isSuperAdmin && (
          <TabsContent value="voluntario">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Cadastro de Voluntário
                </CardTitle>
                <CardDescription>
                  Registre novos voluntários para trabalhar na SANEM
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "Voluntário")} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome-voluntario">Nome Completo *</Label>
                      <Input id="nome-voluntario" placeholder="Digite o nome completo" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf-voluntario">CPF *</Label>
                      <Input id="cpf-voluntario" placeholder="000.000.000-00" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone-voluntario">Telefone *</Label>
                      <Input id="telefone-voluntario" placeholder="(11) 99999-9999" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-voluntario">E-mail *</Label>
                      <Input id="email-voluntario" type="email" placeholder="email@exemplo.com" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="funcao">Função/Área de Atuação</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="atendimento">Atendimento</SelectItem>
                          <SelectItem value="organizacao">Organização</SelectItem>
                          <SelectItem value="administrativa">Administrativa</SelectItem>
                          <SelectItem value="geral">Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="disponibilidade">Disponibilidade</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manha">Manhã</SelectItem>
                          <SelectItem value="tarde">Tarde</SelectItem>
                          <SelectItem value="noite">Noite</SelectItem>
                          <SelectItem value="fins-semana">Fins de Semana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco-voluntario">Endereço</Label>
                    <Input id="endereco-voluntario" placeholder="Rua, número, bairro, cidade - CEP" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experiencia">Experiência/Habilidades</Label>
                    <Textarea 
                      id="experiencia" 
                      placeholder="Descreva experiências anteriores e habilidades relevantes"
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Cadastrando..." : "Cadastrar Voluntário"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      </main>
    </GridBackground>
  );
};

export default Cadastro;
