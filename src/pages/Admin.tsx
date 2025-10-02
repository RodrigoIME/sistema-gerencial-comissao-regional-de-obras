import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, UserCheck, UserX, Clock, FileText, Upload } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  requested_modules: string[];
  status: string;
  requested_at: string;
}

interface AdminLog {
  id: string;
  action: string;
  created_at: string;
  details: any;
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const { isAdmin, loading } = useUserRole(user);
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
      fetchLogs();
    }
  }, [isAdmin]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('user_registration_requests')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar solicitações:', error);
      toast.error('Erro ao carregar solicitações');
    } else {
      setRequests(data || []);
    }
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Erro ao buscar logs:', error);
    } else {
      setLogs(data || []);
    }
  };

  const handleApprove = async (request: RegistrationRequest) => {
    try {
      // Criar usuário via função edge
      const { data, error } = await supabase.functions.invoke('approve-user-registration', {
        body: {
          requestId: request.id,
          approve: true,
          requestedModules: request.requested_modules,
          name: request.name,
          email: request.email,
        }
      });

      if (error) throw error;

      // Log da ação
      await supabase.from('admin_logs').insert({
        admin_id: user?.id,
        action: 'Aprovação de cadastro',
        details: {
          email: request.email,
          modules: request.requested_modules,
        }
      });

      toast.success(`Cadastro de ${request.name} aprovado com sucesso!`);
      fetchRequests();
      fetchLogs();
    } catch (error: any) {
      console.error('Erro ao aprovar cadastro:', error);
      toast.error('Erro ao aprovar cadastro: ' + error.message);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      await supabase
        .from('user_registration_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedRequest.id);

      // Log da ação
      await supabase.from('admin_logs').insert({
        admin_id: user?.id,
        action: 'Rejeição de cadastro',
        details: {
          email: selectedRequest.email,
          reason: rejectionReason,
        }
      });

      toast.success('Solicitação rejeitada');
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedRequest(null);
      fetchRequests();
      fetchLogs();
    } catch (error) {
      console.error('Erro ao rejeitar cadastro:', error);
      toast.error('Erro ao rejeitar cadastro');
    }
  };

  const getModuleName = (module: string) => {
    const names: Record<string, string> = {
      vistorias: 'Vistorias',
      projetos: 'Projetos',
      fiscalizacao: 'Fiscalização de Obras',
    };
    return names[module] || module;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie usuários e visualize logs do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">
            <Clock className="h-4 w-4 mr-2" />
            Solicitações de Cadastro
            {requests.length > 0 && (
              <Badge variant="destructive" className="ml-2">{requests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="h-4 w-4 mr-2" />
            Logs do Sistema
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="h-4 w-4 mr-2" />
            Importar Dados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <div className="grid gap-4">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma solicitação pendente</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{request.name}</CardTitle>
                        <CardDescription>{request.email}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {format(new Date(request.requested_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Módulos solicitados:</p>
                        <div className="flex flex-wrap gap-2">
                          {request.requested_modules.map((module) => (
                            <Badge key={module} variant="outline">
                              {getModuleName(module)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(request)}
                          className="gap-2"
                        >
                          <UserCheck className="h-4 w-4" />
                          Aprovar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectDialog(true);
                          }}
                          className="gap-2"
                        >
                          <UserX className="h-4 w-4" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Ações</CardTitle>
              <CardDescription>Últimas 50 ações administrativas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    {log.details && (
                      <Badge variant="outline" className="ml-2">
                        {log.details.email}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Importar Vistorias</CardTitle>
              <CardDescription>Importe dados de vistorias em lote</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/importar-vistorias")} className="gap-2">
                <Upload className="h-4 w-4" />
                Ir para Importação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Solicitação</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição para {selectedRequest?.name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo da rejeição..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
