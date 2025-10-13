import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjetosService, CreateProjetoDTO } from "@/services/projetos.service";
import { useToast } from "./use-toast";

export const useCreateProjeto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateProjetoDTO) => ProjetosService.create(data),
    onSuccess: (projeto) => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
      toast({
        title: "Projeto criado com sucesso!",
        description: `OPUS: ${projeto.numero_opus}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.userMessage || "Erro ao criar projeto",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProjeto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: { id: string; data: Partial<CreateProjetoDTO> }) =>
      ProjetosService.update(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
      toast({
        title: "Sucesso",
        description: "Projeto atualizado com sucesso",
      });
    },
  });
};

export const useChangeProjetoStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: {
      id: string;
      status: "Em Andamento" | "Em Pausa" | "Concluído" | "Cancelado";
      motivo?: string;
    }) => ProjetosService.changeStatus(params.id, params.status, params.motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
      toast({
        title: "Sucesso",
        description: "Status do projeto alterado com sucesso",
      });
    },
  });
};

export const useDeleteProjeto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ProjetosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
      toast({
        title: "Sucesso",
        description: "Projeto deletado com sucesso",
      });
    },
  });
};
