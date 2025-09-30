import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, Clock, Paperclip } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSolicitacoes: 0,
    totalVistorias: 0,
    totalAnexos: 0,
    pendentes: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [solicitacoes, vistorias, anexos, pendentes] = await Promise.all([
          supabase.from("solicitacoes").select("*", { count: "exact", head: true }),
          supabase.from("vistorias").select("*", { count: "exact", head: true }),
          supabase.from("anexos").select("*", { count: "exact", head: true }),
          supabase
            .from("solicitacoes")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        ]);

        setStats({
          totalSolicitacoes: solicitacoes.count || 0,
          totalVistorias: vistorias.count || 0,
          totalAnexos: anexos.count || 0,
          pendentes: pendentes.count || 0,
        });
      } catch (error: any) {
        toast.error("Erro ao carregar estatísticas");
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total de Solicitações",
      value: stats.totalSolicitacoes,
      icon: FileText,
      gradient: "from-primary to-primary/80",
    },
    {
      title: "Vistorias Realizadas",
      value: stats.totalVistorias,
      icon: CheckCircle2,
      gradient: "from-secondary to-secondary/80",
    },
    {
      title: "Solicitações Pendentes",
      value: stats.pendentes,
      icon: Clock,
      gradient: "from-accent to-accent/80",
    },
    {
      title: "Arquivos Anexados",
      value: stats.totalAnexos,
      icon: Paperclip,
      gradient: "from-destructive to-destructive/80",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do sistema de inspeções
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card
            key={card.title}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Bem-vindo ao Sistema de Inspeções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Este sistema permite gerenciar solicitações de inspeção, registrar vistorias
            e anexar documentos relevantes. Use o menu lateral para navegar entre as
            diferentes seções.
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <FileText className="w-4 h-4" />
              Gerenciamento de Solicitações
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Registro de Vistorias
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
              <Paperclip className="w-4 h-4" />
              Upload de Documentos
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
