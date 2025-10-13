import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProjetoStats } from "@/components/projetos/ProjetoStats";
import { useToast } from "@/hooks/use-toast";
import {
  FolderKanban,
  Plus,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  List,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const STATUS_COLORS = {
  "Em Andamento": "#22c55e",
  "Em Pausa": "#eab308",
  "Concluído": "#3b82f6",
  "Cancelado": "#ef4444",
};

export default function ProjetosDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    emAndamento: 0,
    atrasados: 0,
    valorTotal: 0,
  });
  const [statusData, setStatusData] = useState<any[]>([]);
  const [diretoriaData, setDiretoriaData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar todos os projetos
      const { data: projetos, error } = await supabase
        .from("projetos")
        .select("*");

      if (error) throw error;

      if (!projetos) {
        setLoading(false);
        return;
      }

      // Calcular estatísticas
      const total = projetos.length;
      const emAndamento = projetos.filter((p) => p.status === "Em Andamento").length;
      const atrasados = projetos.filter((p) => {
        if (p.prazo_previsto && p.status !== "Concluído") {
          return new Date(p.prazo_previsto) < new Date();
        }
        return false;
      }).length;
      const valorTotal = projetos.reduce(
        (sum, p) => sum + Number(p.valor_estimado_dfd || 0),
        0
      );

      setStats({ total, emAndamento, atrasados, valorTotal });

      // Dados por status
      const statusCount = projetos.reduce((acc: any, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});

      setStatusData(
        Object.entries(statusCount).map(([name, value]) => ({
          name,
          value,
          color: STATUS_COLORS[name as keyof typeof STATUS_COLORS],
        }))
      );

      // Dados por diretoria
      const diretoriaCount = projetos.reduce((acc: any, p) => {
        acc[p.diretoria_responsavel] = (acc[p.diretoria_responsavel] || 0) + 1;
        return acc;
      }, {});

      setDiretoriaData(
        Object.entries(diretoriaCount).map(([name, total]) => ({
          name,
          total,
        }))
      );
    } catch (error: any) {
      console.error("Erro ao carregar dashboard:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-hidden="true" />
          <span className="text-lg text-muted-foreground">Carregando dados do dashboard...</span>
          <span className="sr-only">Carregando dados do dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Módulo de Projetos</h1>
          <p className="text-muted-foreground">
            Acompanhamento e gestão de projetos de engenharia
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/projetos/lista")}>
            <List className="h-4 w-4 mr-2" />
            Ver Lista
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ProjetoStats
          title="Total de Projetos"
          value={stats.total}
          icon={FolderKanban}
          description="Projetos cadastrados"
        />
        <ProjetoStats
          title="Em Andamento"
          value={stats.emAndamento}
          icon={TrendingUp}
          description="Projetos ativos"
        />
        <ProjetoStats
          title="Projetos Atrasados"
          value={stats.atrasados}
          icon={AlertTriangle}
          description="Além do prazo previsto"
        />
        <ProjetoStats
          title="Valor Total"
          value={stats.valorTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 0,
          })}
          icon={DollarSign}
          description="Valor estimado (DFD)"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Projetos por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Projetos por Diretoria */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos por Diretoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diretoriaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
