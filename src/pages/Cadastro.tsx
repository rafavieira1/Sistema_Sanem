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
import { supabase } from "@/integrations/supabase/client";

const Cadastro = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("beneficiario");
  const [beneficiarios, setBeneficiarios] = useState<Array<{id: string, nome: string}>>([]);
  
  // Estados para campos select
  const [selectedBeneficiario, setSelectedBeneficiario] = useState("");
  const [selectedParentesco, setSelectedParentesco] = useState("");
  const [selectedTipoDoador, setSelectedTipoDoador] = useState("");
  const [selectedFrequencia, setSelectedFrequencia] = useState("");
  const [selectedFuncao, setSelectedFuncao] = useState("");
  const [selectedDisponibilidade, setSelectedDisponibilidade] = useState("");

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

  // Carregar beneficiários para o formulário de dependentes
  useEffect(() => {
    const loadBeneficiarios = async () => {
      try {
        const { data, error } = await supabase
          .from('beneficiarios')
          .select('id, nome')
          .eq('status', 'Ativo')
          .order('nome');

        if (error) {
          throw error;
        }

        setBeneficiarios(data || []);
      } catch (error) {
        console.error('Erro ao carregar beneficiários:', error);
      }
    };

    loadBeneficiarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent, tipo: string) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      if (tipo === "Beneficiário") {
        const beneficiarioData = {
          nome: formData.get('nome') as string,
          cpf: formData.get('cpf') as string,
          data_nascimento: formData.get('nascimento') as string || null,
          telefone: formData.get('telefone') as string,
          email: formData.get('email') as string || null,
          endereco: formData.get('endereco') as string,
          status: 'Ativo',
          created_by: user?.id
        };

        const { data, error } = await supabase
          .from('beneficiarios')
          .insert([beneficiarioData])
          .select();

        if (error) {
          throw error;
        }

        toast({
          title: "✅ Beneficiário cadastrado!",
          description: `${beneficiarioData.nome} foi cadastrado(a) com sucesso.`,
        });

        // Limpar formulário
        (e.target as HTMLFormElement).reset();
        
      } else if (tipo === "Dependente") {
        if (!selectedBeneficiario) {
          toast({
            title: "❌ Erro no cadastro",
            description: "Por favor, selecione um beneficiário responsável.",
            variant: "destructive",
          });
          return;
        }

        const dependenteData = {
          nome: formData.get('nome-dependente') as string,
          data_nascimento: formData.get('nascimento-dependente') as string || null,
          parentesco: selectedParentesco || null,
          beneficiario_id: selectedBeneficiario,
        };

        console.log('Dados do dependente a serem inseridos:', dependenteData);

        const { data, error } = await supabase
          .from('dependentes')
          .insert([dependenteData])
          .select();

        if (error) {
          console.error('Erro detalhado ao inserir dependente:', error);
          throw error;
        }

        // Atualizar contador de dependentes no beneficiário
        const { count } = await supabase
          .from('dependentes')
          .select('*', { count: 'exact' })
          .eq('beneficiario_id', selectedBeneficiario);

        if (count !== null) {
          await supabase
            .from('beneficiarios')
            .update({ numero_dependentes: count })
            .eq('id', selectedBeneficiario);
        }

        toast({
          title: "✅ Dependente cadastrado!",
          description: `${dependenteData.nome} foi cadastrado(a) com sucesso.`,
        });

        // Limpar formulário e estados
        (e.target as HTMLFormElement).reset();
        setSelectedBeneficiario("");
        setSelectedParentesco("");

      } else if (tipo === "Doador") {
        const doadorData = {
          nome: formData.get('nome-doador') as string,
          cpf_cnpj: formData.get('documento-doador') as string || null,
          telefone: formData.get('telefone-doador') as string || null,
          email: formData.get('email-doador') as string || null,
          endereco: formData.get('endereco-doador') as string || null,
          tipo: selectedTipoDoador || null,
        };

        const { data, error } = await supabase
          .from('doadores')
          .insert([doadorData])
          .select();

        if (error) {
          throw error;
        }

        toast({
          title: "✅ Doador cadastrado!",
          description: `${doadorData.nome} foi cadastrado(a) com sucesso.`,
        });

        // Limpar formulário e estados
        (e.target as HTMLFormElement).reset();
        setSelectedTipoDoador("");
        setSelectedFrequencia("");

      } else if (tipo === "Voluntário") {
        // Para voluntários, vamos criar um usuário no sistema
        const voluntarioData = {
          name: formData.get('nome-voluntario') as string,
          email: formData.get('email-voluntario') as string,
          password_hash: 'temp_password_hash', // Senha temporária que deve ser alterada
          role: 'voluntario' as const,
          status: 'Ativo'
        };

        const { data, error } = await supabase
          .from('users')
          .insert([voluntarioData])
          .select();

        if (error) {
          throw error;
        }

        toast({
          title: "✅ Voluntário cadastrado!",
          description: `${voluntarioData.name} foi cadastrado(a) com sucesso. Uma senha temporária foi criada.`,
        });

        // Limpar formulário e estados
        (e.target as HTMLFormElement).reset();
        setSelectedFuncao("");
        setSelectedDisponibilidade("");
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast({
        title: "❌ Erro no cadastro",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                    <Input id="nome" name="nome" placeholder="Digite o nome completo" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input id="cpf" name="cpf" placeholder="000.000.000-00" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input id="rg" placeholder="00.000.000-0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nascimento">Data de Nascimento</Label>
                    <Input id="nascimento" name="nascimento" type="date" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input id="telefone" name="telefone" placeholder="(11) 99999-9999" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" placeholder="email@exemplo.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo *</Label>
                  <Input id="endereco" name="endereco" placeholder="Rua, número, bairro, cidade - CEP" required />
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
                  <Select value={selectedBeneficiario} onValueChange={setSelectedBeneficiario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o beneficiário responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiarios.map((beneficiario) => (
                        <SelectItem key={beneficiario.id} value={beneficiario.id}>
                          {beneficiario.nome}
                        </SelectItem>
                      ))}
                      {beneficiarios.length === 0 && (
                        <SelectItem value="" disabled>
                          Nenhum beneficiário ativo encontrado
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome-dependente">Nome Completo *</Label>
                    <Input id="nome-dependente" name="nome-dependente" placeholder="Digite o nome completo" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nascimento-dependente">Data de Nascimento *</Label>
                    <Input id="nascimento-dependente" name="nascimento-dependente" type="date" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentesco">Parentesco *</Label>
                    <Select value={selectedParentesco} onValueChange={setSelectedParentesco}>
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
                    <Input id="cpf-dependente" name="cpf-dependente" placeholder="000.000.000-00" />
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
                    <Input id="nome-doador" name="nome-doador" placeholder="Digite o nome completo" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo-doador">Tipo de Doador</Label>
                    <Select value={selectedTipoDoador} onValueChange={setSelectedTipoDoador}>
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
                    <Input id="documento-doador" name="documento-doador" placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone-doador">Telefone</Label>
                    <Input id="telefone-doador" name="telefone-doador" placeholder="(11) 99999-9999" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-doador">E-mail</Label>
                    <Input id="email-doador" name="email-doador" type="email" placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequencia">Frequência de Doação</Label>
                    <Select value={selectedFrequencia} onValueChange={setSelectedFrequencia}>
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
                  <Input id="endereco-doador" name="endereco-doador" placeholder="Rua, número, bairro, cidade - CEP" />
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
                      <Input id="nome-voluntario" name="nome-voluntario" placeholder="Digite o nome completo" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf-voluntario">CPF *</Label>
                      <Input id="cpf-voluntario" name="cpf-voluntario" placeholder="000.000.000-00" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone-voluntario">Telefone *</Label>
                      <Input id="telefone-voluntario" name="telefone-voluntario" placeholder="(11) 99999-9999" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-voluntario">E-mail *</Label>
                      <Input id="email-voluntario" name="email-voluntario" type="email" placeholder="email@exemplo.com" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="funcao">Função/Área de Atuação</Label>
                      <Select value={selectedFuncao} onValueChange={setSelectedFuncao}>
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
                      <Select value={selectedDisponibilidade} onValueChange={setSelectedDisponibilidade}>
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
                    <Input id="endereco-voluntario" name="endereco-voluntario" placeholder="Rua, número, bairro, cidade - CEP" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experiencia">Experiência/Habilidades</Label>
                    <Textarea 
                      id="experiencia" 
                      name="experiencia"
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
