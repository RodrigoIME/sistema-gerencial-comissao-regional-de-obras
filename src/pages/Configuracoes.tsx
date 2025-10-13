import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Lock, Building2, Phone, Mail, Camera, Save, ArrowLeft } from "lucide-react";
import { formatarTelefone } from "@/lib/phoneFormatter";

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  nome_guerra: string | null;
  posto_graduacao: string | null;
  organizacao_militar_id: number | null;
  telefone: string | null;
  telefone_alternativo: string | null;
  avatar_url: string | null;
}

interface Organizacao {
  id: number;
  nome: string;
  sigla: string;
}

const POSTOS_GRADUACOES = [
  "Marechal",
  "General de Exército",
  "General de Divisão",
  "General de Brigada",
  "Coronel",
  "Tenente-Coronel",
  "Major",
  "Capitão",
  "1º Tenente",
  "2º Tenente",
  "Aspirante a Oficial",
  "Subtenente",
  "1º Sargento",
  "2º Sargento",
  "3º Sargento",
  "Cabo",
  "Soldado",
  "Civil",
];

const ORGANIZACOES_PERMITIDAS_SIGLAS = ['CRO 1', '5º Gpt E'];

const Configuracoes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  
  const [nome, setNome] = useState("");
  const [nomeGuerra, setNomeGuerra] = useState("");
  const [postoGraduacao, setPostoGraduacao] = useState("");
  const [organizacaoId, setOrganizacaoId] = useState("");
  const [telefone, setTelefone] = useState("");
  const [telefoneAlternativo, setTelefoneAlternativo] = useState("");
  
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
    loadUserData();
    loadOrganizacoes();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserEmail(user.email || "");

      const { data: profileData, error: profileError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      if (profileData) {
        setProfile(profileData);
        setNome(profileData.nome || "");
        setNomeGuerra(profileData.nome_guerra || "");
        setPostoGraduacao(profileData.posto_graduacao || "");
        setOrganizacaoId(profileData.organizacao_militar_id?.toString() || "");
        setTelefone(profileData.telefone || "");
        setTelefoneAlternativo(profileData.telefone_alternativo || "");
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do usuário");
    }
  };

  const loadOrganizacoes = async () => {
    const { data, error } = await supabase
      .from("organizacoes")
      .select("id, \"Organização Militar\", \"Sigla da OM\"")
      .in("Sigla da OM", ORGANIZACOES_PERMITIDAS_SIGLAS)
      .order("\"Organização Militar\"");

    if (error) {
      console.error("Erro ao carregar organizações:", error);
      return;
    }

    const mapped: Organizacao[] = (data || []).map((org: any) => ({
      id: org.id,
      nome: org["Organização Militar"],
      sigla: org["Sigla da OM"],
    }));

    setOrganizacoes(mapped);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      const profileData = {
        nome: nome,
        nome_guerra: nomeGuerra || null,
        posto_graduacao: postoGraduacao || null,
        organizacao_militar_id: organizacaoId ? parseInt(organizacaoId) : null,
        telefone: telefone || null,
        telefone_alternativo: telefoneAlternativo || null,
      };

      const { error } = await supabase
        .from("usuarios")
        .update(profileData)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      await loadUserData();
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (novaSenha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro ao alterar senha: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo: 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("anexos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("anexos")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success("Foto de perfil atualizada!");
      await loadUserData();
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao atualizar foto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>
                Clique na imagem para alterar sua foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="relative group cursor-pointer">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {nome ? getInitials(nome) : "U"}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-medium">{nome || "Usuário"}</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
                {nomeGuerra && (
                  <p className="text-sm text-muted-foreground">
                    Nome de guerra: {nomeGuerra}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais e informações de contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">
                      Nome Completo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomeGuerra">Nome de Guerra</Label>
                    <Input
                      id="nomeGuerra"
                      value={nomeGuerra}
                      onChange={(e) => setNomeGuerra(e.target.value)}
                      placeholder="Nome de guerra (opcional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postoGraduacao">Posto/Graduação</Label>
                    <Select value={postoGraduacao} onValueChange={setPostoGraduacao}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu posto/graduação" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSTOS_GRADUACOES.map((posto) => (
                          <SelectItem key={posto} value={posto}>
                            {posto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizacao">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Organização Militar
                    </Label>
                    <Select value={organizacaoId} onValueChange={setOrganizacaoId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua OM" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizacoes.map((org) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.sigla} - {org.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telefone Principal
                    </Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefoneAlt">Telefone Alternativo</Label>
                    <Input
                      id="telefoneAlt"
                      value={telefoneAlternativo}
                      onChange={(e) => setTelefoneAlternativo(formatarTelefone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-1" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado. Entre em contato com o administrador se necessário.
                  </p>
                </div>

                <Button type="submit" disabled={loading} className="gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Mantenha sua conta segura alterando sua senha regularmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Digite a nova senha"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 6 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Confirme a nova senha"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="gap-2">
                  <Lock className="w-4 h-4" />
                  {loading ? "Alterando..." : "Alterar Senha"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
