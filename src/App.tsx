import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Solicitacoes from "./pages/Solicitacoes";
import NovaSolicitacao from "./pages/NovaSolicitacao";
import Cadastros from "./pages/Cadastros";
import SolicitacaoDetalhes from "./pages/SolicitacaoDetalhes";
import EditarSolicitacao from "./pages/EditarSolicitacao";
import Admin from "./pages/Admin";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import ProjetosDashboard from "./pages/projetos/Dashboard";
import ProjetosLista from "./pages/projetos/Lista";
import NovoProjeto from "./pages/projetos/Novo";
import ProjetoDetalhes from "./pages/projetos/Detalhes";
import EditarProjeto from "./pages/projetos/Editar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/solicitacoes" element={<Solicitacoes />} />
        <Route path="/nova-solicitacao" element={<NovaSolicitacao />} />
        <Route path="/cadastros" element={<Cadastros />} />
        <Route path="/solicitacao/:id" element={<SolicitacaoDetalhes />} />
        <Route path="/solicitacao/:id/editar" element={<EditarSolicitacao />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/projetos" element={<ProjetosDashboard />} />
        <Route path="/projetos/lista" element={<ProjetosLista />} />
        <Route path="/projetos/novo" element={<NovoProjeto />} />
        <Route path="/projetos/:id" element={<ProjetoDetalhes />} />
        <Route path="/projetos/:id/editar" element={<EditarProjeto />} />
        <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
